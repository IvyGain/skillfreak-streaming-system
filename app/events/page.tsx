/**
 * イベント一覧ページ
 * LarkBaseからイベント情報を取得して表示
 */

import { getAllEvents } from '@/lib/larkbase-client';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60秒ごとに再検証

async function EventsList() {
  const events = await getAllEvents({
    status: 'published',
    visibility: 'public',
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col h-full">
            {/* アーカイブバッジ */}
            {event.archive_file_token && (
              <span className="inline-block px-2 py-1 mb-3 text-xs font-semibold text-green-800 bg-green-100 rounded">
                📹 アーカイブあり
              </span>
            )}

            {/* タイトル */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {event.title}
            </h2>

            {/* 説明 */}
            {event.description && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {event.description}
              </p>
            )}

            {/* メタ情報 */}
            <div className="mt-auto space-y-2 text-sm text-gray-500">
              {event.scheduled_at && (
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  {new Date(event.scheduled_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}

              {event.youtube_url && (
                <div className="flex items-center">
                  <span className="mr-2">🎥</span>
                  YouTube配信
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}

      {events.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <p className="text-lg">イベントはまだありません</p>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            SkillFreak イベント一覧
          </h1>
          <p className="mt-2 text-gray-600">
            過去のイベントアーカイブを視聴できます
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <EventsList />
        </Suspense>
      </main>

      {/* 24時間VODへのリンク */}
      <div className="fixed bottom-8 right-8">
        <Link
          href="/live"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-colors"
        >
          <span className="text-lg">🔴</span>
          <span>24時間配信を見る</span>
        </Link>
      </div>
    </div>
  );
}
