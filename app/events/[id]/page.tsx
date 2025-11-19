/**
 * イベント詳細ページ
 * LarkBaseから詳細情報を取得し、Lark Drive動画を再生
 */

import { getEventById } from '@/lib/larkbase-client';
import { notFound } from 'next/navigation';
import LarkVideoPlayer from '@/components/LarkVideoPlayer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="mr-2">←</span>
            イベント一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            {event.scheduled_at && (
              <span>
                📅{' '}
                {new Date(event.scheduled_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {event.visibility === 'members-only' && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                🔒 会員限定
              </span>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 動画プレイヤー */}
          <div className="lg:col-span-2">
            {event.archive_file_token ? (
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <LarkVideoPlayer
                  fileToken={event.archive_file_token}
                  title={event.title}
                />
              </div>
            ) : event.youtube_url ? (
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-700 mb-4">
                    このイベントのアーカイブはまだ処理中です
                  </p>
                  <a
                    href={event.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <span>▶️</span>
                    YouTubeで視聴
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-gray-700">動画は準備中です</p>
              </div>
            )}

            {/* 説明 */}
            {event.description && (
              <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  概要
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* イベント情報 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                イベント情報
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">ステータス</dt>
                  <dd className="mt-1">
                    {event.status === 'published' && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        ✅ 公開中
                      </span>
                    )}
                    {event.status === 'draft' && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                        📝 下書き
                      </span>
                    )}
                    {event.status === 'archived' && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        📦 アーカイブ
                      </span>
                    )}
                  </dd>
                </div>

                {event.published_at && (
                  <div>
                    <dt className="text-gray-500">公開日時</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(event.published_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                )}

                {event.created_at && (
                  <div>
                    <dt className="text-gray-500">作成日時</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(event.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* リンク */}
            {event.youtube_url && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  関連リンク
                </h2>
                <a
                  href={event.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <span>🎥</span>
                  YouTubeで開く
                </a>
              </div>
            )}

            {/* 24時間配信へのリンク */}
            <Link
              href="/live"
              className="block bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg p-6 hover:from-red-700 hover:to-pink-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔴</span>
                <div>
                  <div className="font-semibold">24時間配信</div>
                  <div className="text-sm text-red-100">
                    ノンストップでアーカイブを配信中
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
