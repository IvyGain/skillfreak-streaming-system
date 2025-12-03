/**
 * Playlist Page - Individual Playback Mode
 * Users can browse and play videos at their own pace
 */

import { getVODEvents } from '@/lib/larkbase-client';
import VODStreamPlayer from '@/components/stream/VODStreamPlayer';
import BottomNavigation from '@/components/portal/BottomNavigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function PlaylistPage() {
  // Get events with archives or YouTube URLs
  const events = await getVODEvents();

  // Create playlist with fileToken, YouTube URL, or archive URL
  const playlist = events.map((e) => ({
    fileToken: e.archive_file_token || undefined,
    youtubeUrl: e.youtube_url || undefined,
    archiveUrl: e.archive_url || undefined,
    title: e.title,
    id: e.id,
  }));

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/skillfreak-icon.png"
                alt="SkillFreak"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold gradient-text">SkillFreak</h1>
                <p className="text-xs text-gray-400">Playlist</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/live"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 bg-[#1A1A2E] text-white rounded-full text-sm font-medium hover:bg-[#2D1B69] transition-colors"
              >
                Archives
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="card p-4 mb-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Playlist</h2>
                <p className="text-sm text-gray-400">Play at your own pace</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{playlist.length}</div>
              <div className="text-xs text-gray-400">videos</div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        {playlist.length > 0 ? (
          <div className="card overflow-hidden mb-6">
            <VODStreamPlayer playlist={playlist} />
          </div>
        ) : (
          <div className="card aspect-video flex items-center justify-center mb-6">
            <div className="text-center text-gray-400 p-8">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">No videos yet</h3>
              <p className="mb-4">No archived videos available</p>
              <Link
                href="/events"
                className="btn btn-primary"
              >
                View Archives
              </Link>
            </div>
          </div>
        )}

        {/* Playlist */}
        {playlist.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Videos ({playlist.length})
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {playlist.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/events/${video.id}`}
                  className="card p-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{video.title}</h4>
                      <p className="text-sm text-gray-400">
                        {video.youtubeUrl ? 'YouTube' : video.fileToken ? 'Lark' : 'Archive'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Live Channel Link */}
        <section className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Want to watch with everyone?</h3>
          <p className="text-gray-400 mb-4">
            Join the 24/7 live channel where everyone watches the same video together.
          </p>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Watch Live Channel
          </Link>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
