/**
 * アーカイブ動画ストリーミングAPI
 *
 * Discord認証 → Lark API → 一時URL返却
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getEventInfo, getTemporaryVideoUrl } from '@/lib/lark-client';

/**
 * GET /api/archive/[eventId]
 *
 * イベントIDから動画ストリーミングURLを取得
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // 1. セッション確認（NextAuth）
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'ログインが必要です',
        },
        { status: 401 }
      );
    }

    // 2. LarkBaseからイベント情報取得
    const event = await getEventInfo(params.eventId);

    if (!event.fileToken) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'アーカイブ動画が見つかりません',
        },
        { status: 404 }
      );
    }

    // 3. Discord会員確認（オプション - 後で実装）
    // const isMember = await checkDiscordMembership(session.user.id);
    // if (!isMember) {
    //   return NextResponse.json(
    //     {
    //       error: 'Forbidden',
    //       message: 'SkillFreak会員のみ視聴可能です',
    //       joinUrl: 'https://skillfreak.ivygain.jp/join',
    //     },
    //     { status: 403 }
    //   );
    // }

    // 4. Lark APIで一時URL取得（24時間有効）
    const videoUrl = await getTemporaryVideoUrl(event.fileToken);

    // 5. レスポンス返却
    return NextResponse.json({
      url: videoUrl,
      title: event.title,
      description: event.description,
      expiresIn: 86400, // 24時間（秒）
      publishedAt: event.publishedAt,
    });

  } catch (error: any) {
    console.error('Archive API Error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || '動画の取得に失敗しました',
      },
      { status: 500 }
    );
  }
}
