/**
 * 同期再生API - 24時間VOD配信用（Redis統合版）
 *
 * 全クライアントが同じ動画・同じ位置を再生するための同期エンドポイント
 * Upstash Redisで状態を永続化し、複数クライアント間で完全同期
 */

import { NextRequest, NextResponse } from 'next/server';
import { getScheduler, VideoItem } from '@/lib/streaming/playlist-scheduler';
import { getVODEvents } from '@/lib/larkbase-client';
import {
  getSyncState,
  setSyncState,
  setPlaylist,
  getPlaylist,
  setVideoMetadata,
  calculateSyncPosition,
  initializeSyncState,
  advanceToNextVideo,
  SyncState,
} from '@/lib/streaming/sync-server';

// サーバー起動時刻（グローバル - Redisフォールバック用）
let serverStartTime: Date | null = null;

/**
 * GET: 現在の再生状態を取得（Redis統合版）
 */
export async function GET() {
  try {
    const scheduler = getScheduler();

    // プレイリストが空の場合は初期化
    if (scheduler.getPlaylist().length === 0) {
      await initializePlaylist();
    }

    // Redis から同期状態を取得
    let syncState = await getSyncState();

    if (!syncState) {
      // Redis が利用できない場合は scheduler から状態を取得
      console.log('Redis unavailable, using in-memory scheduler');
      syncState = convertSchedulerStateToSyncState(scheduler);
    } else {
      // Redis から取得した状態をネットワーク遅延補正
      syncState = calculateSyncPosition(syncState, Date.now());

      // 動画の長さを超えた場合は次の動画に進める
      const playlist = scheduler.getPlaylist();
      if (playlist.length > 0) {
        const currentVideo = playlist[syncState.currentVideoIndex];
        const videoDuration = currentVideo?.duration || 3600;

        if (syncState.position >= videoDuration) {
          // 次の動画に進む
          const nextIndex = (syncState.currentVideoIndex + 1) % playlist.length;
          const nextVideo = playlist[nextIndex];
          syncState = await advanceToNextVideo(syncState, nextVideo.id, nextIndex);
        }
      }
    }

    // レスポンス用にフォーマット
    const playlist = scheduler.getPlaylist();
    const currentVideo = playlist[syncState.currentVideoIndex];

    return NextResponse.json({
      success: true,
      data: {
        currentVideo: currentVideo
          ? {
              id: currentVideo.id,
              title: currentVideo.title,
              url: currentVideo.url,
            }
          : null,
        currentIndex: syncState.currentVideoIndex,
        position: Math.floor(syncState.position),
        isPlaying: syncState.isPlaying,
        totalVideos: playlist.length,
        serverTime: new Date().toISOString(),
        syncedFromRedis: !!syncState,
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
 * POST: プレイリストを更新（Redis統合版）
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

        // Redis にも保存
        const playlist = scheduler.getPlaylist();
        await setPlaylist(playlist.map((v) => v.id));

        // 各動画のメタデータも保存
        for (const video of playlist) {
          await setVideoMetadata(video.id, {
            id: video.id,
            title: video.title,
            url: video.url,
            duration: video.duration || 3600,
          });
        }

        // 同期状態を初期化
        if (playlist.length > 0) {
          await initializeSyncState(playlist[0].id, 0, playlist.length);
        }

        return NextResponse.json({
          success: true,
          message: 'Playlist refreshed and synced to Redis',
          totalVideos: playlist.length,
        });

      case 'set-duration':
        // 動画の長さを設定
        const { videoId, duration } = body;
        if (videoId && duration) {
          scheduler.setVideoDuration(videoId, duration);

          // Redis にも保存
          const playlist = scheduler.getPlaylist();
          const video = playlist.find((v) => v.id === videoId);
          if (video) {
            await setVideoMetadata(videoId, {
              id: video.id,
              title: video.title,
              url: video.url,
              duration,
            });
          }

          return NextResponse.json({
            success: true,
            message: `Duration set for ${videoId}: ${duration}s`,
          });
        }
        break;

      case 'sync-force':
        // 強制同期（管理者用）
        const { videoId: forceVideoId, position } = body;
        if (forceVideoId !== undefined && position !== undefined) {
          const playlist = scheduler.getPlaylist();
          const videoIndex = playlist.findIndex((v) => v.id === forceVideoId);

          if (videoIndex >= 0) {
            const newState: SyncState = {
              currentVideoId: forceVideoId,
              currentVideoIndex: videoIndex,
              position,
              timestamp: Date.now(),
              isPlaying: true,
              totalVideos: playlist.length,
              serverStartTime: Date.now(),
            };

            await setSyncState(newState);

            return NextResponse.json({
              success: true,
              message: 'Sync state forced',
              state: newState,
            });
          }
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

/**
 * Scheduler状態をSyncStateに変換（Redisフォールバック用）
 */
function convertSchedulerStateToSyncState(scheduler: any): SyncState {
  const state = scheduler.getPlaybackState();
  const playlist = scheduler.getPlaylist();

  return {
    currentVideoId: state.currentVideo?.id || '',
    currentVideoIndex: state.currentVideoIndex,
    position: state.position,
    timestamp: Date.now(),
    isPlaying: state.isPlaying,
    totalVideos: playlist.length,
    serverStartTime: serverStartTime?.getTime() || Date.now(),
  };
}
