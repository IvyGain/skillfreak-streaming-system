/**
 * 24時間VOD配信ページ
 * Lark Driveフォルダ内の動画を順次リピート再生
 */

import { getArchivedEvents } from '@/lib/larkbase-client';
import LiveStreamPlayer from '@/components/stream/LiveStreamPlayer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function LivePage() {
  // アーカイブありのイベントを取得
  const events = await getArchivedEvents();

  // ファイルトークンのリストを作成
  const fileTokens = events
    .filter((e) => e.archive_file_token)
    .map((e) => ({
      fileToken: e.archive_file_token!,
      title: e.title,
      id: e.id,
    }));

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                <h1 className="text-2xl font-bold text-white">LIVE</h1>
              </div>
              <span className="text-gray-400 text-sm">
                24時間ノンストップ配信中
              </span>
            </div>

            <Link
              href="/events"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              📚 アーカイブ一覧
            </Link>
          </div>
        </div>
      </header>

      {/* メインプレイヤー */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fileTokens.length > 0 ? (
          <LiveStreamPlayer playlist={fileTokens} />
        ) : (
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-4">配信準備中...</p>
              <Link
                href="/events"
                className="text-red-500 hover:text-red-400 underline"
              >
                アーカイブ一覧を見る
              </Link>
            </div>
          </div>
        )}

        {/* プレイリスト情報 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-white text-lg font-semibold mb-4">
            📋 プレイリスト ({fileTokens.length}本)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileTokens.map((video, index) => (
              <div
                key={video.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {video.title}
                    </h3>
                    <Link
                      href={`/events/${video.id}`}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      詳細を見る →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 配信情報 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🔴</div>
            <div className="text-white font-semibold">24時間配信</div>
            <div className="text-gray-400 text-sm">ノンストップ</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🎥</div>
            <div className="text-white font-semibold">{fileTokens.length}本</div>
            <div className="text-gray-400 text-sm">アーカイブ動画</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">♾️</div>
            <div className="text-white font-semibold">リピート再生</div>
            <div className="text-gray-400 text-sm">自動ループ</div>
          </div>
        </div>
      </main>
    </div>
  );
}
