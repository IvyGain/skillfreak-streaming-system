/**
 * Lark Drive 直接HTTP API実装
 * SDK uploadPart問題の代替実装
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { getLarkClient } from './lark-client';

const LARK_API_BASE = 'https://open.larksuite.com/open-apis';

/**
 * アクセストークンを取得
 */
async function getAccessToken(): Promise<string> {
  const client = getLarkClient();

  // tenant_access_tokenを取得
  const res = await axios.post(`${LARK_API_BASE}/auth/v3/tenant_access_token/internal`, {
    app_id: process.env.LARK_APP_ID,
    app_secret: process.env.LARK_APP_SECRET,
  });

  if (res.data.code !== 0) {
    throw new Error(`Failed to get access token: ${res.data.msg}`);
  }

  return res.data.tenant_access_token;
}

/**
 * 分割アップロード - Prepare
 */
async function uploadPrepare(
  token: string,
  fileName: string,
  fileSize: number,
  folderToken: string
): Promise<{ upload_id: string; block_size: number; block_num: number }> {
  const res = await axios.post(
    `${LARK_API_BASE}/drive/v1/files/upload_prepare`,
    {
      file_name: fileName,
      parent_type: 'explorer',
      parent_node: folderToken,
      size: fileSize,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (res.data.code !== 0) {
    throw new Error(`Prepare failed: ${res.data.msg}`);
  }

  return {
    upload_id: res.data.data.upload_id,
    block_size: res.data.data.block_size || 4 * 1024 * 1024,
    block_num: res.data.data.block_num,
  };
}

/**
 * 分割アップロード - Part
 */
async function uploadPart(
  token: string,
  uploadId: string,
  seq: number,
  fileBuffer: Buffer
): Promise<void> {
  const FormData = require('form-data');
  const form = new FormData();

  form.append('upload_id', uploadId);
  form.append('seq', seq.toString());
  form.append('size', fileBuffer.length.toString());
  form.append('file', fileBuffer, {
    filename: 'chunk',
    contentType: 'application/octet-stream',
  });

  const res = await axios.post(
    `${LARK_API_BASE}/drive/v1/files/upload_part`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  if (res.data.code !== 0) {
    throw new Error(`Part ${seq} failed: ${res.data.msg} (code: ${res.data.code})`);
  }
}

/**
 * 分割アップロード - Finish
 */
async function uploadFinish(
  token: string,
  uploadId: string,
  blockNum: number
): Promise<string> {
  const res = await axios.post(
    `${LARK_API_BASE}/drive/v1/files/upload_finish`,
    {
      upload_id: uploadId,
      block_num: blockNum,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (res.data.code !== 0) {
    throw new Error(`Finish failed: ${res.data.msg}`);
  }

  return res.data.data.file_token;
}

/**
 * ファイルを分割アップロード（HTTP直接実装）
 */
export async function uploadVideoToLarkHTTP(
  filePath: string,
  folderToken: string
): Promise<string> {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = stats.size;

  console.log(`📤 アップロード開始（HTTP直接実装）: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);

  // Step 1: アクセストークン取得
  console.log('🔑 アクセストークン取得中...');
  const token = await getAccessToken();

  // Step 2: アップロード準備
  console.log('🔄 アップロード準備中...');
  const { upload_id, block_size, block_num } = await uploadPrepare(
    token,
    fileName,
    fileSize,
    folderToken
  );

  console.log(`📊 Upload ID: ${upload_id}`);
  console.log(`📦 パート数: ${block_num}, パートサイズ: ${(block_size / 1024 / 1024).toFixed(2)}MB`);

  // Step 3: 各パートをアップロード
  for (let i = 0; i < block_num; i++) {
    const start = i * block_size;
    const end = Math.min(start + block_size, fileSize);
    const buffer = Buffer.alloc(end - start);

    // ファイルから該当部分を読み込み
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, buffer.length, start);
    fs.closeSync(fd);

    await uploadPart(token, upload_id, i, buffer);

    const progress = ((i + 1) / block_num * 100).toFixed(1);
    console.log(`⏳ 進捗: ${progress}% (${i + 1}/${block_num})`);
  }

  // Step 4: アップロード完了
  console.log('🏁 アップロード完了処理中...');
  const fileToken = await uploadFinish(token, upload_id, block_num);

  console.log(`✅ アップロード完了: ${fileName}`);
  console.log(`📎 File Token: ${fileToken}`);

  return fileToken;
}

export default {
  uploadVideoToLarkHTTP,
};
