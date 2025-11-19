'use client';

/**
 * 24時間ライブストリームプレイヤー
 * プレイリストを順次リピート再生
 */

import { useState, useEffect, useCallback } from 'react';
import LarkVideoPlayer from '../LarkVideoPlayer';

interface Video {
  fileToken: string;
  title: string;
  id: string;
}

interface LiveStreamPlayerProps {
  playlist: Video[];
}

export default function LiveStreamPlayer({ playlist }: LiveStreamPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentVideo = playlist[currentIndex];

  // 次の動画に移動
  const nextVideo = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  // 前の動画に移動
  const prevVideo = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  // 自動再生タイマー（デモ用 - 実際はiframeのonEndedイベントを使用）
  useEffect(() => {
    if (!isPlaying || playlist.length <= 1) return;

    // 模擬的な進行状況（実際の実装では動画の再生時間を使用）
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextVideo();
          return 0;
        }
        return prev + 0.5; // 200秒 = 約3分の動画を想定
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, nextVideo, playlist.length]);

  if (!currentVideo) {
    return (
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
        <p className="text-gray-400">プレイリストが空です</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* プレイヤー */}
      <div className="relative">
        <LarkVideoPlayer
          fileToken={currentVideo.fileToken}
          className="w-full"
        />

        {/* 再生中の動画情報オーバーレイ */}
        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <span className="font-semibold">LIVE</span>
          </div>
          <div className="text-white text-sm mt-1">{currentVideo.title}</div>
        </div>

        {/* プレイリスト位置インジケーター */}
        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-white text-sm">
            {currentIndex + 1} / {playlist.length}
          </div>
        </div>
      </div>

      {/* コントロール */}
      <div className="bg-gray-800 rounded-lg p-4">
        {/* 進行状況バー */}
        <div className="mb-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>進行中: {Math.round(progress)}%</span>
            <span>
              次の動画まで: {Math.round((100 - progress) * 2)}秒
            </span>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevVideo}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="前の動画"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={nextVideo}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="次の動画"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 現在再生中の情報 */}
        <div className="mt-4 text-center">
          <div className="text-white font-medium">{currentVideo.title}</div>
          <div className="text-gray-400 text-sm mt-1">
            {isPlaying ? '🔴 配信中' : '⏸️ 一時停止中'}
          </div>
        </div>
      </div>
    </div>
  );
}
