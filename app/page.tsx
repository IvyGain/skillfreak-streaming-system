import { getArchivedEvents, getAllEvents } from '@/lib/larkbase-client';
import HomeClient from './HomeClient';
import BottomNavigation from '@/components/portal/BottomNavigation';
import type { Event } from '@/components/portal/EventCard';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

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

// YouTubeサムネイルURL生成
function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

// サムネイルURL取得（LarkBase優先、YouTubeフォールバック）
function getThumbnailUrl(thumbnail?: string, youtubeUrl?: string): string | undefined {
  // 1. LarkBaseサムネイル（最優先）
  if (typeof thumbnail === 'string' && thumbnail.trim() !== '') {
    return thumbnail;
  }
  // 2. YouTubeサムネイル（フォールバック）
  if (youtubeUrl) {
    const ytThumb = getYouTubeThumbnailUrl(youtubeUrl);
    if (ytThumb) return ytThumb;
  }
  return undefined;
}

export default async function Home() {
  // LarkBaseからイベントを取得
  let events: Event[] = [];

  try {
    const larkEvents = await getAllEvents();
    events = larkEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      thumbnail: getThumbnailUrl(e.thumbnail, e.youtube_url),
      date: e.scheduled_at || new Date().toISOString(),
      duration: e.duration || 60,
      category: e.category || 'business',
      isArchived: !!e.archive_file_token || !!e.archive_url,
      rating: e.rating || undefined,
      attendees: e.attendees || undefined,
      speaker: {
        name: typeof e.speaker === 'string' ? e.speaker : (e.speaker?.name || 'SkillFreak'),
        title: typeof e.speaker === 'string' ? 'Speaker' : (e.speaker?.title || 'Seminar'),
        avatar: typeof e.speaker === 'object' ? e.speaker?.avatar : undefined,
      },
      archive_file_token: e.archive_file_token,
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Fallback to empty array - will show "No events" message
  }

  return (
    <div className="min-h-screen pb-24">
      <HomeClient events={events} />
      <BottomNavigation />
    </div>
  );
}
