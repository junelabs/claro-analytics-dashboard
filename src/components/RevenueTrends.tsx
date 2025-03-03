
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RevenueTrendData {
  period: string;
  amount: number;
  growth: number;
}

interface RevenueTrendsProps {
  data?: RevenueTrendData[];
  loading?: boolean;
}

export const RevenueTrends = ({ data = [], loading = false }: RevenueTrendsProps) => {
  // Use mock data if no data is provided
  const displayData = data.length > 0 ? data : [
    { period: 'This Month', amount: 28640, growth: 12.5 },
    { period: 'Last Month', amount: 25460, growth: 8.3 },
    { period: 'Q1 2023', amount: 72890, growth: 15.2 },
    { period: 'Q4 2022', amount: 63280, growth: 6.7 },
    { period: 'Year to Date', amount: 156720, growth: 22.1 },
  ];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Revenue Trends</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Revenue growth over different time periods</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading revenue trends...</div>
          ) : (
            displayData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium">{item.period}</div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-800">{formatCurrency(item.amount)}</span>
                    <span className={`text-xs ml-1 flex items-center ${item.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {item.growth > 0 ? '+' : ''}{item.growth}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: '100%', opacity: 0.3 + (index * 0.15) }}
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
