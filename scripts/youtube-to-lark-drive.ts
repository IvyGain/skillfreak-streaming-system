#!/usr/bin/env ts-node
/**
 * YouTube Live → Lark Drive自動アーカイブシステム
 *
 * フロー:
 * 1. YouTube動画をダウンロード（yt-dlp）
 * 2. Lark Driveにアップロード
 * 3. LarkBaseにメタデータ登録
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as lark from '@larksuiteoapi/node-sdk';
import { uploadVideoToLark } from '../lib/lark-client';
import dotenv from 'dotenv';

dotenv.config();

// 設定
const DOWNLOAD_DIR = './downloads';
const LARK_DRIVE_FOLDER_TOKEN = process.env.LARK_DRIVE_FOLDER_ID!;
const LARKBASE_APP_TOKEN = process.env.LARKBASE_APP_TOKEN!;
const LARKBASE_TABLE_ID = process.env.LARKBASE_TABLE_ID!;

// Larkクライアント
const client = new lark.Client({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Lark,
});

interface VideoMetadata {
  id: string;
  title: string;
  upload_date: string;
  duration: number;
  youtube_url: string;
  thumbnail: string;
}

/**
 * YouTube動画をダウンロード
 */
async function downloadYouTubeVideo(videoUrl: string): Promise<VideoMetadata> {
  console.log(`\n📥 ダウンロード開始: ${videoUrl}`);

  // yt-dlpでダウンロード
  const ytdlpCmd = '/Users/mashimaro/Library/Python/3.12/bin/yt-dlp';
  const cmd = `${ytdlpCmd} \
    --format 'bestvideo[height<=1080]+bestaudio/best' \
    --merge-output-format mp4 \
    --write-info-json \
    --write-thumbnail \
    -o "${DOWNLOAD_DIR}/%(id)s.%(ext)s" \
    "${videoUrl}"`;

  execSync(cmd, { stdio: 'inherit' });

  // メタデータ読み込み
  const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.info.json'));
  if (files.length === 0) {
    throw new Error('メタデータファイルが見つかりません');
  }

  const metaFile = path.join(DOWNLOAD_DIR, files[files.length - 1]);
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));

  return {
    id: meta.id,
    title: meta.title,
    upload_date: meta.upload_date,
    duration: meta.duration,
    youtube_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
  };
}

/**
 * LarkBaseにメタデータを登録
 */
async function registerToLarkBase(
  metadata: VideoMetadata,
  fileToken: string
): Promise<string> {
  console.log('\n📝 LarkBaseに登録中...');

  const res = await client.bitable.appTableRecord.create({
    path: {
      app_token: LARKBASE_APP_TOKEN,
      table_id: LARKBASE_TABLE_ID,
    },
    data: {
      fields: {
        title: metadata.title,
        description: `YouTube ID: ${metadata.id}`,
        scheduled_at: formatDate(metadata.upload_date),
        youtube_url: metadata.youtube_url,
        archive_file_token: fileToken,
        status: 'published',
        visibility: 'public',
        published_at: formatDate(metadata.upload_date),
        created_at: new Date().toISOString(),
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`LarkBase登録失敗: ${res.msg}`);
  }

  console.log(`✅ LarkBase登録完了: ${res.data.record.record_id}`);
  return res.data.record.record_id;
}

/**
 * 日付フォーマット（YYYYMMDD → ISO 8601）
 */
function formatDate(dateStr: string): string {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}T00:00:00Z`;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('使い方: ts-node youtube-to-lark-drive.ts <YouTube URL>');
    console.error('例: ts-node youtube-to-lark-drive.ts https://www.youtube.com/watch?v=xxxxx');
    process.exit(1);
  }

  const videoUrl = args[0];

  // ディレクトリ作成
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  console.log('🎬 YouTube → Lark Drive 自動アーカイブ開始');
  console.log('='.repeat(60));

  try {
    // 1. YouTube動画ダウンロード
    const metadata = await downloadYouTubeVideo(videoUrl);
    console.log(`✅ ダウンロード完了: ${metadata.title}`);

    // 2. Lark Driveにアップロード
    const videoFile = path.join(DOWNLOAD_DIR, `${metadata.id}.mp4`);
    if (!fs.existsSync(videoFile)) {
      throw new Error(`動画ファイルが見つかりません: ${videoFile}`);
    }

    console.log('\n📤 Lark Driveにアップロード中...');
    const fileToken = await uploadVideoToLark(videoFile, LARK_DRIVE_FOLDER_TOKEN);
    console.log(`✅ アップロード完了: ${fileToken}`);

    // 3. LarkBaseに登録
    const recordId = await registerToLarkBase(metadata, fileToken);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 処理完了！');
    console.log(`\n📊 LarkBase Record ID: ${recordId}`);
    console.log(`📎 Lark Drive File Token: ${fileToken}`);
    console.log(`🎥 動画タイトル: ${metadata.title}`);
    console.log(`\nPortalで確認: http://localhost:3000/events/${recordId}`);

    // クリーンアップ（オプション）
    console.log('\n🧹 ローカルファイルを削除...');
    fs.unlinkSync(videoFile);
    fs.unlinkSync(path.join(DOWNLOAD_DIR, `${metadata.id}.info.json`));
    console.log('✅ クリーンアップ完了');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
