
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { CurrentVisitors } from '@/components/CurrentVisitors';
import { DateRangePicker } from '@/components/DateRangePicker';
import { FilterButton } from '@/components/FilterButton';
import { StatCard } from '@/components/StatCard';
import { VisitorChart } from '@/components/VisitorChart';
import { AISummary } from '@/components/AISummary';
import { getTrackingScript } from '@/lib/tracker';
import { getAnalyticsSummary } from '@/lib/supabase';

const Index = () => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [scriptCopied, setScriptCopied] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVisitors, setCurrentVisitors] = useState(0);
  const [siteName, setSiteName] = useState('');
  const [siteId, setSiteId] = useState<string>(() => {
    // Generate a unique site ID if not already stored
    const stored = localStorage.getItem('claro_site_id');
    if (stored) return stored;
    
    const newId = 'site_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('claro_site_id', newId);
    return newId;
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getAnalyticsSummary(siteId);
        if (result.success && result.data) {
          setAnalyticsData(result.data);
          
          // Extract domain from the first entry if available
          if (result.data.rawData && result.data.rawData.length > 0) {
            try {
              const url = new URL(result.data.rawData[0].url);
              setSiteName(url.hostname);
            } catch (error) {
              console.error("Error parsing URL:", error);
              setSiteName('Your Website');
            }
          } else {
            setSiteName('Your Website');
          }
          
          // Set a random number of current visitors between 1-5 for demo purposes
          // In a real app, you would calculate this from active sessions
          setCurrentVisitors(Math.floor(Math.random() * 5) + 1);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [siteId, dateRange]);

  const handleFilterClick = () => {
    toast('Filter functionality coming soon!', {
      description: 'Advanced filtering options will be available in the next update.',
      action: {
        label: 'Dismiss',
        onClick: () => console.log('Dismissed'),
      },
    });
  };

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    toast.success(`Date range changed to ${newRange}`);
  };

  const copyTrackingScript = () => {
    try {
      // Use the current origin or a deployment URL in production
      const endpoint = window.location.origin;
      const script = `<script src="${endpoint}/tracker.js" data-site-id="${siteId}" defer></script>`;
      
      navigator.clipboard.writeText(script);
      setScriptCopied(true);
      toast.success('Tracking script copied to clipboard!', {
        description: 'Paste this in the <head> section of your website.',
      });
      
      setTimeout(() => setScriptCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy tracking script:', error);
      toast.error('Failed to copy tracking script', {
        description: 'Please try again or copy it manually.',
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <Header />
          <button
            onClick={copyTrackingScript}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              scriptCopied
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-claro-purple text-white hover:bg-claro-light-purple'
            }`}
          >
            {scriptCopied ? 'Copied!' : 'Get Tracking Script'}
          </button>
        </div>

        <div className="flex flex-col space-y-6">
          <AISummary siteId={siteId} data={analyticsData} />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">{siteName || 'Your Website'}</div>
              <CurrentVisitors count={currentVisitors} siteName={siteName} />
            </div>
            <div className="flex items-center space-x-3">
              <FilterButton onClick={handleFilterClick} />
              <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            <StatCard
              title="Unique Visitors"
              value={analyticsData?.uniqueVisitors ? `${analyticsData.uniqueVisitors}` : "0"}
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Total Visits"
              value={analyticsData?.pageViews ? `${analyticsData.pageViews}` : "0"}
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Total Pageviews"
              value={analyticsData?.pageViews ? `${analyticsData.pageViews}` : "0"}
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Views Per Visit"
              value={analyticsData?.pageViews && analyticsData?.uniqueVisitors && analyticsData.uniqueVisitors > 0 
                ? (analyticsData.pageViews / analyticsData.uniqueVisitors).toFixed(2) 
                : "0"}
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Bounce Rate"
              value="0%"
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Visit Duration"
              value="0s"
              change={{ value: "0%", trend: "neutral" }}
              className="lg:col-span-1"
            />
          </div>

          <div className="flex justify-end">
            <div className="text-sm font-medium text-gray-500">Days</div>
          </div>

          <VisitorChart timeRange={dateRange} analyticsData={analyticsData} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
