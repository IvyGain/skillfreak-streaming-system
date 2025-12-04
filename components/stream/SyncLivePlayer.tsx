'use client';

/**
 * Sync Live Player - 24時間VOD配信用同期プレイヤー
 *
 * サーバーから再生状態を取得し、全員が同じ位置で視聴
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface SyncState {
  currentVideo: {
    id: string;
    title: string;
    url: string;
  } | null;
  currentIndex: number;
  position: number;
  isPlaying: boolean;
  totalVideos: number;
  serverTime: string;
  syncedFromRedis?: boolean;  // Redis同期フラグ
}

/**
 * YouTube Video IDを抽出
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function SyncLivePlayer() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [clientTimeOffset, setClientTimeOffset] = useState<number>(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // サーバーから再生状態を取得（改善版 - 時刻補正付き）
  const fetchSyncState = useCallback(async () => {
    try {
      const requestTime = Date.now();
      const res = await fetch('/api/stream/sync');
      const responseTime = Date.now();
      const data = await res.json();

      if (data.success) {
        // ネットワーク遅延を計算
        const networkLatency = (responseTime - requestTime) / 2;
        const serverTime = new Date(data.data.serverTime).getTime();
        const adjustedServerTime = serverTime + networkLatency;

        // クライアントとサーバーの時刻差を記録
        const timeOffset = adjustedServerTime - responseTime;
        setClientTimeOffset(timeOffset);

        // 同期状態を保存
        setSyncState(data.data);
        setLastSync(new Date());
        setError(null);

        // Redis同期の場合はログ出力
        if (data.data.syncedFromRedis) {
          console.log('✓ Synced from Redis (network latency:', networkLatency.toFixed(0), 'ms)');
        }
      } else {
        setError(data.error || 'Failed to fetch sync state');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回ロードと適応的同期
  useEffect(() => {
    fetchSyncState();

    // 最初は15秒ごとに同期（動画切り替え検知用）
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(fetchSyncState, 15000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [fetchSyncState]);

  // YouTube埋め込みURLを生成（開始位置付き・改善版）
  const getYouTubeEmbedUrl = (url: string, startPosition: number): string => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return '';

    // ネットワーク遅延を考慮した開始位置補正
    const adjustedPosition = Math.max(0, Math.floor(startPosition));

    // 開始位置を秒で指定（より正確な同期のためのパラメータ追加）
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${adjustedPosition}&rel=0&modestbranding=1&enablejsapi=1`;
  };

  // 現在の再生位置を計算（時刻補正付き）
  const getCurrentPosition = useCallback(() => {
    if (!syncState || !lastSync) return 0;

    const now = Date.now();
    const elapsedSinceSync = (now - lastSync.getTime()) / 1000;
    return syncState.position + elapsedSinceSync;
  }, [syncState, lastSync]);

  if (isLoading) {
    return (
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  if (error || !syncState?.currentVideo) {
    return (
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Stream Offline</h3>
          <p className="mb-4">{error || 'No content available'}</p>
          <button
            onClick={fetchSyncState}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { currentVideo, currentIndex, position, totalVideos } = syncState;
  const youtubeId = getYouTubeVideoId(currentVideo.url);
  const isYouTube = !!youtubeId;
  const isDirectVideo = currentVideo.url.includes('.mp4') || currentVideo.url.includes('notion.so');

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative">
        {isYouTube ? (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={playerRef}
              key={`${currentVideo.id}-${Math.floor(position / 60)}`}  // 分単位でキー更新
              src={getYouTubeEmbedUrl(currentVideo.url, position)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        ) : isDirectVideo ? (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <video
              key={currentVideo.id}
              autoPlay
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            >
              <source src={currentVideo.url} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            <p className="text-gray-400">Unsupported video format</p>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>

        {/* Now Playing Info */}
        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-white text-sm">
            {currentIndex + 1} / {totalVideos}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {isYouTube ? 'YouTube' : 'Archive'}
          </div>
        </div>

        {/* Current Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <h3 className="text-white font-medium truncate">{currentVideo.title}</h3>
        </div>
      </div>

      {/* Sync Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              syncState?.syncedFromRedis ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                24/7 Live Stream
                {syncState?.syncedFromRedis && (
                  <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full">Redis</span>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                {lastSync ? `Synced ${Math.floor((Date.now() - lastSync.getTime()) / 1000)}s ago` : 'Syncing...'}
              </div>
            </div>
          </div>
          <button
            onClick={fetchSyncState}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Sync Now"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
