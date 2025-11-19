'use client';

/**
 * Lark Video Player Component
 *
 * YouTube動画のアスペクト比（16:9）に最適化されたプレイヤー
 * Larkのヘッダー・サイドバーを完全に隠してクリーンな埋め込みを実現
 */

import { useEffect, useState } from 'react';

interface LarkVideoPlayerProps {
  /** Lark DriveのFile Token */
  fileToken: string;
  /** 動画タイトル（オプション） */
  title?: string;
  /** アスペクト比（デフォルト: 16:9） */
  aspectRatio?: '16:9' | '4:3' | '21:9';
  /** 最大幅（デフォルト: 1600px） */
  maxWidth?: string;
  /** クラス名（追加のスタイリング用） */
  className?: string;
}

export default function LarkVideoPlayer({
  fileToken,
  title,
  aspectRatio = '16:9',
  maxWidth = '1600px',
  className = '',
}: LarkVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Lark共有URL
  const larkUrl = `https://ivygain-project.jp.larksuite.com/file/${fileToken}`;

  // アスペクト比のパーセント計算
  const aspectRatioMap = {
    '16:9': 56.25,  // (9/16) * 100
    '4:3': 75,      // (3/4) * 100
    '21:9': 42.86,  // (9/21) * 100
  };

  const paddingBottom = aspectRatioMap[aspectRatio];

  useEffect(() => {
    // iframe読み込み後にローディングを解除
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* タイトル */}
      {title && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
      )}

      {/* ビデオプレイヤー */}
      <div
        className="relative mx-auto"
        style={{ maxWidth }}
      >
        {/* ローディング表示 */}
        {isLoading && (
          <div
            className="absolute inset-0 bg-black rounded-lg flex items-center justify-center z-10"
            style={{ paddingBottom: `${paddingBottom}%` }}
          >
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>動画を読み込んでいます...</p>
            </div>
          </div>
        )}

        {/* 16:9アスペクト比コンテナ（1px縮小） */}
        <div
          className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
          style={{
            paddingBottom: `calc(${paddingBottom}% - 1px)`,
            height: 0,
          }}
        >
          {/* Lark iframe（UIを隠す - 最適化版） */}
          <iframe
            src={larkUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            style={{
              position: 'absolute',
              // YouTube動画サイズに合わせた調整（最適化版）
              top: '-18.5%',
              left: '-3.5%',
              width: '110%',
              height: '129%',
              border: 'none',
              transform: 'scale(0.98)',
              transformOrigin: 'center center',
            }}
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* プレイヤー情報 */}
      <div className="mt-3 text-sm text-gray-500 text-center">
        <p>🎬 Lark Drive アーカイブ再生</p>
      </div>
    </div>
  );
}
