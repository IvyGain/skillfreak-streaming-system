/**
 * 24 Hours VOD Streaming Page (Synchronized)
 * All viewers watch the same video at the same position - like a TV channel
 */

import SyncLivePlayer from '@/components/stream/SyncLivePlayer';
import BottomNavigation from '@/components/portal/BottomNavigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;  // No cache for live sync

export default function LivePage() {
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
                <p className="text-xs text-gray-400">Live</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <Link
                href="/playlist"
                className="px-4 py-2 bg-[#1A1A2E] text-white rounded-full text-sm font-medium hover:bg-[#2D1B69] transition-colors"
              >
                Playlist
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

      {/* Main Player */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Live Status Banner */}
        <div className="card p-4 mb-6 bg-gradient-to-r from-red-900/30 to-purple-900/30 border-red-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="w-4 h-4 bg-white rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">24 Hours Live Channel</h2>
                <p className="text-sm text-gray-400">Everyone watching the same stream</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Synchronized</div>
              <div className="text-sm text-green-400">All viewers in sync</div>
            </div>
          </div>
        </div>

        {/* Synchronized Video Player */}
        <div className="card overflow-hidden mb-6">
          <SyncLivePlayer />
        </div>

        {/* Info Cards */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">
              <span className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="text-white font-semibold">24/7</div>
            <div className="text-gray-400 text-sm">Streaming</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">
              <svg className="w-8 h-8 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-white font-semibold">Synced</div>
            <div className="text-gray-400 text-sm">Together</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">
              <svg className="w-8 h-8 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="text-white font-semibold">Loop</div>
            <div className="text-gray-400 text-sm">Auto-repeat</div>
          </div>
        </section>

        {/* Links */}
        <section className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Want to choose your own video?</h3>
          <p className="text-gray-400 mb-4">
            Visit the playlist page to browse and play videos at your own pace.
          </p>
          <div className="flex gap-3">
            <Link
              href="/playlist"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Browse Playlist
            </Link>
            <Link
              href="/events"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              View Archives
            </Link>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
