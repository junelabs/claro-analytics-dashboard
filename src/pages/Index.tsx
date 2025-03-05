
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TrackingDebugger } from '@/components/TrackingDebugger';
import { useTracking } from '@/hooks/useTracking';
import { AISummary } from '@/components/AISummary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { GraphsSection } from '@/components/dashboard/GraphsSection';
import { useDashboardData } from '@/components/dashboard/useDashboardData';

const Index = () => {
  useTracking();
  
  // Initialize site ID from localStorage or create a new one
  const [siteId] = useState<string>(() => {
    const stored = localStorage.getItem('claro_site_id');
    if (stored) return stored;
    
    const newId = 'site_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('claro_site_id', newId);
    return newId;
  });

  // Use the custom hook to manage dashboard data and state
  const {
    dateRange,
    scriptCopied,
    analyticsData,
    loading,
    currentVisitors,
    siteName,
    isLiveCount,
    lastGraphRefresh,
    lastVisitorRefresh,
    graphFilters,
    handleDateRangeChange,
    handleGraphFilterChange,
    manualRefresh,
    copyTrackingScript
  } = useDashboardData(siteId);

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <DashboardHeader 
          copyTrackingScript={copyTrackingScript} 
          scriptCopied={scriptCopied} 
        />

        <div className="flex flex-col space-y-6">
          <AISummary siteId={siteId} data={analyticsData} />
          
          <DashboardControls 
            siteName={siteName}
            currentVisitors={currentVisitors}
            isLiveCount={isLiveCount}
            dateRange={dateRange}
            graphFilters={graphFilters}
            lastGraphRefresh={lastGraphRefresh}
            lastVisitorRefresh={lastVisitorRefresh}
            handleDateRangeChange={handleDateRangeChange}
            handleGraphFilterChange={handleGraphFilterChange}
            manualRefresh={manualRefresh}
          />

          <StatsOverview analyticsData={analyticsData} />

          <GraphsSection 
            graphFilters={graphFilters}
            timeRange={dateRange}
            analyticsData={analyticsData}
            loading={loading}
          />
        </div>
      </div>
      
      <TrackingDebugger />
    </Layout>
  );
};

export default Index;
