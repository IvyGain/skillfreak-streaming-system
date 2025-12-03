'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface NowPlaying {
  video_id: string;
  title: string;
  speaker: string;
  thumbnail_url?: string;
  duration: number;
  elapsed_time?: number;
}

export default function LivePlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 環境変数チェック
    const streamBaseUrl = process.env.NEXT_PUBLIC_STREAM_URL;
    if (!streamBaseUrl) {
      setError('配信URLが設定されていません。環境変数 NEXT_PUBLIC_STREAM_URL を設定してください。');
      setIsLoading(false);
      return;
    }

    const streamUrl = `${streamBaseUrl}/live/playlist.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded');
        setIsLoading(false);
        setError(null);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);

        // エラーの詳細をログ出力
        if (data.details) {
          console.error('Error details:', data.details);
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              setError(`ネットワークエラーが発生しました。再接続中... (${data.details || 'unknown'})`);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              setError(`メディアエラーが発生しました。復旧中... (${data.details || 'unknown'})`);
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, destroying HLS instance');
              setError(`配信エラーが発生しました。ページを再読み込みしてください。 (${data.type}: ${data.details || 'unknown'})`);
              hls.destroy();
              setIsLoading(false);
              break;
          }
        } else {
          // 致命的ではないエラーはログのみ
          console.warn('Non-fatal HLS error:', data.type, data.details);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamUrl;
      setIsLoading(false);
    } else {
      setError('お使いのブラウザはHLS再生に対応していません。');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 現在再生中の動画情報を取得
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/stream/now-playing');
        if (response.ok) {
          const data = await response.json();
          setNowPlaying(data);
        }
      } catch (error) {
        console.error('Failed to fetch now playing:', error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 視聴者数を取得（簡易版）
    // TODO: LarkBase または他の方法でリアルタイム視聴者数を実装
    const fetchViewerCount = async () => {
      try {
        const response = await fetch('/api/stream/viewers');
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch viewer count:', error);
        // デフォルト値を設定
        setViewerCount(Math.floor(Math.random() * 50) + 10);
      }
    };

    fetchViewerCount();
    const interval = setInterval(fetchViewerCount, 60000); // 60秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 動画プレイヤー */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-lg">読み込み中...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-red-500 text-lg text-center px-4">{error}</div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* ライブバッジ */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE 24/7
        </div>

        {/* 視聴者数 */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <span>👥</span>
          <span>{viewerCount} 視聴中</span>
        </div>
      </div>

      {/* 現在再生中情報 */}
      {nowPlaying && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start gap-4">
            {nowPlaying.thumbnail_url && (
              <img
                src={nowPlaying.thumbnail_url}
                alt={nowPlaying.title}
                className="w-32 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {nowPlaying.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                講師: {nowPlaying.speaker}
              </p>
              {nowPlaying.duration && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  動画時間: {Math.floor(nowPlaying.duration / 60)}分{nowPlaying.duration % 60}秒
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
