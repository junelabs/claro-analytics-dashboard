
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PageTimeData {
  page: string;
  timeSpent: number; // in seconds
  visits: number;
}

interface PageTimeAnalyticsProps {
  data?: PageTimeData[];
  loading?: boolean;
}

export const PageTimeAnalytics = ({ data = [], loading = false }: PageTimeAnalyticsProps) => {
  // Use mock data if no data is provided
  const displayData = data.length > 0 ? data : [
    { page: '/blog/article-1', timeSpent: 245, visits: 142 },
    { page: '/products/featured', timeSpent: 187, visits: 219 },
    { page: '/about', timeSpent: 163, visits: 104 },
    { page: '/services', timeSpent: 121, visits: 187 },
    { page: '/contact', timeSpent: 85, visits: 256 },
  ];

  // Format seconds to minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Find maximum time spent for relative bar width
  const maxTime = Math.max(...displayData.map(item => item.timeSpent));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Time Spent on Pages</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Average time visitors spend on each page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading page time data...</div>
          ) : (
            displayData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium truncate max-w-[70%]" title={item.page}>
                    {item.page}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-claro-purple">{formatTime(item.timeSpent)}</span>
                    <span className="text-gray-500 text-xs ml-1">({item.visits} visits)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-claro-purple h-1.5 rounded-full" 
                    style={{ width: `${(item.timeSpent / maxTime) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
