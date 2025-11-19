/**
 * 動画直接URL取得API
 *
 * GET /api/video-direct?token=U5MtbbETooJlMkxq7jwjsCWGpHb
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVideoDirectUrl, getFileInfo } from '@/lib/lark-video-direct';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    console.log('🎬 Fetching video URL for token:', token);

    // ファイル情報を取得（デバッグ用）
    const fileInfo = await getFileInfo(token);

    // 動画の直接URLを取得
    const videoUrl = await getVideoDirectUrl(token);

    if (!videoUrl) {
      return NextResponse.json(
        {
          error: 'Failed to get video URL',
          fileInfo,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      fileInfo,
      expiresIn: 86400, // 24時間
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
