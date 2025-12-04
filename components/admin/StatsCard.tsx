'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'purple' | 'green' | 'blue' | 'yellow';
}

const colorStyles = {
  purple: 'text-purple-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  yellow: 'text-yellow-400',
};

/**
 * StatsCard component for displaying statistics in admin dashboard
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Events"
 *   value={42}
 *   icon={<CalendarIcon className="w-6 h-6" />}
 *   description="Active events"
 *   color="purple"
 * />
 * ```
 */
export default function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  color = 'purple',
}: StatsCardProps) {
  return (
    <Card hover={false} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-sm font-semibold ${
                  trend.value >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gray-700/50 ${colorStyles[color]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
