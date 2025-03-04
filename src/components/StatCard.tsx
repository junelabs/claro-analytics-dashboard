
import React from 'react';
import { ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  description,
  className 
}: StatCardProps) => {
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (title.toLowerCase().includes('bounce')) {
      return trend === 'down' ? 'text-claro-green' : 'text-claro-red';
    }
    return trend === 'up' ? 'text-claro-green' : 'text-claro-red';
  };

  return (
    <div className={cn("stat-card group bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all", className)}>
      <div className="flex items-center mb-2">
        {icon && <div className="mr-2 text-claro-purple">{icon}</div>}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </div>
      </div>
      
      <div className="flex items-baseline">
        <div className="text-2xl font-semibold mr-2">{value}</div>
        {change && (
          <div className={cn("flex items-center text-xs font-medium", getTrendColor(change.trend))}>
            {change.trend === 'up' ? (
              <ArrowUp className="w-3 h-3 mr-0.5" />
            ) : change.trend === 'down' ? (
              <ArrowDown className="w-3 h-3 mr-0.5" />
            ) : null}
            {change.value}
          </div>
        )}
      </div>
      
      {description && (
        <div className="mt-2 text-sm text-gray-500">
          {description}
        </div>
      )}
    </div>
  );
};
