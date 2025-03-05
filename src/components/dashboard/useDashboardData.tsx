
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAnalyticsSummary, getActiveVisitorCount } from '@/lib/supabase';

export const useDashboardData = (siteId: string) => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [scriptCopied, setScriptCopied] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVisitors, setCurrentVisitors] = useState(0);
  const [siteName, setSiteName] = useState('');
  const [isLiveCount, setIsLiveCount] = useState(false);
  const [lastGraphRefresh, setLastGraphRefresh] = useState<string>(new Date().toLocaleTimeString());
  const [lastVisitorRefresh, setLastVisitorRefresh] = useState<string>(new Date().toLocaleTimeString());
  const [graphFilters, setGraphFilters] = useState({
    visitorChart: true,
    abandonment: true,
    location: true,
    pageTime: true,
    revenueSources: true,
    revenueTrends: true
  });

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAnalyticsSummary(siteId);
      if (result.success && result.data) {
        setAnalyticsData(result.data);
        
        if (result.data.rawData && result.data.rawData.length > 0) {
          try {
            const url = result.data.rawData[0].url;
            if (url && url.includes('://')) {
              const urlObj = new URL(url);
              setSiteName(urlObj.hostname);
            } else if (url) {
              setSiteName(url.split('/')[0]);
            } else {
              setSiteName('');
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
            setSiteName('');
          }
        } else {
          setSiteName('');
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch active visitor count
  const fetchActiveVisitors = async () => {
    try {
      const activeVisitorCount = await getActiveVisitorCount(siteId);
      if (activeVisitorCount.success) {
        setCurrentVisitors(activeVisitorCount.data);
        setIsLiveCount(true);
        setLastVisitorRefresh(new Date().toLocaleTimeString());
      } else {
        if (analyticsData?.currentVisitors !== undefined) {
          setCurrentVisitors(analyticsData.currentVisitors);
          setIsLiveCount(false);
        } else {
          setCurrentVisitors(0);
          setIsLiveCount(false);
        }
      }
    } catch (error) {
      console.error('Error fetching active visitor count:', error);
    }
  };

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    toast.success(`Date range changed to ${newRange}`);
  };

  const handleGraphFilterChange = (id: string, checked: boolean) => {
    setGraphFilters(prev => ({
      ...prev,
      [id]: checked
    }));
    
    toast.info(`${checked ? 'Showing' : 'Hiding'} ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };

  const manualRefresh = () => {
    fetchData();
    fetchActiveVisitors();
    setLastGraphRefresh(new Date().toLocaleTimeString());
    toast.success('Dashboard data manually refreshed');
  };

  const copyTrackingScript = () => {
    try {
      const endpoint = window.location.origin;
      const script = `<script src="${endpoint}/tracker.js" data-site-id="${siteId}" defer></script>`;
      
      navigator.clipboard.writeText(script);
      setScriptCopied(true);
      toast.success('Tracking script copied to clipboard!', {
        description: 'Paste this in the <head> section of your website.',
      });
      
      setTimeout(() => setScriptCopied(false), 3000);
      
      if (window.location.hostname === 'localhost') {
        localStorage.setItem('enable_local_tracking', 'true');
        console.log('Local tracking enabled for testing');
      }
    } catch (error) {
      console.error('Failed to copy tracking script:', error);
      toast.error('Failed to copy tracking script', {
        description: 'Please try again or copy it manually.',
      });
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();
    fetchActiveVisitors();
    
    // Set up hourly refresh for graphs
    const graphIntervalId = setInterval(() => {
      console.log('Hourly refresh: Updating dashboard graphs');
      fetchData();
      setLastGraphRefresh(new Date().toLocaleTimeString());
      toast.info('Dashboard data refreshed', { 
        description: 'Graphs and analytics have been updated.' 
      });
    }, 3600000); // 3,600,000ms = 1 hour
    
    // Set up minute refresh for active visitors
    const visitorIntervalId = setInterval(() => {
      console.log('Minute refresh: Updating active visitor count');
      fetchActiveVisitors();
    }, 60000); // 60,000ms = 1 minute
    
    return () => {
      clearInterval(graphIntervalId);
      clearInterval(visitorIntervalId);
    };
  }, [siteId]);

  useEffect(() => {
    // Refresh data when date range changes
    fetchData();
  }, [dateRange]);

  return {
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
    copyTrackingScript,
    setGraphFilters
  };
};
