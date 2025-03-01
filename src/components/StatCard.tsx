
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const StatCard = ({ title, value, change, className }: StatCardProps) => {
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (title.toLowerCase().includes('bounce')) {
      return trend === 'down' ? 'text-claro-green' : 'text-claro-red';
    }
    return trend === 'up' ? 'text-claro-green' : 'text-claro-red';
  };

  return (
    <div className={cn("stat-card group", className)}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {title}
      </div>
      <div className="flex items-baseline">
        <div className="text-2xl font-semibold mr-2">{value}</div>
        <div className={cn("flex items-center text-xs font-medium", getTrendColor(change.trend))}>
          {change.trend === 'up' ? (
            <ArrowUp className="w-3 h-3 mr-0.5" />
          ) : (
            <ArrowDown className="w-3 h-3 mr-0.5" />
          )}
          {change.value}
        </div>
      </div>
    </div>
  );
};
