
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrentVisitorsProps {
  count: number;
  siteName: string;
  isLive: boolean;  // Prop to indicate if count is real-time data
  className?: string;
}

export const CurrentVisitors = ({ count, siteName, isLive = true, className }: CurrentVisitorsProps) => {
  // Clean up site name to show just the domain
  const displayName = siteName ? (
    siteName.startsWith('http') ? new URL(siteName).hostname : siteName
  ) : 'Your Website';
  
  return (
    <div className={cn(
      "flex items-center px-4 py-2 rounded-lg transition-all", 
      "bg-green-50/70 border border-green-100/70 shadow-sm",
      className
    )}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-semibold text-gray-800">
            {count} <span className="text-sm font-normal">active {count === 1 ? 'visitor' : 'visitors'}</span>
          </span>
          
          {isLive && (
            <div className="flex items-center ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="ml-1 text-xs text-green-600 font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          on <span className="font-medium">{displayName}</span>
        </div>
      </div>
    </div>
  );
};
