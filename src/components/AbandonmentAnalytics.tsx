
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AbandonmentData {
  page: string;
  abandonmentRate: number;
  visits: number;
}

interface AbandonmentAnalyticsProps {
  data?: AbandonmentData[];
  loading?: boolean;
}

export const AbandonmentAnalytics = ({ data = [], loading = false }: AbandonmentAnalyticsProps) => {
  // Use mock data if no data is provided
  const displayData = data.length > 0 ? data : [
    { page: '/products/item-1', abandonmentRate: 65, visits: 124 },
    { page: '/checkout', abandonmentRate: 58, visits: 210 },
    { page: '/cart', abandonmentRate: 45, visits: 315 },
    { page: '/products/item-2', abandonmentRate: 42, visits: 98 },
    { page: '/products', abandonmentRate: 38, visits: 256 },
  ];

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Page Abandonment</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Top pages visitors leave from</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading abandonment data...</div>
          ) : (
            displayData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium truncate max-w-[70%]" title={item.page}>
                    {item.page}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-claro-red">{item.abandonmentRate}%</span>
                    <span className="text-gray-500 text-xs ml-1">({item.visits} visits)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-claro-red h-1.5 rounded-full" 
                    style={{ width: `${item.abandonmentRate}%` }}
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
