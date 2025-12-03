'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/portal/SearchBar';
import CategoryFilter from '@/components/portal/CategoryFilter';
import EventCard, { type Event } from '@/components/portal/EventCard';

interface EventsClientProps {
  events: Event[];
}

type FilterTab = 'all' | 'archived' | 'upcoming';
type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
  { value: 'title-asc', label: 'タイトル A-Z' },
  { value: 'title-desc', label: 'タイトル Z-A' },
];

export default function EventsClient({ events }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
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

    // Tab filter
    if (activeTab === 'archived') {
      filtered = filtered.filter((e) => e.isArchived);
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter((e) => !e.isArchived);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.speaker.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title, 'ja');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'ja');
        default:
          return 0;
      }
    });
  }, [events, searchQuery, selectedCategory, activeTab, sortBy]);

  // Stats
  const archivedCount = events.filter((e) => e.isArchived).length;
  const upcomingCount = events.filter((e) => !e.isArchived).length;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/skillfreak-icon.png"
                alt="SkillFreak"
                width="40"
                height="40"
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold gradient-text">SkillFreak</h1>
                <p className="text-xs text-gray-400">Archives</p>
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

          {/* Tab Filter */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: 'All', count: events.length },
              { key: 'archived', label: 'Archived', count: archivedCount },
              { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as FilterTab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1A1A2E] text-gray-400 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search archives..."
          />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-white">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'seminar' : 'seminars'}
          </h2>
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-[#1A1A2E] border border-[#2D1B69] text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {favorites.length > 0 && (
              <Link href="/favorites" className="text-sm text-purple-400 hover:text-purple-300 whitespace-nowrap">
                Favorites ({favorites.length})
              </Link>
            )}
          </div>
        </div>

        {/* Events Grid */}
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
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setActiveTab('all');
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No seminars yet</h3>
            <p className="text-gray-400 mb-4">Check back soon for upcoming events</p>
            <Link href="/live" className="btn btn-primary">
              Watch Live Stream
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
