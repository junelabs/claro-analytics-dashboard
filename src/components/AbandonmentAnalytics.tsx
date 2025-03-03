
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Page Abandonment</CardTitle>
          <div className="text-xs text-gray-500 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {loading ? 'Loading...' : 'Top pages visitors leave from'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((item, index) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
