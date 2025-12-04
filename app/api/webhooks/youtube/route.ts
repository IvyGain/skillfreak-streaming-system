/**
 * YouTube Webhook API - YouTube配信終了通知を処理
 *
 * POST: YouTube配信終了通知を受信し、自動アーカイブをトリガー
 *   - PubSubHubbub (WebSub) プロトコル対応
 *   - YouTube Data API v3 push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { parseStringPromise } from 'xml2js';
import { execSync } from 'child_process';

/**
 * GET: PubSubHubbub検証チャレンジ
 *
 * @query {string} hub.challenge - YouTubeからのチャレンジトークン
 * @query {string} hub.mode - subscribe または unsubscribe
 * @query {string} hub.topic - チャンネルURL
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const challenge = searchParams.get('hub.challenge');
    const mode = searchParams.get('hub.mode');
    const topic = searchParams.get('hub.topic');

    console.log('[youtube-webhook] Verification request:', { mode, topic });

    // チャレンジレスポンス
    if (challenge && mode === 'subscribe') {
      console.log('[youtube-webhook] Subscription verified');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[youtube-webhook] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process verification',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: YouTube通知を処理
 *
 * @body {string} XML - Atom feed形式の通知
 * @headers {string} X-Hub-Signature - HMAC-SHA1署名（オプション）
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();

    // 署名検証（設定されている場合）
    const signature = req.headers.get('X-Hub-Signature');
    if (signature && process.env.YOUTUBE_WEBHOOK_SECRET) {
      const isValid = verifyYouTubeSignature(body, signature);
      if (!isValid) {
        console.error('[youtube-webhook] Invalid signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // XMLパース（Atom feed）
    const parsed = await parseStringPromise(body);
    const entry = parsed.feed?.entry?.[0];

    if (!entry) {
      console.log('[youtube-webhook] No entry found in feed');
      return NextResponse.json({ success: true });
    }

    const videoId = entry['yt:videoId']?.[0];
    const channelId = entry['yt:channelId']?.[0];
    const title = entry.title?.[0];
    const published = entry.published?.[0];
    const updated = entry.updated?.[0];

    console.log('[youtube-webhook] Notification received:', {
      videoId,
      channelId,
      title,
      published,
      updated,
    });

    // 配信終了判定（updatedがpublishedより後の場合）
    const isStreamEnded =
      published && updated && new Date(updated) > new Date(published);

    if (isStreamEnded && videoId) {
      console.log('[youtube-webhook] Stream ended, triggering archive:', videoId);
      await triggerArchive(videoId, title);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[youtube-webhook] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process notification',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * YouTube署名検証（HMAC-SHA1）
 */
function verifyYouTubeSignature(body: string, signature: string): boolean {
  const secret = process.env.YOUTUBE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[youtube-webhook] YOUTUBE_WEBHOOK_SECRET not set');
    return false;
  }

  try {
    // 署名フォーマット: sha1=<hash>
    const [algorithm, hash] = signature.split('=');
    if (algorithm !== 'sha1') {
      return false;
    }

    const calculatedHash = createHmac('sha1', secret)
      .update(body)
      .digest('hex');

    return hash === calculatedHash;
  } catch (error) {
    console.error('[youtube-webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * 自動アーカイブをトリガー
 */
async function triggerArchive(videoId: string, title?: string): Promise<void> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log('[youtube-webhook] Starting archive process:', {
    videoId,
    title,
    url: youtubeUrl,
  });

  try {
    // 方法1: 自動アーカイブAPIを呼び出し
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/archive/auto`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          eventTitle: title,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Archive API failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[youtube-webhook] Archive triggered successfully:', result);

    // 方法2: スクリプト直接実行（フォールバック）
    // Note: 本番環境では非推奨（セキュリティリスク）
    // const scriptPath = '/path/to/scripts/youtube-to-lark-drive.ts';
    // execSync(`npx ts-node ${scriptPath} "${youtubeUrl}"`, {
    //   stdio: 'inherit',
    // });
  } catch (error) {
    console.error('[youtube-webhook] Failed to trigger archive:', error);
    throw error;
  }
}

/**
 * YouTube PubSubHubbub購読登録（初回セットアップ用）
 *
 * 使用方法:
 * ```typescript
 * await subscribeToYouTubeChannel('UCxxxxxxxxxxxxxxx');
 * ```
 */
export async function subscribeToYouTubeChannel(channelId: string): Promise<void> {
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/youtube`;
  const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
  const hubUrl = 'https://pubsubhubbub.appspot.com/subscribe';

  const formData = new URLSearchParams({
    'hub.mode': 'subscribe',
    'hub.topic': topicUrl,
    'hub.callback': callbackUrl,
    'hub.verify': 'async',
    'hub.secret': process.env.YOUTUBE_WEBHOOK_SECRET || '',
  });

  console.log('[youtube-webhook] Subscribing to channel:', channelId);

  const response = await fetch(hubUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to subscribe: ${response.statusText}`);
  }

  console.log('[youtube-webhook] Subscription request sent successfully');
}
