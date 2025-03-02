
import React from 'react';

interface CurrentVisitorsProps {
  count: number;
  siteName: string;
}

export const CurrentVisitors = ({ count, siteName }: CurrentVisitorsProps) => {
  // Clean up site name to show just the domain
  const displayName = siteName ? (
    siteName.startsWith('http') ? new URL(siteName).hostname : siteName
  ) : 'Your Website';
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="relative flex items-center">
        <span className="absolute -left-1 w-2.5 h-2.5 bg-claro-green rounded-full animate-pulse-dot"></span>
        <span className="ml-3">{count} current visitors on <span className="font-medium">{displayName}</span></span>
      </div>
    </div>
  );
};
