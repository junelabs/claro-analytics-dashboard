
import React from 'react';
import { VisitorChart } from '@/components/VisitorChart';
import { AbandonmentAnalytics } from '@/components/AbandonmentAnalytics';
import { LocationAnalytics } from '@/components/LocationAnalytics';
import { PageTimeAnalytics } from '@/components/PageTimeAnalytics';
import { RevenueSources } from '@/components/RevenueSources';
import { RevenueTrends } from '@/components/RevenueTrends';

interface GraphsSectionProps {
  graphFilters: Record<string, boolean>;
  timeRange: string;
  analyticsData: any;
  loading: boolean;
}

export const GraphsSection = ({ 
  graphFilters, 
  timeRange, 
  analyticsData,
  loading 
}: GraphsSectionProps) => {
  return (
    <>
      <div className="flex justify-end">
        <div className="text-sm font-medium text-gray-500">Days</div>
      </div>

      {graphFilters.visitorChart && <VisitorChart timeRange={timeRange} analyticsData={analyticsData} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {graphFilters.abandonment && <AbandonmentAnalytics loading={loading} />}
        {graphFilters.location && <LocationAnalytics loading={loading} />}
        
        {graphFilters.pageTime && <PageTimeAnalytics loading={loading} />}
        {graphFilters.revenueSources && (
          <div className="grid grid-cols-1 gap-6">
            <RevenueSources loading={loading} />
          </div>
        )}
        
        {graphFilters.revenueTrends && (
          <div className="md:col-span-2">
            <RevenueTrends loading={loading} />
          </div>
        )}
      </div>
    </>
  );
};
