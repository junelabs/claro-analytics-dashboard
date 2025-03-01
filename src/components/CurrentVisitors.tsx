
import React from 'react';

interface CurrentVisitorsProps {
  count: number;
}

export const CurrentVisitors = ({ count }: CurrentVisitorsProps) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="relative flex items-center">
        <span className="absolute -left-1 w-2.5 h-2.5 bg-claro-green rounded-full animate-pulse-dot"></span>
        <span className="ml-3">{count} current visitors</span>
      </div>
    </div>
  );
};
