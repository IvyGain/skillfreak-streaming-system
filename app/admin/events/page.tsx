import { Suspense } from 'react';
import Link from 'next/link';
import { getAllEvents } from '@/lib/larkbase-client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const metadata = {
  title: 'Event Management - SkillFreak Admin',
  description: 'Manage all events and archives',
};

/**
 * Event list table
 */
async function EventsTable() {
  const events = await getAllEvents();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Event
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Archive
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Visibility
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {events.map((event) => (
            <tr
              key={event.id}
              className="hover:bg-gray-700/30 transition-colors"
            >
              <td className="px-6 py-4">
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    className="font-medium text-white hover:text-purple-400 transition-colors"
                  >
                    {event.title}
                  </Link>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {event.description}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-300">
                  {new Date(event.scheduled_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(event.scheduled_at).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    event.status === 'published'
                      ? 'success'
                      : event.status === 'archived'
                      ? 'info'
                      : 'warning'
                  }
                  size="sm"
                >
                  {event.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                {event.archive_url || event.archive_file_token ? (
                  <div className="flex items-center gap-2 text-green-400">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-sm">None</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    event.visibility === 'public' ? 'info' : 'warning'
                  }
                  size="sm"
                >
                  {event.visibility}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="sm">
                      <svg
                        className="w-4 h-4"
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
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" disabled>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {events.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-600 mb-4"
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
          <p className="text-gray-400 mb-4">No events found</p>
          <Link href="/admin/events/new">
            <Button variant="primary">Create First Event</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Search and filter bar
 */
function FilterBar() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search events..."
          className="w-full"
          disabled
        />
      </div>
      <div className="flex gap-2">
        <select
          className="px-4 py-2 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50"
          disabled
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="px-4 py-2 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50"
          disabled
        >
          <option value="">All Visibility</option>
          <option value="public">Public</option>
          <option value="members-only">Members Only</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Event Management Page
 */
export default async function EventsManagementPage() {
  const events = await getAllEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Event Management
          </h1>
          <p className="text-gray-400">
            Manage all events and archives ({events.length} total)
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button variant="primary">
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
            Create Event
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <FilterBar />

        <Suspense
          fallback={
            <div className="text-center py-12 text-gray-400">
              Loading events...
            </div>
          }
        >
          <EventsTable />
        </Suspense>
      </Card>

      {/* Statistics summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="p-4">
          <div className="text-sm text-gray-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-400 mb-1">Published</div>
          <div className="text-2xl font-bold text-green-400">
            {events.filter((e) => e.status === 'published').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-400 mb-1">With Archive</div>
          <div className="text-2xl font-bold text-purple-400">
            {
              events.filter((e) => e.archive_url || e.archive_file_token)
                .length
            }
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-400 mb-1">Members Only</div>
          <div className="text-2xl font-bold text-yellow-400">
            {events.filter((e) => e.visibility === 'members-only').length}
          </div>
        </Card>
      </div>
    </div>
  );
}
