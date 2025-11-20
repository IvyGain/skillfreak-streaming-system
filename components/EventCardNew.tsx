'use client';

/**
 * EventCard - SkillFreak PortalApp UI移植版
 * React Native → Next.js/Tailwind CSS
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Users, Star, Heart } from 'lucide-react';

interface Speaker {
  name: string;
  title: string;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  category: string;
  thumbnail?: string;
  speaker: Speaker;
  isArchived: boolean;
  rating?: number;
  attendees?: number;
}

interface EventCardProps {
  event: Event;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  categoryColor?: string;
  categoryName?: string;
  categoryIcon?: string;
}

export default function EventCardNew({
  event,
  isFavorite = false,
  onToggleFavorite,
  categoryColor = '#8B5CF6',
  categoryName = 'カテゴリー',
  categoryIcon = '📚',
}: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = !event.isArchived;

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="relative bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-lg border border-[#2D1B69]
                    hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
        {/* サムネイル */}
        {event.thumbnail && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-4">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-3">
            {/* カテゴリーバッジ */}
            <div
              className="px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1"
              style={{ backgroundColor: categoryColor }}
            >
              <span>{categoryIcon}</span>
              <span>{categoryName}</span>
            </div>

            {/* 右側（レーティング＋お気に入り） */}
            <div className="flex items-center gap-2">
              {event.isArchived && event.rating && (
                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">
                    {event.rating}
                  </span>
                </div>
              )}

              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(event.id);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  aria-label="お気に入り"
                >
                  <Heart
                    size={20}
                    className={
                      isFavorite
                        ? 'text-purple-500 fill-purple-500'
                        : 'text-gray-400'
                    }
                  />
                </button>
              )}
            </div>
          </div>

          {/* タイトル */}
          <h3 className="text-white text-lg font-bold mb-2 line-clamp-2 leading-6">
            {event.title}
          </h3>

          {/* 説明 */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-5">
            {event.description}
          </p>

          {/* スピーカー情報 */}
          <div className="flex items-center gap-3 mb-4">
            {event.speaker.avatar && (
              <Image
                src={event.speaker.avatar}
                alt={event.speaker.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {event.speaker.name}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {event.speaker.title}
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="flex justify-between items-center text-gray-400 text-xs">
            {/* 日時 */}
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                {eventDate.toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <Clock size={14} />
              <span>{event.duration}分</span>
            </div>

            {/* 参加者数 */}
            {event.isArchived && event.attendees && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{event.attendees}人参加</span>
              </div>
            )}
          </div>
        </div>

        {/* 予定バッジ */}
        {isUpcoming && (
          <div className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-lg">
            <span className="text-white text-xs font-semibold">予定</span>
          </div>
        )}
      </div>
    </Link>
  );
}
