'use client';

/**
 * アーカイブ動画プレイヤーコンポーネント
 *
 * - Lark Drive動画をストリーミング再生
 * - Discord認証チェック
 * - 右クリック無効化
 */

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface ArchiveVideoPlayerProps {
  eventId: string;
}

interface VideoData {
  url: string;
  title: string;
  description: string;
  expiresIn: number;
  publishedAt: string;
}

export default function ArchiveVideoPlayer({ eventId }: ArchiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // 動画URL取得API
        const res = await fetch(`/api/archive/${eventId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'アクセスが拒否されました');
          setLoading(false);
          return;
        }

        setVideoData(data);

        // Video.js初期化
        if (videoRef.current && !playerRef.current) {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            fluid: true,
            preload: 'auto',
            sources: [
              {
                src: data.url,
                type: 'video/mp4',
              },
            ],
            // ダウンロードボタン非表示
            controlBar: {
              pictureInPictureToggle: false,
            },
          });

          // 右クリック無効化
          videoRef.current.addEventListener('contextmenu', (e) => {
            e.preventDefault();
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Video fetch error:', err);
        setError('動画の読み込みに失敗しました');
        setLoading(false);
      }
    };

    fetchVideo();

    // クリーンアップ
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">動画を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-bold mb-2">エラー</h3>
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('会員') && (
          <a
            href="https://skillfreak.ivygain.jp/join"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            SkillFreakに入会する
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videoData && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-2xl font-bold mb-2">{videoData.title}</h2>
          {videoData.description && (
            <p className="text-gray-600 mb-2">{videoData.description}</p>
          )}
          <p className="text-sm text-gray-500">
            公開日: {new Date(videoData.publishedAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
      )}

      <div data-vjs-player className="rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>

      {videoData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⏰ この動画は24時間後にアクセス期限が切れます
          </p>
        </div>
      )}
    </div>
  );
}
