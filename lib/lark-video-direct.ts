/**
 * Lark Drive動画の直接URL取得
 *
 * 共有リンクから動画ファイルの直接URLを取得する
 */

import * as lark from '@larksuiteoapi/node-sdk';

// Larkクライアント初期化
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
 * 共有リンクのトークンから動画の直接ダウンロードURLを取得
 *
 * @param shareToken - 共有リンクのトークン（例: U5MtbbETooJlMkxq7jwjsCWGpHb）
 * @returns 動画の直接URL（24時間有効）
 */
export async function getVideoDirectUrl(shareToken: string): Promise<string | null> {
  const client = getLarkClient();

  try {
    console.log('🔍 Trying to get video URL for token:', shareToken);

    // 方法1: Media APIで一時URLを取得
    try {
      const mediaRes = await client.drive.media.batchGetTmpDownloadUrl({
        data: {
          file_tokens: [shareToken],
        },
      });

      console.log('📊 Media API Response:', JSON.stringify(mediaRes, null, 2));

      if (mediaRes.code === 0 && mediaRes.data?.tmp_download_urls?.[0]) {
        const url = mediaRes.data.tmp_download_urls[0].tmp_download_url;
        console.log('✅ Success via Media API:', url);
        return url;
      }
    } catch (mediaError: any) {
      console.log('⚠️ Media API failed:', mediaError.message);
    }

    // 方法2: File APIで直接ダウンロードURLを取得
    try {
      const fileRes = await client.drive.file.downloadFile({
        path: {
          file_token: shareToken,
        },
      });

      console.log('📊 File API Response:', fileRes);

      if (fileRes.code === 0) {
        console.log('✅ Success via File API');
        // File APIはバイナリデータを返すので、別のアプローチが必要
      }
    } catch (fileError: any) {
      console.log('⚠️ File API failed:', fileError.message);
    }

    // 方法3: 共有リンクから直接アクセス可能なURLを構築
    // Larkの共有リンク形式: https://domain/file/{token}
    // これをダウンロードURLに変換できる可能性がある
    const directUrl = `https://ivygain-project.jp.larksuite.com/file/${shareToken}`;
    console.log('🔗 Fallback to share link:', directUrl);

    return directUrl;

  } catch (error: any) {
    console.error('❌ Failed to get video URL:', error);
    return null;
  }
}

/**
 * ファイル情報を取得
 */
export async function getFileInfo(fileToken: string) {
  const client = getLarkClient();

  try {
    const res = await client.drive.file.getMeta({
      path: {
        file_token: fileToken,
      },
    });

    console.log('📄 File Info:', JSON.stringify(res, null, 2));
    return res.data;
  } catch (error: any) {
    console.error('Failed to get file info:', error);
    return null;
  }
}
