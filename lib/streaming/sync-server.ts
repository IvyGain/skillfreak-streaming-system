/**
 * Sync Server - 24時間配信同期サーバー（Serverless対応）
 *
 * Upstash Redisを使用して複数クライアント間でストリーミング状態を同期
 * - サーバーレス環境で永続化
 * - 複数クライアントが同じ動画・同じ位置で視聴
 * - ネットワーク遅延を考慮した同期
 */

import { Redis } from '@upstash/redis';

export interface SyncState {
  currentVideoId: string;
  currentVideoIndex: number;
  position: number; // 秒
  timestamp: number; // Unix timestamp (ms)
  isPlaying: boolean;
  totalVideos: number;
  serverStartTime: number; // Unix timestamp (ms)
}

export interface VideoMetadata {
  id: string;
  title: string;
  url: string;
  duration: number; // 秒
}

const REDIS_KEY_SYNC_STATE = 'streaming:sync-state';
const REDIS_KEY_PLAYLIST = 'streaming:playlist';
const REDIS_KEY_VIDEO_META = 'streaming:video-meta:';
const SYNC_STATE_TTL = 86400; // 24時間（秒）

/**
 * Redis クライアントを取得
 */
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Upstash Redis credentials not configured. Sync will use in-memory fallback.');
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

/**
 * 同期状態を取得
 */
export async function getSyncState(): Promise<SyncState | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const state = await redis.get<SyncState>(REDIS_KEY_SYNC_STATE);
    return state;
  } catch (error) {
    console.error('Failed to get sync state from Redis:', error);
    return null;
  }
}

/**
 * 同期状態を保存
 */
export async function setSyncState(state: SyncState): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.set(REDIS_KEY_SYNC_STATE, state, {
      ex: SYNC_STATE_TTL,
    });
    return true;
  } catch (error) {
    console.error('Failed to set sync state to Redis:', error);
    return false;
  }
}

/**
 * プレイリストを保存
 */
export async function setPlaylist(videoIds: string[]): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.set(REDIS_KEY_PLAYLIST, videoIds, {
      ex: SYNC_STATE_TTL,
    });
    return true;
  } catch (error) {
    console.error('Failed to set playlist to Redis:', error);
    return false;
  }
}

/**
 * プレイリストを取得
 */
export async function getPlaylist(): Promise<string[] | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const playlist = await redis.get<string[]>(REDIS_KEY_PLAYLIST);
    return playlist;
  } catch (error) {
    console.error('Failed to get playlist from Redis:', error);
    return null;
  }
}

/**
 * 動画メタデータを保存
 */
export async function setVideoMetadata(videoId: string, metadata: VideoMetadata): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.set(`${REDIS_KEY_VIDEO_META}${videoId}`, metadata, {
      ex: SYNC_STATE_TTL,
    });
    return true;
  } catch (error) {
    console.error('Failed to set video metadata to Redis:', error);
    return false;
  }
}

/**
 * 動画メタデータを取得
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const metadata = await redis.get<VideoMetadata>(`${REDIS_KEY_VIDEO_META}${videoId}`);
    return metadata;
  } catch (error) {
    console.error('Failed to get video metadata from Redis:', error);
    return null;
  }
}

/**
 * 同期状態を計算（ネットワーク遅延補正付き）
 * @param state 保存されている同期状態
 * @param clientTimestamp クライアント側のタイムスタンプ
 * @returns 補正後の同期状態
 */
export function calculateSyncPosition(
  state: SyncState,
  clientTimestamp: number = Date.now()
): SyncState {
  if (!state.isPlaying) {
    return state;
  }

  // サーバー時刻とクライアント時刻の差分を計算
  const elapsedMs = clientTimestamp - state.timestamp;
  const elapsedSeconds = elapsedMs / 1000;

  // 補正後の再生位置
  const correctedPosition = state.position + elapsedSeconds;

  return {
    ...state,
    position: correctedPosition,
    timestamp: clientTimestamp,
  };
}

/**
 * 同期状態を初期化（サーバー起動時）
 */
export async function initializeSyncState(
  videoId: string,
  videoIndex: number,
  totalVideos: number
): Promise<SyncState> {
  const now = Date.now();

  const initialState: SyncState = {
    currentVideoId: videoId,
    currentVideoIndex: videoIndex,
    position: 0,
    timestamp: now,
    isPlaying: true,
    totalVideos,
    serverStartTime: now,
  };

  await setSyncState(initialState);
  return initialState;
}

/**
 * 動画を次に進める
 */
export async function advanceToNextVideo(
  currentState: SyncState,
  nextVideoId: string,
  nextVideoIndex: number
): Promise<SyncState> {
  const now = Date.now();

  const nextState: SyncState = {
    ...currentState,
    currentVideoId: nextVideoId,
    currentVideoIndex: nextVideoIndex,
    position: 0,
    timestamp: now,
    isPlaying: true,
  };

  await setSyncState(nextState);
  return nextState;
}

/**
 * Redis接続をテスト
 */
export async function testRedisConnection(): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const testKey = 'streaming:test';
    const testValue = Date.now().toString();
    await redis.set(testKey, testValue, { ex: 10 });
    const result = await redis.get(testKey);
    await redis.del(testKey);
    return result === testValue;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}
