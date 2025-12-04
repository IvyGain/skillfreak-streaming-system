/**
 * Lark Webhook API - Larkからのイベント通知を処理
 *
 * POST: Larkイベント通知を受信・処理
 *   - 署名検証（HMAC-SHA256）
 *   - イベントタイプ: file.uploaded, message.receive
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import * as lark from '@larksuiteoapi/node-sdk';

/**
 * Lark Webhookイベント型定義
 */
interface LarkWebhookEvent {
  schema: string;
  header: {
    event_id: string;
    event_type: string;
    create_time: string;
    token: string;
    app_id: string;
    tenant_key: string;
  };
  event: any;
}

/**
 * POST: Lark Webhookイベントを処理
 *
 * @body {LarkWebhookEvent} event - Larkからのイベントペイロード
 * @headers {string} X-Lark-Request-Timestamp - リクエストタイムスタンプ
 * @headers {string} X-Lark-Request-Nonce - ノンス
 * @headers {string} X-Lark-Signature - HMAC-SHA256署名
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 署名検証
    const isValid = await verifyLarkSignature(req);
    if (!isValid) {
      console.error('[lark-webhook] Invalid signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body: LarkWebhookEvent = await req.json();

    // URL検証チャレンジ（初回セットアップ時）
    if (body.header?.event_type === 'url_verification') {
      const challenge = (body.event as any)?.challenge;
      console.log('[lark-webhook] URL verification challenge received');
      return NextResponse.json({ challenge });
    }

    console.log('[lark-webhook] Event received:', {
      type: body.header?.event_type,
      eventId: body.header?.event_id,
    });

    // イベントタイプごとに処理
    switch (body.header?.event_type) {
      case 'drive.file.created_v1':
      case 'drive.file.uploaded':
        await handleFileUploaded(body.event);
        break;

      case 'im.message.receive_v1':
      case 'message.receive':
        await handleMessageReceive(body.event);
        break;

      case 'drive.file.title_updated_v1':
        await handleFileUpdated(body.event);
        break;

      case 'drive.file.trashed_v1':
        await handleFileDeleted(body.event);
        break;

      default:
        console.log(`[lark-webhook] Unhandled event type: ${body.header?.event_type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[lark-webhook] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Lark署名検証（HMAC-SHA256）
 */
async function verifyLarkSignature(req: NextRequest): Promise<boolean> {
  const encryptKey = process.env.LARK_ENCRYPT_KEY || process.env.LARK_WEBHOOK_SECRET;

  // 開発環境では署名検証をスキップ
  if (!encryptKey) {
    console.warn('[lark-webhook] LARK_ENCRYPT_KEY not set, skipping signature verification');
    return true;
  }

  try {
    const timestamp = req.headers.get('X-Lark-Request-Timestamp');
    const nonce = req.headers.get('X-Lark-Request-Nonce');
    const signature = req.headers.get('X-Lark-Signature');

    if (!timestamp || !nonce || !signature) {
      console.error('[lark-webhook] Missing signature headers');
      return false;
    }

    // タイムスタンプチェック（5分以内）
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    if (Math.abs(now - requestTime) > 300) {
      console.error('[lark-webhook] Request timestamp expired');
      return false;
    }

    // 署名計算
    const body = await req.text();
    const signString = `${timestamp}${nonce}${encryptKey}${body}`;
    const calculatedSignature = createHmac('sha256', encryptKey)
      .update(signString)
      .digest('hex');

    return signature === calculatedSignature;
  } catch (error) {
    console.error('[lark-webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * ファイルアップロードイベント処理
 */
async function handleFileUploaded(event: any): Promise<void> {
  console.log('[lark-webhook] File uploaded:', {
    fileToken: event.file_token,
    fileName: event.file_name,
    fileType: event.file_type,
  });

  // アーカイブ動画の場合
  if (event.file_type === 'video' || event.file_name?.endsWith('.mp4')) {
    console.log('[lark-webhook] Video file detected, triggering archive process');

    // TODO: LarkBaseにイベント登録
    // await registerVideoToLarkBase({
    //   fileToken: event.file_token,
    //   fileName: event.file_name,
    //   fileSize: event.file_size,
    // });

    // TODO: プレイリストに追加
    // await fetch('/api/stream/playlist', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     action: 'refresh',
    //   }),
    // });
  }
}

/**
 * メッセージ受信イベント処理
 */
async function handleMessageReceive(event: any): Promise<void> {
  console.log('[lark-webhook] Message received:', {
    messageId: event.message?.message_id,
    chatId: event.message?.chat_id,
    messageType: event.message?.message_type,
  });

  // TODO: ボットコマンド処理
  // 例: /archive [YouTube URL] でアーカイブトリガー
  const content = event.message?.content;
  if (content) {
    try {
      const parsed = JSON.parse(content);
      const text = parsed.text || '';

      if (text.startsWith('/archive')) {
        const url = text.split(' ')[1];
        if (url) {
          console.log('[lark-webhook] Archive command received:', url);
          // TODO: YouTube→Lark Driveアーカイブを開始
        }
      }
    } catch (error) {
      // JSON parse error - ignore
    }
  }
}

/**
 * ファイル更新イベント処理
 */
async function handleFileUpdated(event: any): Promise<void> {
  console.log('[lark-webhook] File updated:', {
    fileToken: event.file_token,
    newTitle: event.new_title,
  });

  // TODO: LarkBaseのイベントタイトルを更新
}

/**
 * ファイル削除イベント処理
 */
async function handleFileDeleted(event: any): Promise<void> {
  console.log('[lark-webhook] File deleted:', {
    fileToken: event.file_token,
  });

  // TODO: プレイリストから削除
  // await fetch('/api/stream/playlist', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     action: 'remove',
  //     videoId: event.file_token,
  //   }),
  // });
}
