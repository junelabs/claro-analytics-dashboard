
import React from 'react';

interface CurrentVisitorsProps {
  count: number;
  siteName: string;
  isLive: boolean;  // New prop to indicate if count is real-time data
}

export const CurrentVisitors = ({ count, siteName, isLive = true }: CurrentVisitorsProps) => {
  // Clean up site name to show just the domain
  const displayName = siteName ? (
    siteName.startsWith('http') ? new URL(siteName).hostname : siteName
  ) : 'Your Website';
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="relative flex items-center">
        {isLive ? (
          <span className="absolute -left-1 w-2.5 h-2.5 bg-claro-green rounded-full animate-pulse-dot"></span>
        ) : (
          <span className="absolute -left-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
        )}
        <span className="ml-3">
          {count} current {count === 1 ? 'visitor' : 'visitors'} on <span className="font-medium">{displayName}</span>
        </span>
      </div>
    </div>
  );
};
