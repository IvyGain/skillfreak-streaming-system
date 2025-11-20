/**
 * LarkBase APIクライアント
 *
 * イベント管理テーブルとの統合
 */

import * as lark from '@larksuiteoapi/node-sdk';

// Larkクライアント
let client: lark.Client | null = null;

function getLarkClient(): lark.Client {
  if (!client) {
    client = new lark.Client({
      appId: process.env.LARK_APP_ID!,
      appSecret: process.env.LARK_APP_SECRET!,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Lark,
    });
  }
  return client;
}

/**
 * イベント型定義
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  youtube_url?: string;
  archive_file_token?: string;
  archive_url?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'members-only';
  published_at?: string;
  created_at: string;
}

/**
 * 全イベントを取得
 */
export async function getAllEvents(options?: {
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'members-only';
  limit?: number;
}): Promise<Event[]> {
  const client = getLarkClient();

  try {
    const res = await client.bitable.appTableRecord.list({
      path: {
        app_token: process.env.LARKBASE_APP_TOKEN!,
        table_id: process.env.LARKBASE_TABLE_ID!,
      },
      params: {
        page_size: options?.limit || 100,
      },
    });

    if (res.code !== 0) {
      throw new Error(`Failed to get events: ${res.msg}`);
    }

    // レコードをEvent型に変換（LarkBaseの日本語フィールド名をマッピング）
    const items = res.data?.items || [];
    const events: Event[] = items.map((item: any) => {
      const fields = item.fields;

      // イベント開始日時（ミリ秒からISO文字列に変換）
      const scheduledAt = fields['イベント開始日時']
        ? new Date(fields['イベント開始日時']).toISOString()
        : new Date().toISOString();

      return {
        id: item.record_id,
        title: fields['イベントタイトル'] || fields['イベント']?.[0]?.text || 'タイトル未設定',
        description: fields['告知用文章'] || '',
        scheduled_at: scheduledAt,
        youtube_url: fields['YouTube URL'] || fields['セミナーURL']?.link || '',
        archive_file_token: fields['アーカイブファイルトークン'] || '',
        archive_url: fields['セミナーURL']?.link || fields['アーカイブURL'] || '',
        status: 'published', // LarkBaseのデータは全て公開済みとして扱う
        visibility: 'public', // デフォルトで公開
        published_at: scheduledAt,
        created_at: scheduledAt,
      };
    });

    // フィルタリング
    let filtered = events;
    if (options?.status) {
      filtered = filtered.filter(e => e.status === options.status);
    }
    if (options?.visibility) {
      filtered = filtered.filter(e => e.visibility === options.visibility);
    }

    // 開催日時でソート（新しい順）
    return filtered.sort((a, b) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    );

  } catch (error) {
    console.error('Failed to get events:', error);
    throw error;
  }
}

/**
 * イベント詳細を取得
 */
export async function getEventById(id: string): Promise<Event | null> {
  const client = getLarkClient();

  try {
    const res = await client.bitable.appTableRecord.get({
      path: {
        app_token: process.env.LARKBASE_APP_TOKEN!,
        table_id: process.env.LARKBASE_TABLE_ID!,
        record_id: id,
      },
    });

    if (res.code !== 0) {
      return null;
    }

    const item = res.data?.record;
    if (!item) {
      return null;
    }

    return {
      id: String(item.record_id || ''),
      title: String(item.fields?.['title'] || ''),
      description: String(item.fields?.['description'] || ''),
      scheduled_at: String(item.fields?.['scheduled_at'] || ''),
      youtube_url: String(item.fields?.['youtube_url'] || ''),
      archive_file_token: String(item.fields?.['archive_file_token'] || ''),
      archive_url: String(item.fields?.['archive_url'] || ''),
      status: (item.fields?.['status'] as 'draft' | 'published' | 'archived') || 'draft',
      visibility: (item.fields?.['visibility'] as 'public' | 'members-only') || 'public',
      published_at: String(item.fields?.['published_at'] || ''),
      created_at: String(item.fields?.['created_at'] || ''),
    };

  } catch (error) {
    console.error('Failed to get event:', error);
    return null;
  }
}

/**
 * アーカイブありのイベントのみ取得
 */
export async function getArchivedEvents(): Promise<Event[]> {
  const events = await getAllEvents({ status: 'published' });
  return events.filter(e => e.archive_file_token || e.archive_url);
}

export default {
  getAllEvents,
  getEventById,
  getArchivedEvents,
};
