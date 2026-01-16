'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}

const colors = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
};

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className={cn('stat-icon', colors[color].bg)}>
        <Icon className={cn('h-6 w-6', colors[color].text)} />
      </div>
      <div>
        <p className="text-sm text-dark-500">{title}</p>
        <p className="text-2xl font-bold text-dark-900">{value}</p>
        {trend && <p className="text-xs text-dark-400">{trend}</p>}
      </div>
    </div>
  );
}
