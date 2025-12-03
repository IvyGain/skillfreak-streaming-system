/**
 * Lark Drive画像プロキシAPI
 * LarkBaseの添付ファイル画像を認証付きで取得して返す
 */

import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

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

export async function GET(request: NextRequest) {
  const fileToken = request.nextUrl.searchParams.get('token');
  const directUrl = request.nextUrl.searchParams.get('url');

  // 直接URLが提供された場合（LarkBase tmp_url）
  if (directUrl) {
    try {
      const larkClient = getLarkClient();
      const token = await larkClient.tokenManager.getTenantAccessToken();

      // LarkBase tmp_urlはbatch_get_tmp_download_url APIへのURL
      // 認証付きで呼び出して実際のダウンロードURLを取得
      const apiRes = await fetch(directUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!apiRes.ok) {
        console.error('Failed to call Lark API:', apiRes.status);
        return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
      }

      const apiData = await apiRes.json();

      // レスポンスから実際のダウンロードURLを取得
      const downloadUrl = apiData?.data?.tmp_download_urls?.[0]?.tmp_download_url;

      if (!downloadUrl) {
        console.error('No download URL in response:', apiData);
        return NextResponse.json({ error: 'No download URL returned' }, { status: 500 });
      }

      // 画像を取得
      const imageRes = await fetch(downloadUrl);

      if (!imageRes.ok) {
        console.error('Failed to fetch image:', imageRes.status);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
      }

      const imageBuffer = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get('content-type') || 'image/png';

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('Error proxying Lark image from URL:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  if (!fileToken) {
    return NextResponse.json({ error: 'File token or URL is required' }, { status: 400 });
  }

  try {
    const larkClient = getLarkClient();

    // 一時ダウンロードURLを取得
    const res = await larkClient.drive.media.batchGetTmpDownloadUrl({
      params: {
        file_tokens: [fileToken],
      },
    });

    if (res.code !== 0 || !res.data?.tmp_download_urls?.length) {
      console.error('Failed to get tmp download URL:', res);
      return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
    }

    const tmpUrl = res.data.tmp_download_urls[0].tmp_download_url;

    if (!tmpUrl) {
      return NextResponse.json({ error: 'No download URL returned' }, { status: 500 });
    }

    // 画像を取得
    const imageRes = await fetch(tmpUrl);

    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
      },
    });

  } catch (error) {
    console.error('Error proxying Lark image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
