'use client';

import Link from 'next/link';
import { categories } from './CategoryFilter';

export interface Event {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  date: string;
  duration: number;
  category: string;
  isArchived: boolean;
  rating?: number;
  attendees?: number;
  speaker: {
    name: string;
    title: string;
    avatar?: string;
  };
  archive_file_token?: string;
}

interface EventCardProps {
  event: Event;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

export default function EventCard({ event, isFavorite = false, onToggleFavorite }: EventCardProps) {
  const category = categories.find(c => c.id === event.category);
  const eventDate = new Date(event.date);
  const isUpcoming = !event.isArchived;

  return (
    <Link href={`/events/${event.id}`} className="block">
      <article className="card overflow-hidden animate-fade-in h-full flex flex-col">
        {/* Thumbnail - 16:9 Aspect Ratio */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex-shrink-0">
          {event.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.thumbnail}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* No gradient overlay - show full thumbnail */}

          {/* Status Badge */}
          {isUpcoming ? (
            <span className="badge badge-upcoming absolute top-3 right-3">
              Upcoming
            </span>
          ) : event.archive_file_token && (
            <span className="badge badge-archive absolute top-3 right-3">
              Archive
            </span>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(event.id);
              }}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'text-pink-500 fill-pink-500' : 'text-white'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="badge text-xs"
              style={{ backgroundColor: category?.color || '#8B5CF6' }}
            >
              {category?.icon} {category?.name || 'Uncategorized'}
            </span>
            {event.isArchived && event.rating && (
              <div className="flex items-center gap-1 text-yellow-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{event.rating}</span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Speaker Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
              {event.speaker.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.speaker.avatar}
                  alt={event.speaker.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {event.speaker.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {event.speaker.title}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {eventDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {event.duration}min
              </span>
            </div>
            {event.isArchived && event.attendees && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {event.attendees}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
