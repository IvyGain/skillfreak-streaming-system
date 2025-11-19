import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { writeFile, unlink, stat } from 'fs/promises';
import { createReadStream } from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT!,
  region: 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});

// HMAC署名検証
function verifySignature(payload: any, signature: string): boolean {
  if (!process.env.WEBHOOK_SECRET) return false;

  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// 動画時間を取得
function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);

    let output = '';
    ffprobe.stdout.on('data', (data) => output += data);
    ffprobe.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(output));
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
    ffprobe.on('error', reject);
  });
}

// ダウンロード処理
async function processDownload(
  job_id: string,
  youtube_url: string,
  video_id: string,
  title: string,
  speaker: string,
  event_date: string
) {
  try {
    // ステータス更新: downloading
    await supabase
      .from('download_jobs')
      .update({
        status: 'downloading',
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', job_id);

    // yt-dlpでダウンロード
    const outputPath = `/tmp/${video_id}.mp4`;

    await new Promise((resolve, reject) => {
      const args = [
        '--format', 'bestvideo[height<=1080]+bestaudio/best',
        '-o', outputPath,
        youtube_url
      ];

      // クッキーファイルがあれば追加
      if (process.env.YOUTUBE_COOKIES_PATH) {
        args.unshift('--cookies', process.env.YOUTUBE_COOKIES_PATH);
      }

      const ytdlp = spawn('yt-dlp', args);

      ytdlp.stderr.on('data', (data) => {
        console.log(`yt-dlp: ${data}`);
      });

      ytdlp.on('close', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error(`yt-dlp exited with code ${code}`));
      });

      ytdlp.on('error', reject);
    });

    // ステータス更新: uploading
    await supabase
      .from('download_jobs')
      .update({
        status: 'uploading',
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', job_id);

    // ファイルサイズ取得
    const stats = await stat(outputPath);
    const fileSize = stats.size;

    // Backblaze B2にアップロード
    const fileStream = createReadStream(outputPath);
    const bucketName = process.env.B2_BUCKET_NAME || 'skillfreak-archives';
    const filePath = `videos/${video_id}.mp4`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: fileStream,
      ContentType: 'video/mp4',
      ContentLength: fileSize,
    }));

    // 動画時間を取得
    const duration = await getVideoDuration(outputPath);

    // メタデータをSupabaseに保存
    const { error: metadataError } = await supabase
      .from('archives')
      .insert({
        video_id,
        title,
        speaker,
        event_date: new Date(event_date).toISOString(),
        file_path: filePath,
        file_size: fileSize,
        duration: Math.floor(duration),
        status: 'ready',
        created_at: new Date().toISOString(),
      });

    if (metadataError) throw metadataError;

    // ステータス更新: completed
    await supabase
      .from('download_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('job_id', job_id);

    // VPSにプレイリスト更新通知
    if (process.env.VPS_WEBHOOK_URL) {
      await fetch(process.env.VPS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_playlist',
          video_id,
          file_path: filePath,
        }),
      });
    }

    // 一時ファイル削除
    await unlink(outputPath);

  } catch (error: any) {
    console.error('Download process error:', error);
    await supabase
      .from('download_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', job_id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-lark-signature') || req.headers.get('x-webhook-signature') || '';

    // 署名検証（本番環境のみ）
    if (process.env.NODE_ENV === 'production' && !verifySignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const {
      youtube_url,
      video_id,
      title,
      speaker,
      event_date,
      lark_record_id
    } = payload;

    // 必須フィールドチェック
    if (!youtube_url || !video_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: youtube_url, video_id, title' },
        { status: 400 }
      );
    }

    // ジョブID生成
    const job_id = `job_${Date.now()}_${video_id}`;

    // Supabaseにジョブ登録
    const { error: jobError } = await supabase
      .from('download_jobs')
      .insert({
        job_id,
        youtube_url,
        video_id,
        title,
        speaker: speaker || 'Unknown',
        event_date: event_date ? new Date(event_date).toISOString() : null,
        lark_record_id,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (jobError) {
      console.error('Job registration error:', jobError);
      return NextResponse.json(
        { error: 'Failed to register download job', details: jobError.message },
        { status: 500 }
      );
    }

    // 非同期でダウンロード開始（バックグラウンド処理）
    processDownload(
      job_id,
      youtube_url,
      video_id,
      title,
      speaker || 'Unknown',
      event_date || new Date().toISOString()
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      job_id,
      message: 'Download job started',
      estimated_time: 300, // 5分
    });

  } catch (error: any) {
    console.error('Archive webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET: ジョブステータス確認
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const job_id = searchParams.get('job_id');

    if (!job_id) {
      return NextResponse.json(
        { error: 'Missing job_id parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('download_jobs')
      .select('*')
      .eq('job_id', job_id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Get job status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
