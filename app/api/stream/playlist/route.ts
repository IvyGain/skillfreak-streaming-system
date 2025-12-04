/**
 * Playlist API - プレイリスト管理
 *
 * GET: プレイリスト全体を取得
 * POST: プレイリスト更新（管理者のみ）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getScheduler, VideoItem } from '@/lib/streaming/playlist-scheduler';
import { getVODEvents } from '@/lib/larkbase-client';
import { getServerSession } from 'next-auth';

/**
 * GET: プレイリスト全体を取得
 *
 * @returns {Object} プレイリスト情報
 * @returns {VideoItem[]} playlist - 動画リスト
 * @returns {number} totalVideos - 動画総数
 * @returns {number} totalDuration - 合計再生時間（秒）
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const scheduler = getScheduler();

    // プレイリストが空の場合は初期化
    if (scheduler.getPlaylist().length === 0) {
      await initializePlaylist();
    }

    const playlist = scheduler.getPlaylist();
    const totalDuration = scheduler.getTotalDuration();
    const state = scheduler.getPlaybackState();

    return NextResponse.json({
      success: true,
      data: {
        playlist,
        totalVideos: playlist.length,
        totalDuration,
        currentIndex: state.currentVideoIndex,
        currentVideo: state.currentVideo,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[stream/playlist] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get playlist',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: プレイリスト更新（管理者のみ）
 *
 * @body {string} action - 実行するアクション
 * @body {VideoItem[]} playlist - 新しいプレイリスト（action: 'set'の場合）
 * @body {string} videoId - 動画ID（action: 'set-duration'の場合）
 * @body {number} duration - 動画の長さ（秒）（action: 'set-duration'の場合）
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 認証チェック（管理者のみ）
    // TODO: NextAuth実装後に有効化
    // const session = await getServerSession();
    // if (!session || !isAdmin(session.user)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await req.json();
    const { action } = body;

    const scheduler = getScheduler();

    switch (action) {
      case 'refresh':
        // LarkBaseからプレイリストを再読み込み
        await initializePlaylist();
        return NextResponse.json({
          success: true,
          message: 'Playlist refreshed from LarkBase',
          totalVideos: scheduler.getPlaylist().length,
        });

      case 'set':
        // プレイリストを直接設定
        const { playlist } = body;
        if (!playlist || !Array.isArray(playlist)) {
          return NextResponse.json(
            { success: false, error: 'Invalid playlist format' },
            { status: 400 }
          );
        }

        // バリデーション
        const validPlaylist = playlist.filter(
          (item: any) => item.id && item.title && item.url
        );

        scheduler.setPlaylist(validPlaylist);
        console.log(`[stream/playlist] Playlist updated with ${validPlaylist.length} videos`);

        return NextResponse.json({
          success: true,
          message: 'Playlist updated',
          totalVideos: validPlaylist.length,
        });

      case 'set-duration':
        // 動画の長さを設定
        const { videoId, duration } = body;
        if (!videoId || typeof duration !== 'number' || duration <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid videoId or duration' },
            { status: 400 }
          );
        }

        scheduler.setVideoDuration(videoId, duration);
        console.log(`[stream/playlist] Duration set for ${videoId}: ${duration}s`);

        return NextResponse.json({
          success: true,
          message: `Duration updated for video ${videoId}`,
          videoId,
          duration,
        });

      case 'add':
        // プレイリストに動画を追加
        const { video } = body;
        if (!video || !video.id || !video.title || !video.url) {
          return NextResponse.json(
            { success: false, error: 'Invalid video format' },
            { status: 400 }
          );
        }

        const currentPlaylist = scheduler.getPlaylist();
        scheduler.setPlaylist([...currentPlaylist, video]);
        console.log(`[stream/playlist] Video added: ${video.title}`);

        return NextResponse.json({
          success: true,
          message: 'Video added to playlist',
          totalVideos: scheduler.getPlaylist().length,
        });

      case 'remove':
        // プレイリストから動画を削除
        const { videoId: removeId } = body;
        if (!removeId) {
          return NextResponse.json(
            { success: false, error: 'Invalid videoId' },
            { status: 400 }
          );
        }

        const filteredPlaylist = scheduler
          .getPlaylist()
          .filter((v) => v.id !== removeId);
        scheduler.setPlaylist(filteredPlaylist);
        console.log(`[stream/playlist] Video removed: ${removeId}`);

        return NextResponse.json({
          success: true,
          message: 'Video removed from playlist',
          totalVideos: filteredPlaylist.length,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[stream/playlist] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update playlist',
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

    const playlist: VideoItem[] = events
      .filter((e) => e.youtube_url || e.archive_url)
      .map((e) => ({
        id: e.id,
        title: e.title,
        url: e.youtube_url || e.archive_url || '',
        duration: (e.duration || 60) * 60, // 分→秒に変換
      }));

    scheduler.setPlaylist(playlist);

    console.log(`[stream/playlist] Playlist initialized with ${playlist.length} videos`);
  } catch (error) {
    console.error('[stream/playlist] Failed to initialize playlist:', error);
    throw error;
  }
}

/**
 * 管理者権限チェック（TODO: 実装）
 */
// function isAdmin(user: any): boolean {
//   // Discord role check or other admin verification
//   return user?.roles?.includes('admin');
// }
