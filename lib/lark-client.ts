/**
 * Lark Drive動画配信 - クライアントライブラリ
 */

import * as lark from '@larksuiteoapi/node-sdk';

// Larkクライアント初期化（シングルトン）
let client: lark.Client | null = null;

export function getLarkClient(): lark.Client {
  if (!client) {
    if (!process.env.LARK_APP_ID || !process.env.LARK_APP_SECRET) {
      throw new Error('Lark credentials not configured');
    }

    client = new lark.Client({
      appId: process.env.LARK_APP_ID,
      appSecret: process.env.LARK_APP_SECRET,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Lark,
    });
  }

  return client;
}

/**
 * ファイルトークンから一時ダウンロードURLを取得（24時間有効）
 *
 * @param fileToken - Lark Driveのファイルトークン（例: U5MtbbETooJlMkxq7jwjsCWGpHb）
 * @returns 一時ダウンロードURL（24時間有効）
 */
export async function getTemporaryVideoUrl(fileToken: string): Promise<string> {
  const client = getLarkClient();

  try {
    const res = await client.drive.media.batchGetTmpDownloadUrl({
      data: {
        file_tokens: [fileToken],
      },
    });

    if (res.code !== 0) {
      throw new Error(`Failed to get URL: ${res.msg}`);
    }

    return res.data.tmp_download_urls[0].tmp_download_url;
  } catch (error) {
    console.error('Lark API Error:', error);
    throw error;
  }
}

/**
 * LarkBaseからイベント情報を取得
 *
 * @param eventId - イベントID（LarkBase record_id）
 * @returns イベント情報（動画File Tokenを含む）
 */
export async function getEventInfo(eventId: string) {
  const client = getLarkClient();

  try {
    const res = await client.bitable.appTableRecord.get({
      path: {
        app_token: process.env.LARKBASE_APP_TOKEN!,
        table_id: process.env.LARKBASE_TABLE_ID!,
        record_id: eventId,
      },
    });

    if (res.code !== 0) {
      throw new Error(`Failed to get event: ${res.msg}`);
    }

    return {
      id: res.data.record.record_id,
      title: res.data.record.fields['title'] as string,
      description: res.data.record.fields['description'] as string,
      fileToken: res.data.record.fields['archive_file_token'] as string,
      publishedAt: res.data.record.fields['published_at'] as string,
    };
  } catch (error) {
    console.error('LarkBase Error:', error);
    throw error;
  }
}

/**
 * 動画ファイルをLark Driveにアップロード
 *
 * @param filePath - ローカルファイルパス
 * @param folderToken - アップロード先フォルダのトークン
 * @returns File Token
 */
export async function uploadVideoToLark(
  filePath: string,
  folderToken: string
): Promise<string> {
  const client = getLarkClient();
  const fs = require('fs');
  const path = require('path');

  try {
    const stats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    const res = await client.drive.file.uploadAll({
      data: {
        file_name: path.basename(filePath),
        parent_type: 'explorer',
        parent_node: folderToken,
        size: stats.size,
        file: fileStream,
      },
    });

    if (res.code !== 0) {
      throw new Error(`Upload failed: ${res.msg}`);
    }

    console.log(`✅ Uploaded: ${path.basename(filePath)}`);
    console.log(`📎 File Token: ${res.data.file_token}`);

    return res.data.file_token;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

export default {
  getTemporaryVideoUrl,
  getEventInfo,
  uploadVideoToLark,
};
