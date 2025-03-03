
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RevenueData {
  source: string;
  amount: number;
  percentage: number;
}

interface RevenueSourcesProps {
  data?: RevenueData[];
  loading?: boolean;
}

export const RevenueSources = ({ data = [], loading = false }: RevenueSourcesProps) => {
  // Use mock data if no data is provided
  const displayData = data.length > 0 ? data : [
    { source: 'Direct Sales', amount: 12450, percentage: 45 },
    { source: 'Partner Referrals', amount: 8720, percentage: 32 },
    { source: 'Affiliate Program', amount: 3640, percentage: 13 },
    { source: 'Email Campaigns', amount: 1980, percentage: 7 },
    { source: 'Social Media', amount: 850, percentage: 3 },
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
          <CardTitle className="text-lg font-medium">Revenue Sources</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Breakdown of your revenue by source</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading revenue data...</div>
          ) : (
            displayData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                    {item.source}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                    <span className="text-gray-500 text-xs ml-1">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
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
