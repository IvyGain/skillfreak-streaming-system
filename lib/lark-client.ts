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
 * 動画ファイルをLark Driveにアップロード（分割アップロード対応）
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
    const fileName = path.basename(filePath);
    const fileSize = stats.size;

    console.log(`📤 アップロード準備: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);

    // 小さなファイル（10MB未満）は従来のuploadAllを使用
    if (fileSize < 10 * 1024 * 1024) {
      const fileStream = fs.createReadStream(filePath);
      const res = await client.drive.file.uploadAll({
        data: {
          file_name: fileName,
          parent_type: 'explorer',
          parent_node: folderToken,
          size: fileSize,
          file: fileStream,
        },
      });

      if (res.code !== 0 || !res.data?.file_token) {
        throw new Error(`Upload failed: ${res.msg}`);
      }

      console.log(`✅ アップロード完了: ${fileName}`);
      console.log(`📎 File Token: ${res.data.file_token}`);
      return res.data.file_token;
    }

    // 大きなファイルは分割アップロード
    console.log('🔄 分割アップロード開始...');

    // Step 1: アップロード準備
    const prepareRes = await client.drive.file.uploadPrepare({
      data: {
        file_name: fileName,
        parent_type: 'explorer',
        parent_node: folderToken,
        size: fileSize,
      },
    });

    if (prepareRes.code !== 0 || !prepareRes.data?.upload_id) {
      throw new Error(`Prepare failed: ${prepareRes.msg}`);
    }

    const uploadId = prepareRes.data.upload_id;
    const blockSize = prepareRes.data.block_size || 4 * 1024 * 1024; // デフォルト4MB
    const blockNum = prepareRes.data.block_num || Math.ceil(fileSize / blockSize);

    console.log(`📊 Upload ID: ${uploadId}`);
    console.log(`📦 パート数: ${blockNum}, パートサイズ: ${(blockSize / 1024 / 1024).toFixed(2)}MB`);

    // Step 2: 各パートをアップロード
    const { Readable } = require('stream');

    for (let i = 0; i < blockNum; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, fileSize);
      const buffer = Buffer.alloc(end - start);

      // ファイルから該当部分を読み込み
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, buffer.length, start);
      fs.closeSync(fd);

      // BufferをStreamに変換
      const stream = Readable.from(buffer);

      const partRes = await client.drive.file.uploadPart({
        data: {
          upload_id: uploadId,
          seq: i,
          size: buffer.length,
          file: stream,
        },
      });

      if (partRes.code !== 0) {
        throw new Error(`Part ${i} upload failed: ${partRes.msg}`);
      }

      const progress = ((i + 1) / blockNum * 100).toFixed(1);
      console.log(`⏳ 進捗: ${progress}% (${i + 1}/${blockNum})`);
    }

    // Step 3: アップロード完了
    const finishRes = await client.drive.file.uploadFinish({
      data: {
        upload_id: uploadId,
        block_num: blockNum,
      },
    });

    if (finishRes.code !== 0 || !finishRes.data?.file_token) {
      throw new Error(`Finish failed: ${finishRes.msg}`);
    }

    console.log(`✅ アップロード完了: ${fileName}`);
    console.log(`📎 File Token: ${finishRes.data.file_token}`);

    return finishRes.data.file_token;
  } catch (error) {
    console.error('❌ Upload Error:', error);
    throw error;
  }
}

export default {
  getTemporaryVideoUrl,
  getEventInfo,
  uploadVideoToLark,
};
