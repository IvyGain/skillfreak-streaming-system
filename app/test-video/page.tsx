'use client';

import LarkVideoPlayer from '@/components/LarkVideoPlayer';

export default function TestVideoPage() {
  const fileToken = 'U5MtbbETooJlMkxq7jwjsCWGpHb';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lark Video Player - 最終版</h1>

      {/* 最終版コンポーネント */}
      <div className="mb-12">
        <LarkVideoPlayer
          fileToken={fileToken}
          title="20251114 サムネイル動画.mp4"
          aspectRatio="16:9"
        />
      </div>

      {/* 使用例 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💡 使用方法</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`<LarkVideoPlayer
  fileToken="U5MtbbETooJlMkxq7jwjsCWGpHb"
  title="イベント名"
  aspectRatio="16:9"
  maxWidth="1600px"
/>`}
        </pre>
      </div>

      {/* 次のステップ */}
      <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6">
        <h3 className="font-bold text-lg mb-2">🚀 次のステップ</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>このコンポーネントで動画が正常に再生されるか確認</li>
          <li>LarkBase API統合</li>
          <li>イベント一覧ページ実装</li>
          <li>24時間ライブ配信実装</li>
        </ol>
      </div>

      {/* システム統合設計 */}
      <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6">
        <h3 className="font-bold text-lg mb-2">📚 ドキュメント</h3>
        <p className="mb-2">システム統合の詳細設計:</p>
        <code className="bg-gray-800 text-white px-3 py-1 rounded">
          docs/system-integration.md
        </code>
      </div>
    </div>
  );
}
