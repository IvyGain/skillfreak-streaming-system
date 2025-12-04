/**
 * Current Stream API - 現在再生中の動画情報を取得
 *
 * GET: 現在再生中の動画と同期再生用のタイムスタンプを返す
 */

import { NextRequest, NextResponse } from 'next/server';
import { getScheduler } from '@/lib/streaming/playlist-scheduler';
import { getVODEvents } from '@/lib/larkbase-client';

/**
 * GET: 現在再生中の動画情報を取得
 *
 * @returns {Object} 現在の動画情報と同期再生用データ
 * @returns {Object} currentVideo - 現在再生中の動画情報
 * @returns {number} position - 現在の再生位置（秒）
 * @returns {string} serverTime - サーバー時刻（ISO 8601）
 * @returns {number} currentIndex - プレイリスト内のインデックス
 * @returns {boolean} isPlaying - 再生中かどうか
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const scheduler = getScheduler();

    // プレイリストが空の場合は初期化
    if (scheduler.getPlaylist().length === 0) {
      await initializePlaylist();
    }

    const state = scheduler.getPlaybackState();
    const nextVideo = scheduler.getNextVideo();

    // クエリパラメータで詳細情報を返すかどうか制御
    const searchParams = req.nextUrl.searchParams;
    const includePlaylist = searchParams.get('include_playlist') === 'true';

    const response: any = {
      success: true,
      data: {
        currentVideo: state.currentVideo,
        position: Math.floor(state.position),
        serverTime: new Date().toISOString(),
        currentIndex: state.currentVideoIndex,
        isPlaying: state.isPlaying,
        nextVideo,
        totalVideos: scheduler.getPlaylist().length,
        totalDuration: scheduler.getTotalDuration(),
      },
    };

    // プレイリスト全体を含める場合
    if (includePlaylist) {
      response.data.playlist = scheduler.getPlaylist();
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[stream/current] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get current stream info',
        details: error.message,
      },
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

    const playlist = events
      .filter((e) => e.youtube_url || e.archive_url)
      .map((e) => ({
        id: e.id,
        title: e.title,
        url: e.youtube_url || e.archive_url || '',
        duration: (e.duration || 60) * 60, // 分→秒に変換
      }));

    scheduler.setPlaylist(playlist);

    console.log(`[stream/current] Playlist initialized with ${playlist.length} videos`);
  } catch (error) {
    console.error('[stream/current] Failed to initialize playlist:', error);
    throw error;
  }
}
