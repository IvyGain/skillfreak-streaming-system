'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '@/components/portal/SearchBar';
import CategoryFilter from '@/components/portal/CategoryFilter';
import EventCard, { type Event } from '@/components/portal/EventCard';

interface HomeClientProps {
  events: Event[];
}

export default function HomeClient({ events }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skillfreak-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      localStorage.setItem('skillfreak-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.speaker.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    // Sort: upcoming first, then by date descending
    return filtered.sort((a, b) => {
      if (!a.isArchived && b.isArchived) return -1;
      if (a.isArchived && !b.isArchived) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [events, searchQuery, selectedCategory]);

  // Featured event (latest with archive)
  const featuredEvent = events.find((e) => e.isArchived && e.archive_file_token);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/skillfreak-icon.png"
                alt="SkillFreak"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold gradient-text">SkillFreak</h1>
                <p className="text-xs text-gray-400">Portal</p>
              </div>
            </Link>
            <Link
              href="/live"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </Link>
          </div>

          {/* Search & Filter */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search seminars..."
          />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Featured Section - Only show if we have a featured event */}
        {featuredEvent && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Featured
            </h2>
            <Link href={`/events/${featuredEvent.id}`} className="block">
              <div className="card overflow-hidden relative">
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 relative">
                  {featuredEvent.thumbnail ? (
                    <Image
                      src={featuredEvent.thumbnail}
                      alt={featuredEvent.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="badge badge-archive mb-2">Latest Archive</span>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {featuredEvent.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Live Section */}
        <section className="mb-8">
          <Link href="/live" className="block">
            <div className="card p-4 bg-gradient-to-r from-red-900/30 to-purple-900/30 border-red-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="w-4 h-4 bg-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">24/7 Live Stream</h3>
                    <p className="text-sm text-gray-400">Nonstop archive playback</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </section>

        {/* Events Grid */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>All Seminars ({filteredEvents.length})</span>
            {events.length > 0 && (
              <Link href="/events" className="text-sm text-purple-400 hover:text-purple-300">
                View all
              </Link>
            )}
          </h2>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={favorites.includes(event.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="card p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">No seminars yet</h3>
              <p className="text-gray-400 mb-4">Check back soon for upcoming events</p>
              <Link
                href="/live"
                className="btn btn-primary"
              >
                Watch Live Stream
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
