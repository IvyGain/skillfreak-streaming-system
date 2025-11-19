/**
 * Lark API接続テスト
 *
 * GET /api/test-lark?fileToken=U5MtbbETooJlMkxq7jwjsCWGpHb
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTemporaryVideoUrl } from '@/lib/lark-client';

export async function GET(req: NextRequest) {
  try {
    // クエリパラメータからfileTokenを取得
    const fileToken =
      req.nextUrl.searchParams.get('fileToken') ||
      process.env.TEST_FILE_TOKEN ||
      '';

    if (!fileToken) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'fileTokenが指定されていません',
        },
        { status: 400 }
      );
    }

    console.log('📎 File Token:', fileToken);

    // Lark APIで一時URL取得
    const url = await getTemporaryVideoUrl(fileToken);

    console.log('✅ 一時URL取得成功');
    console.log('🌐 URL:', url);

    return NextResponse.json({
      success: true,
      fileToken,
      url,
      expiresIn: 86400,
      message: 'Lark API接続成功！',
    });
  } catch (error: any) {
    console.error('❌ Lark API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
