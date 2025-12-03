/**
 * イベント詳細ページ（ダークテーマUI）
 * スクリーンショット準拠のデザイン
 */

import { getEventById } from '@/lib/larkbase-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomNavigation from '@/components/portal/BottomNavigation';
import { getCategoryById } from '@/lib/constants/categories';
import LarkVideoPlayer from '@/components/LarkVideoPlayer';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// YouTube動画IDを取得
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// YouTube埋め込みURL生成
function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
}

// YouTubeサムネイルURL生成
function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const category = getCategoryById(event.category);
  const eventDate = new Date(event.scheduled_at);
  const youtubeEmbedUrl = event.youtube_url ? getYouTubeEmbedUrl(event.youtube_url) : null;

  // サムネイルURL: LarkBaseサムネイル > YouTubeサムネイル > null
  // LarkBaseのサムネイルフィールドを最優先
  const getThumbnailUrl = (): string | null => {
    // 1. LarkBaseサムネイル（最優先）- larkbase-clientで既にtmp_urlが抽出済み
    if (typeof event.thumbnail === 'string' && event.thumbnail.trim() !== '') {
      return event.thumbnail;
    }
    // 2. YouTubeサムネイル（フォールバック）
    if (event.youtube_url) {
      const ytThumb = getYouTubeThumbnailUrl(event.youtube_url);
      if (ytThumb) return ytThumb;
    }
    return null;
  };
  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="min-h-screen bg-[#0F0F23] pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/" className="flex items-center">
            <Image
              src="/skillfreak-logo.png"
              alt="SkillFreak"
              width={120}
              height={30}
              className="h-7 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ヒーローイメージ */}
      <div className="relative w-full h-48 md:h-64">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized={thumbnailUrl.startsWith('/api/')}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
            <Image
              src="/skillfreak-logo.png"
              alt="SkillFreak"
              width={200}
              height={60}
              className="opacity-60"
            />
          </div>
        )}
        {/* カテゴリバッジ */}
        <div
          className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: category.color }}
        >
          {category.icon} {category.name}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* タイトル */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {event.title}
        </h1>

        {/* 評価 */}
        {event.rating && event.rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-yellow-400 font-semibold">{event.rating.toFixed(1)}</span>
            </div>
            {event.attendees && event.attendees > 0 && (
              <span className="text-gray-400 text-sm">({event.attendees}人が評価)</span>
            )}
          </div>
        )}

        {/* イベント情報 */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3 text-gray-300">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {eventDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              {eventDate.toLocaleDateString('ja-JP', { weekday: 'short' }) && `${eventDate.toLocaleDateString('ja-JP', { weekday: 'short' })}`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - {event.duration || 60}分間
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location || 'オンライン開催'}</span>
          </div>
          {event.attendees && event.attendees > 0 && (
            <div className="flex items-center gap-3 text-gray-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{event.attendees}人が参加</span>
            </div>
          )}
        </div>

        {/* 登壇者セクション */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">登壇者</h2>
          <div className="card p-4">
            <div className="flex items-center gap-4">
              {event.speaker?.avatar ? (
                <Image
                  src={event.speaker.avatar}
                  alt={event.speaker.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {event.speaker?.name?.charAt(0) || 'S'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-white font-semibold">{event.speaker?.name || 'SkillFreak'}</h3>
                <p className="text-gray-400 text-sm">{event.speaker?.title || 'Seminar'}</p>
              </div>
            </div>
            {/* SNSリンク */}
            {(event.speaker?.social?.twitter || event.speaker?.social?.github || event.speaker?.social?.linkedin) && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#2D1B69]">
                {event.speaker?.social?.twitter && (
                  <a href={event.speaker.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1DA1F2]/20 rounded-full hover:bg-[#1DA1F2]/40 transition-colors">
                    <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                )}
                {event.speaker?.social?.github && (
                  <a href={event.speaker.social.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {event.speaker?.social?.linkedin && (
                  <a href={event.speaker.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0A66C2]/20 rounded-full hover:bg-[#0A66C2]/40 transition-colors">
                    <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* イベント概要 */}
        {event.description && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">イベント概要</h2>
            <div className="card p-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </section>
        )}

        {/* タグ */}
        {event.tags && event.tags.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">タグ</h2>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#1A1A2E] border border-[#2D1B69] rounded-lg text-cyan-400 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* アーカイブ動画 */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">アーカイブ動画</h2>
          <div className="card overflow-hidden">
            {/* 優先順位: 1. Lark Drive → 2. YouTube → 3. 直接URL → 4. プレースホルダー */}
            {event.archive_file_token ? (
              // 1. Lark Drive 動画プレイヤー（最優先）
              <div className="bg-black">
                <LarkVideoPlayer
                  fileToken={event.archive_file_token}
                  title={event.title}
                />
                <div className="px-4 py-3 bg-[#1A1A2E] border-t border-[#2D1B69]">
                  <p className="text-xs text-gray-400">
                    🎬 Lark Drive アーカイブ再生 | File Token: <code className="text-cyan-400">{event.archive_file_token.substring(0, 20)}...</code>
                  </p>
                </div>
              </div>
            ) : youtubeEmbedUrl ? (
              // 2. YouTube埋め込み
              <div>
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={youtubeEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="px-4 py-3 bg-[#1A1A2E] border-t border-[#2D1B69]">
                  <p className="text-xs text-gray-400">
                    📺 YouTube埋め込み再生
                  </p>
                </div>
              </div>
            ) : event.archive_url ? (
              // 3. 直接URL（<video>タグ）
              <div>
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <video
                    controls
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  >
                    <source src={event.archive_url} type="video/mp4" />
                  </video>
                </div>
                <div className="px-4 py-3 bg-[#1A1A2E] border-t border-[#2D1B69]">
                  <p className="text-xs text-gray-400">
                    🎥 動画URL直接再生
                  </p>
                </div>
              </div>
            ) : (
              // 4. プレースホルダー（動画なし）
              <div className="aspect-video flex flex-col items-center justify-center bg-[#1A1A2E] p-8">
                <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 mb-2">アーカイブ動画準備中</p>
                <p className="text-xs text-gray-500">イベント終了後、アーカイブが公開されます</p>
              </div>
            )}
          </div>
        </section>

        {/* 特典・資料 */}
        {event.benefits && event.benefits.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">特典・資料</h2>
            <div className="space-y-3">
              {event.benefits.map((benefit) => (
                <div key={benefit.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                      {benefit.type === 'url' && (
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                      {benefit.type === 'prompt' && (
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      )}
                      {benefit.type === 'text' && (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{benefit.title}</h3>
                      {benefit.description && (
                        <p className="text-gray-400 text-sm">{benefit.description}</p>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* アクションボタン */}
        <div className="space-y-3">
          {event.survey_url && (
            <a
              href={event.survey_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-orange-500 text-white text-center rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                アンケート回答
              </span>
            </a>
          )}
          <Link
            href="/live"
            className="block w-full py-4 bg-emerald-500 text-white text-center rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              視聴報告
            </span>
          </Link>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
