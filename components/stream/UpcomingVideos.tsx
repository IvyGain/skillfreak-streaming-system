'use client';

import { useEffect, useState } from 'react';

interface Archive {
  id: string;
  video_id: string;
  title: string;
  speaker: string;
  thumbnail_url?: string;
  duration: number;
  event_date: string;
}

export default function UpcomingVideos() {
  const [upcomingVideos, setUpcomingVideos] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await fetch('/api/archives?limit=10&sort=date&order=desc');
        if (response.ok) {
          const data = await response.json();
          setUpcomingVideos(data.archives || []);
        }
      } catch (error) {
        console.error('Failed to fetch upcoming videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          アーカイブ一覧
        </h3>
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        アーカイブ一覧
      </h3>

      {upcomingVideos.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          アーカイブがありません
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingVideos.map((video, index) => (
            <div
              key={video.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 font-bold">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {video.speaker}
                </p>
                {video.duration && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
