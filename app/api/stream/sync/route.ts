/**
 * 同期再生API - 24時間VOD配信用
 *
 * 全クライアントが同じ動画・同じ位置を再生するための同期エンドポイント
 */

import { NextRequest, NextResponse } from 'next/server';
import { getScheduler, VideoItem } from '@/lib/streaming/playlist-scheduler';
import { getVODEvents } from '@/lib/larkbase-client';

// サーバー起動時刻（グローバル）
let serverStartTime: Date | null = null;

/**
 * GET: 現在の再生状態を取得
 */
export async function GET() {
  try {
    const scheduler = getScheduler();

    // プレイリストが空の場合は初期化
    if (scheduler.getPlaylist().length === 0) {
      await initializePlaylist();
    }

    const state = scheduler.getPlaybackState();

    return NextResponse.json({
      success: true,
      data: {
        currentVideo: state.currentVideo,
        currentIndex: state.currentVideoIndex,
        position: Math.floor(state.position),
        isPlaying: state.isPlaying,
        totalVideos: scheduler.getPlaylist().length,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: プレイリストを更新
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const scheduler = getScheduler();

    switch (action) {
      case 'refresh':
        // プレイリストを再読み込み
        await initializePlaylist();
        return NextResponse.json({
          success: true,
          message: 'Playlist refreshed',
          totalVideos: scheduler.getPlaylist().length,
        });

      case 'set-duration':
        // 動画の長さを設定
        const { videoId, duration } = body;
        if (videoId && duration) {
          scheduler.setVideoDuration(videoId, duration);
          return NextResponse.json({
            success: true,
            message: `Duration set for ${videoId}: ${duration}s`,
          });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sync API POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * プレイリストを初期化（LarkBaseから取得）
 */
async function initializePlaylist(): Promise<void> {
  const scheduler = getScheduler();

  try {
    const events = await getVODEvents();

    const playlist: VideoItem[] = events
      .filter((e) => e.youtube_url || e.archive_url)
      .map((e) => ({
        id: e.id,
        title: e.title,
        url: e.youtube_url || e.archive_url || '',
        duration: 3600, // デフォルト1時間（後で更新可能）
      }));

    scheduler.setPlaylist(playlist);

    if (!serverStartTime) {
      serverStartTime = new Date();
    }

    console.log(`Playlist initialized with ${playlist.length} videos`);
  } catch (error) {
    console.error('Failed to initialize playlist:', error);
    throw error;
  }
}
