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

    // レコードをEvent型に変換
    const events: Event[] = res.data.items.map((item: any) => ({
      id: item.record_id,
      title: item.fields.title,
      description: item.fields.description || '',
      scheduled_at: item.fields.scheduled_at,
      youtube_url: item.fields.youtube_url,
      archive_file_token: item.fields.archive_file_token,
      archive_url: item.fields.archive_url,
      status: item.fields.status || 'draft',
      visibility: item.fields.visibility || 'public',
      published_at: item.fields.published_at,
      created_at: item.fields.created_at,
    }));

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

    const item = res.data.record;
    return {
      id: item.record_id,
      title: item.fields.title,
      description: item.fields.description || '',
      scheduled_at: item.fields.scheduled_at,
      youtube_url: item.fields.youtube_url,
      archive_file_token: item.fields.archive_file_token,
      archive_url: item.fields.archive_url,
      status: item.fields.status || 'draft',
      visibility: item.fields.visibility || 'public',
      published_at: item.fields.published_at,
      created_at: item.fields.created_at,
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
