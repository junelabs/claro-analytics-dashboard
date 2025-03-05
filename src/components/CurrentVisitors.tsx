
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CurrentVisitorsProps {
  count: number;
  siteName: string;
  isLive: boolean;  // Prop to indicate if count is real-time data
  className?: string;
  autoRefresh?: boolean; // New prop to enable auto-refresh animation
}

export const CurrentVisitors = ({ 
  count, 
  siteName, 
  isLive = true, 
  className,
  autoRefresh = true 
}: CurrentVisitorsProps) => {
  const [animate, setAnimate] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  
  // Clean up site name to show just the domain
  const displayName = siteName && siteName !== 'example.com' && siteName !== '' ? 
    (siteName.startsWith('http') ? new URL(siteName).hostname : siteName) : 
    '';
  
  // Add more frequent animation effect to indicate live updates
  useEffect(() => {
    if (autoRefresh && isLive) {
      // Set initial refresh time
      setLastRefreshTime(new Date().toLocaleTimeString());
      
      const interval = setInterval(() => {
        setAnimate(true);
        setLastRefreshTime(new Date().toLocaleTimeString());
        setTimeout(() => setAnimate(false), 1000);
      }, 60000); // Animate every minute to show it's live
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isLive]);
  
  return (
    <div className={cn(
      "flex items-center px-4 py-2 rounded-lg transition-all duration-300", 
      "bg-green-50/70 border border-green-100/70 shadow-sm",
      animate ? "bg-green-100 scale-105" : "",
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
        
        {displayName && (
          <div className="text-xs text-gray-500">
            on <span className="font-medium">{displayName}</span>
          </div>
        )}
        
        {isLive && lastRefreshTime && (
          <div className="text-[10px] text-gray-400 mt-1">
            Updated: {lastRefreshTime}
          </div>
        )}
      </div>
    </div>
  );
};
