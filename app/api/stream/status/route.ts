import { NextRequest, NextResponse } from 'next/server';

/**
 * 配信ステータスAPI
 *
 * 注意: このシステムは統計データをLarkBaseで管理していないため、
 * 簡易的な実装になっています。
 */
export async function GET(req: NextRequest) {
  try {
    // 配信は常時稼働している想定
    const is_live = true;

    // 視聴者数はランダム値（実際の実装では別の方法で管理する必要があります）
    const viewer_count = Math.floor(Math.random() * 100) + 10;

    // システム起動時間を計算（環境変数で開始時刻を管理する場合）
    const startTime = process.env.STREAM_START_TIME
      ? new Date(process.env.STREAM_START_TIME).getTime()
      : Date.now() - 24 * 60 * 60 * 1000; // デフォルト: 24時間前

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return NextResponse.json({
      is_live,
      viewer_count,
      uptime,
      bandwidth_used: 0, // TODO: 実装が必要な場合は追加
      last_update: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Stream status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: 配信統計を記録
 *
 * 注意: 現在の実装では統計データの永続化を行っていません。
 * 必要に応じてLarkBaseテーブルを作成してデータを保存してください。
 */
export async function POST(req: NextRequest) {
  try {
    const { viewer_count, current_video_id, bandwidth_used } = await req.json();

    // TODO: LarkBaseに統計テーブルを作成して保存する場合はここに実装
    console.log('Stream stats received:', { viewer_count, current_video_id, bandwidth_used });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Post stream status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
