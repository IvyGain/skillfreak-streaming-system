/**
 * PortalApp ↔ LarkBase 双方向同期システム
 */

import * as lark from '@larksuiteoapi/node-sdk';

const client = new lark.Client({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Lark,
});

export interface Event {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  youtube_url: string;
  archive_file_token?: string;
  status: 'draft' | 'scheduled' | 'live' | 'published';
  visibility: 'public' | 'members_only' | 'private';
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * LarkBaseから全イベントを取得
 */
export async function getAllEvents(): Promise<Event[]> {
  const res = await client.bitable.appTableRecord.list({
    path: {
      app_token: process.env.LARKBASE_APP_TOKEN!,
      table_id: process.env.LARKBASE_TABLE_ID!,
    },
    params: {
      page_size: 100,
      view_id: process.env.LARKBASE_VIEW_ID,
    },
  });

  if (res.code !== 0) {
    throw new Error(`Failed to fetch events: ${res.msg}`);
  }

  return res.data.items.map((item: any) => ({
    id: item.record_id,
    title: item.fields.title,
    description: item.fields.description || '',
    scheduled_at: item.fields.scheduled_at,
    youtube_url: item.fields.youtube_url || '',
    archive_file_token: item.fields.archive_file_token,
    status: item.fields.status || 'draft',
    visibility: item.fields.visibility || 'public',
    published_at: item.fields.published_at,
    created_at: item.fields.created_at,
    updated_at: item.fields.updated_at,
  }));
}

/**
 * 特定のイベントを取得
 */
export async function getEvent(recordId: string): Promise<Event> {
  const res = await client.bitable.appTableRecord.get({
    path: {
      app_token: process.env.LARKBASE_APP_TOKEN!,
      table_id: process.env.LARKBASE_TABLE_ID!,
      record_id: recordId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`Failed to fetch event: ${res.msg}`);
  }

  const item = res.data.record;
  return {
    id: item.record_id,
    title: item.fields.title,
    description: item.fields.description || '',
    scheduled_at: item.fields.scheduled_at,
    youtube_url: item.fields.youtube_url || '',
    archive_file_token: item.fields.archive_file_token,
    status: item.fields.status || 'draft',
    visibility: item.fields.visibility || 'public',
    published_at: item.fields.published_at,
    created_at: item.fields.created_at,
    updated_at: item.fields.updated_at,
  };
}

/**
 * イベントを作成
 */
export async function createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<string> {
  const res = await client.bitable.appTableRecord.create({
    path: {
      app_token: process.env.LARKBASE_APP_TOKEN!,
      table_id: process.env.LARKBASE_TABLE_ID!,
    },
    data: {
      fields: {
        title: event.title,
        description: event.description,
        scheduled_at: event.scheduled_at,
        youtube_url: event.youtube_url,
        archive_file_token: event.archive_file_token,
        status: event.status,
        visibility: event.visibility,
        published_at: event.published_at,
        created_at: new Date().toISOString(),
      },
    },
  });

  if (res.code !== 0 || !res.data?.record?.record_id) {
    throw new Error(`Failed to create event: ${res.msg}`);
  }

  return res.data.record.record_id;
}

/**
 * イベントを更新
 */
export async function updateEvent(
  recordId: string,
  updates: Partial<Omit<Event, 'id' | 'created_at'>>
): Promise<void> {
  const res = await client.bitable.appTableRecord.update({
    path: {
      app_token: process.env.LARKBASE_APP_TOKEN!,
      table_id: process.env.LARKBASE_TABLE_ID!,
      record_id: recordId,
    },
    data: {
      fields: {
        ...updates,
        updated_at: new Date().toISOString(),
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`Failed to update event: ${res.msg}`);
  }
}

/**
 * アーカイブURL自動登録
 */
export async function registerArchiveUrl(
  recordId: string,
  fileToken: string
): Promise<void> {
  await updateEvent(recordId, {
    archive_file_token: fileToken,
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

export default {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  registerArchiveUrl,
};
