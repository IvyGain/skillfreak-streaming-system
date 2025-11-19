'use client';

import { useState } from 'react';

/**
 * 動画直接再生テストページ
 *
 * Lark APIで取得した直接URLで<video>タグ再生をテスト
 */
export default function TestDirectVideoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);

  const fileToken = 'U5MtbbETooJlMkxq7jwjsCWGpHb';

  const fetchVideoUrl = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/video-direct?token=${fileToken}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '動画URLの取得に失敗しました');
        console.error('API Error:', data);
        return;
      }

      setVideoUrl(data.videoUrl);
      setFileInfo(data.fileInfo);
      console.log('✅ Video URL:', data.videoUrl);
      console.log('📄 File Info:', data.fileInfo);

    } catch (err: any) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">動画直接再生テスト</h1>

      {/* 取得ボタン */}
      <div className="mb-8">
        <button
          onClick={fetchVideoUrl}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '取得中...' : '動画URLを取得'}
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-2">エラー</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* ファイル情報 */}
      {fileInfo && (
        <div className="mb-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold mb-2">ファイル情報</h3>
          <pre className="text-xs overflow-x-auto bg-gray-800 text-green-400 p-4 rounded">
            {JSON.stringify(fileInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* 動画プレイヤー */}
      {videoUrl && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">動画プレイヤー（video要素）</h2>

          {/* 方法1: video要素で直接再生 */}
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              src={videoUrl}
              controls
              className="w-full"
              onError={(e) => {
                console.error('Video error:', e);
                setError('動画の再生に失敗しました');
              }}
              onLoadedMetadata={() => {
                console.log('✅ Video loaded successfully');
              }}
            >
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>

          {/* URL表示 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold mb-2">取得されたURL</h3>
            <code className="text-xs break-all bg-gray-800 text-green-400 p-2 rounded block">
              {videoUrl}
            </code>
          </div>

          {/* 比較: iframe埋め込み */}
          <div>
            <h2 className="text-xl font-semibold mb-4">比較: iframe埋め込み</h2>
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={`https://ivygain-project.jp.larksuite.com/file/${fileToken}`}
                width="100%"
                height="500px"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* 説明 */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6">
        <h3 className="font-bold text-lg mb-2">💡 このテストの目的</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Lark APIで動画の直接URLを取得できるか</li>
          <li>取得したURLで&lt;video&gt;タグで再生できるか</li>
          <li>レスポンシブ対応が可能か</li>
        </ol>
      </div>
    </div>
  );
}
