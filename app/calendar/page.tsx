/**
 * Calendar Page - Event Schedule View
 */

import { getAllEvents } from '@/lib/larkbase-client';
import CalendarClient from './CalendarClient';
import BottomNavigation from '@/components/portal/BottomNavigation';
import type { Event } from '@/components/portal/EventCard';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function CalendarPage() {
  let events: Event[] = [];

  try {
    const larkEvents = await getAllEvents();
    events = larkEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      thumbnail: undefined,
      date: e.scheduled_at || new Date().toISOString(),
      duration: 60,
      category: 'business',
      isArchived: !!e.archive_file_token,
      rating: undefined,
      attendees: undefined,
      speaker: {
        name: 'SkillFreak',
        title: 'Seminar',
        avatar: undefined,
      },
      archive_file_token: e.archive_file_token,
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  return (
    <div className="min-h-screen pb-24">
      <CalendarClient events={events} />
      <BottomNavigation />
    </div>
  );
}
