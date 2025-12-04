import { Suspense } from 'react';
import Link from 'next/link';
import { getAllEvents, getArchivedEvents } from '@/lib/larkbase-client';
import StatsCard from '@/components/admin/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Admin Dashboard - SkillFreak',
  description: 'Admin dashboard for SkillFreak streaming system',
};

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  const allEvents = await getAllEvents();
  const archivedEvents = await getArchivedEvents();

  // Calculate today's views (mock data - replace with actual analytics)
  const todayViews = Math.floor(Math.random() * 500) + 100;

  // Get upcoming events (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.scheduled_at);
    return eventDate >= now && eventDate <= nextWeek;
  });

  return {
    totalEvents: allEvents.length,
    totalArchives: archivedEvents.length,
    todayViews,
    upcomingEvents: upcomingEvents.slice(0, 5),
    recentEvents: allEvents.slice(0, 5),
  };
}

/**
 * Dashboard statistics section
 */
async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total Events"
        value={stats.totalEvents}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        description="All events in system"
        color="purple"
      />

      <StatsCard
        title="Total Archives"
        value={stats.totalArchives}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        }
        description="Available video archives"
        color="green"
      />

      <StatsCard
        title="Today's Views"
        value={stats.todayViews}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        }
        description="Video views today"
        color="blue"
      />
    </div>
  );
}

/**
 * Recent events list
 */
async function RecentEventsList() {
  const stats = await getDashboardStats();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Events</h2>
        <Link href="/admin/events">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {stats.recentEvents.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="block"
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(event.scheduled_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={event.archive_url ? 'success' : 'info'}
                  size="sm"
                >
                  {event.archive_url ? 'Archived' : 'Scheduled'}
                </Badge>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/**
 * Quick actions section
 */
function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/events/new">
          <Button variant="primary" fullWidth>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Event
          </Button>
        </Link>

        <Link href="/admin/stream">
          <Button variant="secondary" fullWidth>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Manage Stream
          </Button>
        </Link>

        <Link href="/events">
          <Button variant="secondary" fullWidth>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Portal
          </Button>
        </Link>

        <Link href="/live">
          <Button variant="secondary" fullWidth>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            24/7 Stream
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/**
 * Stream status indicator
 */
function StreamStatus() {
  // Mock status - replace with actual stream status check
  const isLive = true;
  const currentViewers = Math.floor(Math.random() * 50) + 10;

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-4 h-4 rounded-full ${
                isLive ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            {isLive && (
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              24/7 Stream Status
            </h3>
            <p className="text-sm text-gray-400">
              {isLive ? `Live - ${currentViewers} viewers` : 'Offline'}
            </p>
          </div>
        </div>
        <Link href="/admin/stream">
          <Button variant="ghost" size="sm">
            Manage
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/**
 * Admin Dashboard Main Page
 */
export default async function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome to SkillFreak Admin Dashboard
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-400">
            Loading statistics...
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <StreamStatus />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={
            <Card className="p-6">
              <div className="text-center py-8 text-gray-400">
                Loading events...
              </div>
            </Card>
          }
        >
          <RecentEventsList />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  );
}
