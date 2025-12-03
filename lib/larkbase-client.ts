/**
 * LarkBase APIクライアント
 *
 * イベント管理テーブルとの統合
 */

import * as lark from '@larksuiteoapi/node-sdk';

// Larkクライアント
let client: lark.Client | null = null;

/**
 * LarkBaseのユーザーフィールドから名前を抽出
 */
function extractSpeakerName(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    // ユーザーオブジェクトの配列
    const names = field.map((u: any) => u.name || u.text || '').filter(Boolean);
    return names.join(', ');
  }
  if (typeof field === 'object' && field !== null) {
    return field.name || field.text || '';
  }
  return '';
}

/**
 * LarkBase添付ファイルフィールドからサムネイルURLを抽出
 * tmp_urlをプロキシAPI経由で取得
 */
function extractAttachmentFileToken(field: any): string | undefined {
  if (!field) return undefined;

  // 文字列の場合はそのまま返す（直接URLの可能性）
  if (typeof field === 'string' && field.trim() !== '') {
    return field;
  }

  // 配列の場合（添付ファイルフィールド）
  if (Array.isArray(field) && field.length > 0) {
    const attachment = field[0];
    // tmp_urlを優先して使用（LarkBase添付ファイルの一時URL）
    if (attachment?.tmp_url) {
      return `/api/lark-image?url=${encodeURIComponent(attachment.tmp_url)}`;
    }
    // fallback: file_tokenを使用
    if (attachment?.file_token) {
      return `/api/lark-image?token=${attachment.file_token}`;
    }
    return undefined;
  }

  // オブジェクトの場合（単一添付ファイル）
  if (typeof field === 'object' && field !== null) {
    if (field.tmp_url) {
      return `/api/lark-image?url=${encodeURIComponent(field.tmp_url)}`;
    }
    if (field.file_token) {
      return `/api/lark-image?token=${field.file_token}`;
    }
    return undefined;
  }

  return undefined;
}

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
 * 登壇者型定義
 */
export interface Speaker {
  name: string;
  title: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

/**
 * 特典型定義
 */
export interface Benefit {
  id: string;
  type: 'url' | 'prompt' | 'text';
  title: string;
  content: string;
  description?: string;
}

/**
 * イベント型定義（拡張版）
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
  // 拡張フィールド
  category?: string;
  tags?: string[];
  speaker?: Speaker;
  duration?: number; // 分
  attendees?: number;
  rating?: number;
  thumbnail?: string;
  benefits?: Benefit[];
  survey_url?: string;
  location?: string; // オンライン開催 / 会場名
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

      // セミナーURL（動画URL）を取得
      const seminarUrl = fields['セミナーURL']?.link || fields['セミナーURL']?.text || '';

      // YouTube URLを判定（youtubeドメインを含む場合）
      const isYouTube = seminarUrl.includes('youtube.com') || seminarUrl.includes('youtu.be');

      // アーカイブ動画フィールド（リンクタイプ）からURLを抽出
      const archiveVideoField = fields['アーカイブ動画'];
      let archiveUrl = '';
      let archiveFileToken = fields['アーカイブファイルトークン'] || fields['archive_file_token'] || '';

      if (archiveVideoField) {
        // リンクタイプの場合
        if (typeof archiveVideoField === 'object' && archiveVideoField.link) {
          archiveUrl = archiveVideoField.link;
          // URLからfile tokenを抽出（https://open.larksuite.com/drive/file/xxx）
          const tokenMatch = archiveUrl.match(/\/file\/([^/?]+)/);
          if (tokenMatch && !archiveFileToken) {
            archiveFileToken = tokenMatch[1];
          }
        } else if (typeof archiveVideoField === 'string') {
          archiveUrl = archiveVideoField;
        }
      }

      // フォールバック: アーカイブURL フィールド
      if (!archiveUrl) {
        archiveUrl = !isYouTube ? seminarUrl : (fields['アーカイブURL'] || '');
      }

      return {
        id: item.record_id,
        title: fields['イベントタイトル'] || fields['イベント']?.[0]?.text || 'タイトル未設定',
        description: fields['告知用文章'] || '',
        scheduled_at: scheduledAt,
        youtube_url: isYouTube ? seminarUrl : (fields['YouTube URL'] || ''),
        archive_file_token: archiveFileToken,
        archive_url: archiveUrl,
        status: 'published', // LarkBaseのデータは全て公開済みとして扱う
        visibility: 'public', // デフォルトで公開
        published_at: scheduledAt,
        created_at: scheduledAt,
        thumbnail: extractAttachmentFileToken(fields['サムネイル']) || extractAttachmentFileToken(fields['thumbnail']) || undefined,
        speaker: {
          name: extractSpeakerName(fields['登壇者']) || 'SkillFreak',
          title: 'Speaker',
        },
        duration: parseInt(fields['時間（分）'] || fields['duration'] || '60', 10),
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
 * イベント詳細を取得（日本語フィールド対応）
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

    const fields = item.fields as any;

    // イベント開始日時（ミリ秒からISO文字列に変換）
    const scheduledAt = fields['イベント開始日時']
      ? new Date(fields['イベント開始日時']).toISOString()
      : new Date().toISOString();

    // セミナーURL（動画URL）を取得
    const seminarUrl = fields['セミナーURL']?.link || fields['セミナーURL']?.text || '';
    const isYouTube = seminarUrl.includes('youtube.com') || seminarUrl.includes('youtu.be');

    // カテゴリ取得（単一選択フィールド想定）
    const category = fields['カテゴリ'] || fields['category'] || 'business';

    // タグ取得（複数選択または配列）
    let tags: string[] = [];
    if (fields['タグ']) {
      if (Array.isArray(fields['タグ'])) {
        tags = fields['タグ'];
      } else if (typeof fields['タグ'] === 'string') {
        tags = fields['タグ'].split(',').map((t: string) => t.trim());
      }
    }

    // 登壇者情報
    const speaker: Speaker = {
      name: fields['登壇者名'] || fields['speaker_name'] || 'SkillFreak',
      title: fields['登壇者肩書'] || fields['speaker_title'] || 'Seminar',
      avatar: fields['登壇者アバター'] || fields['speaker_avatar'] || undefined,
      social: {
        twitter: fields['登壇者Twitter'] || undefined,
        linkedin: fields['登壇者LinkedIn'] || undefined,
        github: fields['登壇者GitHub'] || undefined,
        website: fields['登壇者Website'] || undefined,
      },
    };

    // 特典取得（JSONまたは複数行テキスト）
    let benefits: Benefit[] = [];
    if (fields['特典']) {
      try {
        if (typeof fields['特典'] === 'string') {
          benefits = JSON.parse(fields['特典']);
        } else if (Array.isArray(fields['特典'])) {
          benefits = fields['特典'];
        }
      } catch {
        // パース失敗時は空配列
      }
    }

    // アーカイブ動画フィールド（リンクタイプ）からURLを抽出
    const archiveVideoField = fields['アーカイブ動画'];
    let archiveUrl = '';
    let archiveFileToken = fields['アーカイブファイルトークン'] || fields['archive_file_token'] || '';

    if (archiveVideoField) {
      // リンクタイプの場合
      if (typeof archiveVideoField === 'object' && archiveVideoField.link) {
        archiveUrl = archiveVideoField.link;
        // URLからfile tokenを抽出（https://open.larksuite.com/drive/file/xxx）
        const tokenMatch = archiveUrl.match(/\/file\/([^/?]+)/);
        if (tokenMatch && !archiveFileToken) {
          archiveFileToken = tokenMatch[1];
        }
      } else if (typeof archiveVideoField === 'string') {
        archiveUrl = archiveVideoField;
      }
    }

    // フォールバック: アーカイブURL フィールド
    if (!archiveUrl) {
      archiveUrl = !isYouTube ? seminarUrl : (fields['アーカイブURL'] || '');
    }

    return {
      id: String(item.record_id || ''),
      title: fields['イベントタイトル'] || fields['イベント']?.[0]?.text || 'タイトル未設定',
      description: fields['告知用文章'] || fields['description'] || '',
      scheduled_at: scheduledAt,
      youtube_url: isYouTube ? seminarUrl : (fields['YouTube URL'] || ''),
      archive_file_token: archiveFileToken,
      archive_url: archiveUrl,
      status: 'published',
      visibility: fields['公開設定'] === '会員限定' ? 'members-only' : 'public',
      published_at: scheduledAt,
      created_at: scheduledAt,
      // 拡張フィールド
      category,
      tags,
      speaker,
      duration: parseInt(fields['時間（分）'] || fields['duration'] || '60', 10),
      attendees: parseInt(fields['参加者数'] || fields['attendees'] || '0', 10),
      rating: parseFloat(fields['評価'] || fields['rating'] || '0'),
      thumbnail: extractAttachmentFileToken(fields['サムネイル']) || extractAttachmentFileToken(fields['thumbnail']) || undefined,
      benefits,
      survey_url: fields['アンケートURL'] || fields['survey_url'] || undefined,
      location: fields['開催場所'] || fields['location'] || 'オンライン開催',
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

/**
 * VOD配信用のイベントを取得（YouTube URLまたはアーカイブファイルがあるもの）
 */
export async function getVODEvents(): Promise<Event[]> {
  const events = await getAllEvents({ status: 'published' });
  // アーカイブファイル、アーカイブURL、またはYouTube URLがあるイベントを返す
  return events.filter(e => e.archive_file_token || e.archive_url || e.youtube_url);
}

export default {
  getAllEvents,
  getEventById,
  getArchivedEvents,
  getVODEvents,
};
