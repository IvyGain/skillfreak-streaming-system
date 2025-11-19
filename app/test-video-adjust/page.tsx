'use client';

import { useState } from 'react';

/**
 * Lark Video Player - 手動調整ページ
 *
 * スライダーでiframeの位置・サイズを調整して最適値を見つける
 */
export default function TestVideoAdjustPage() {
  const fileToken = 'U5MtbbETooJlMkxq7jwjsCWGpHb';
  const larkUrl = `https://ivygain-project.jp.larksuite.com/file/${fileToken}`;

  // 調整パラメータ
  const [top, setTop] = useState(-13);
  const [left, setLeft] = useState(-2);
  const [width, setWidth] = useState(110);
  const [height, setHeight] = useState(128);
  const [scale, setScale] = useState(1.0);

  // コード生成
  const generateCode = () => {
    return `style={{
  position: 'absolute',
  top: '${top}%',
  left: '${left}%',
  width: '${width}%',
  height: '${height}%',
  border: 'none',
  transform: 'scale(${scale})',
  transformOrigin: 'center center',
}}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lark Video Player - 手動調整</h1>

      {/* プレビュー */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
        <div
          className="relative bg-black rounded-lg overflow-hidden shadow-2xl mx-auto"
          style={{
            maxWidth: '1600px',
            paddingBottom: '56.25%', // 16:9
            height: 0,
          }}
        >
          <iframe
            src={larkUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

      {/* 調整コントロール */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">調整</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scale調整（追加） */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium text-blue-600">
              🔍 Scale (拡大縮小): {scale.toFixed(2)}x
              <span className="text-sm text-gray-500 ml-2">(全体の拡大縮小)</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x (縮小)</span>
              <span>1.0x (等倍)</span>
              <span>1.5x (拡大)</span>
            </div>
          </div>

          {/* Top調整 */}
          <div>
            <label className="block mb-2 font-medium">
              Top: {top}%
              <span className="text-sm text-gray-500 ml-2">(ヘッダーを隠す)</span>
            </label>
            <input
              type="range"
              min="-20"
              max="0"
              step="0.5"
              value={top}
              onChange={(e) => setTop(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Left調整 */}
          <div>
            <label className="block mb-2 font-medium">
              Left: {left}%
              <span className="text-sm text-gray-500 ml-2">(左余白調整)</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={left}
              onChange={(e) => setLeft(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Width調整 */}
          <div>
            <label className="block mb-2 font-medium">
              Width: {width}%
              <span className="text-sm text-gray-500 ml-2">(右サイドバーを隠す)</span>
            </label>
            <input
              type="range"
              min="100"
              max="150"
              step="1"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Height調整 */}
          <div>
            <label className="block mb-2 font-medium">
              Height: {height}%
              <span className="text-sm text-gray-500 ml-2">(下部を隠す)</span>
            </label>
            <input
              type="range"
              min="100"
              max="150"
              step="1"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* リセットボタン */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              setTop(-13);
              setLeft(-2);
              setWidth(110);
              setHeight(128);
              setScale(1.0);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            デフォルトに戻す
          </button>
          <button
            onClick={() => {
              setTop(-11);
              setLeft(-3);
              setWidth(112);
              setHeight(125);
              setScale(1.0);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            前のバージョン
          </button>
          <button
            onClick={() => {
              setScale(1.0);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Scale リセット (1.0x)
          </button>
        </div>
      </div>

      {/* 生成されたコード */}
      <div className="bg-gray-800 text-green-400 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">生成されたCSS</h2>
        <pre className="overflow-x-auto">
          <code>{generateCode()}</code>
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(generateCode());
            alert('コピーしました！');
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📋 コピー
        </button>
      </div>

      {/* 使い方 */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6">
        <h3 className="font-bold text-lg mb-2">💡 使い方</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>スライダーを動かして最適な表示を見つける</li>
          <li>満足したら「コピー」ボタンでCSSをコピー</li>
          <li>LarkVideoPlayer.tsxのstyleを更新</li>
        </ol>
      </div>
    </div>
  );
}
