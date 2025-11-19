'use client';

import { useEffect, useState } from 'react';

interface StreamStatus {
  is_live: boolean;
  viewer_count: number;
  uptime: number;
  bandwidth_used: number;
  last_update: string | null;
}

export default function StreamDashboard() {
  const [status, setStatus] = useState<StreamStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/stream/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch stream status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // 10秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}日 ${hours}時間 ${minutes}分`;
    } else if (hours > 0) {
      return `${hours}時間 ${minutes}分`;
    } else {
      return `${minutes}分`;
    }
  };

  const formatBandwidth = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);

    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    } else {
      return `${mb.toFixed(2)} MB`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          配信ステータス
        </h2>
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        配信ステータス
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 配信状態 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">配信状態</span>
            <div className={`w-3 h-3 rounded-full ${status?.is_live ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {status?.is_live ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>

        {/* 視聴者数 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">視聴者数</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {status?.viewer_count || 0} 人
          </div>
        </div>

        {/* 稼働時間 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">稼働時間</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {status?.uptime ? formatUptime(status.uptime) : '0分'}
          </div>
        </div>

        {/* 帯域幅使用量 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">今日の帯域幅</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {status?.bandwidth_used ? formatBandwidth(status.bandwidth_used) : '0 MB'}
          </div>
        </div>
      </div>

      {status?.last_update && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          最終更新: {new Date(status.last_update).toLocaleString('ja-JP')}
        </div>
      )}
    </div>
  );
}
