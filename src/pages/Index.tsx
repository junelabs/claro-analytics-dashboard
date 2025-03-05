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
import { getAnalyticsSummary, getActiveVisitorCount } from '@/lib/supabase';
import { Activity, BarChart3, Eye, LogOut, MousePointer, Search, Timer, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AbandonmentAnalytics } from '@/components/AbandonmentAnalytics';
import { PageTimeAnalytics } from '@/components/PageTimeAnalytics';
import { LocationAnalytics } from '@/components/LocationAnalytics';
import { RevenueSources } from '@/components/RevenueSources';
import { RevenueTrends } from '@/components/RevenueTrends';
import { useTracking } from '@/hooks/useTracking';

const Index = () => {
  useTracking();
  
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [scriptCopied, setScriptCopied] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVisitors, setCurrentVisitors] = useState(0);
  const [siteName, setSiteName] = useState('');
  const [siteId, setSiteId] = useState<string>(() => {
    const stored = localStorage.getItem('claro_site_id');
    if (stored) return stored;
    
    const newId = 'site_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('claro_site_id', newId);
    return newId;
  });
  const [isLiveCount, setIsLiveCount] = useState(false);
  const [liveUpdateInterval, setLiveUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [graphFilters, setGraphFilters] = useState({
    visitorChart: true,
    abandonment: true,
    location: true,
    pageTime: true,
    revenueSources: true,
    revenueTrends: true
  });

  useEffect(() => {
    async function fetchData() {
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
                setSiteName('example.com');
              }
            } catch (error) {
              console.error("Error parsing URL:", error);
              setSiteName('example.com');
            }
          } else {
            setSiteName('example.com');
          }
          
          const activeVisitorCount = await getActiveVisitorCount(siteId);
          if (activeVisitorCount.success) {
            setCurrentVisitors(activeVisitorCount.data);
            setIsLiveCount(true);
          } else {
            if (result.data.currentVisitors !== undefined) {
              setCurrentVisitors(result.data.currentVisitors);
              setIsLiveCount(false);
            } else {
              setCurrentVisitors(0);
              setIsLiveCount(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    if (liveUpdateInterval) clearInterval(liveUpdateInterval);
    
    const intervalId = setInterval(fetchData, 10000);
    setLiveUpdateInterval(intervalId);
    
    return () => {
      if (liveUpdateInterval) clearInterval(liveUpdateInterval);
      clearInterval(intervalId);
    };
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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleGraphFilterChange = (id: string, checked: boolean) => {
    setGraphFilters(prev => ({
      ...prev,
      [id]: checked
    }));
    
    toast.info(`${checked ? 'Showing' : 'Hiding'} ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <Header />
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center">
                <span className="text-sm mr-2 text-gray-600">{user.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
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
        </div>

        <div className="flex flex-col space-y-6">
          <AISummary siteId={siteId} data={analyticsData} />
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 items-center">
              <div className="text-sm font-medium text-gray-600">{siteName}</div>
              <CurrentVisitors 
                count={currentVisitors} 
                siteName={siteName} 
                isLive={isLiveCount} 
                autoRefresh={true} 
              />
            </div>
            <div className="flex items-center space-x-3">
              <FilterButton 
                onClick={handleFilterClick} 
                graphFilters={graphFilters}
                onFilterChange={handleGraphFilterChange}
              />
              <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Unique Visitors"
              value={analyticsData?.uniqueVisitors ? `${analyticsData.uniqueVisitors}` : "0"}
              change={{ value: "0%", trend: "neutral" }}
              icon={<Users className="h-4 w-4" />}
              description="Total unique users visiting your site"
            />
            <StatCard
              title="Page Views"
              value={analyticsData?.pageViews ? `${analyticsData.pageViews}` : "0"}
              change={{ value: "0%", trend: "neutral" }}
              icon={<Eye className="h-4 w-4" />}
              description="Total pages viewed across all visits"
            />
            <StatCard
              title="Avg. Time on Page"
              value="2m 34s"
              change={{ value: "0%", trend: "neutral" }}
              icon={<Timer className="h-4 w-4" />}
              description="Average time spent on each page"
            />
            <StatCard
              title="Bounce Rate"
              value="42%"
              change={{ value: "0%", trend: "neutral" }}
              icon={<MousePointer className="h-4 w-4" />}
              description="Percentage of single-page visits"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Conversion Rate"
              value="3.2%"
              change={{ value: "+0.5%", trend: "up" }}
              icon={<TrendingUp className="h-4 w-4" />}
              description="Visitors who completed desired actions"
            />
            <StatCard
              title="Revenue"
              value="$1,245"
              change={{ value: "+12%", trend: "up" }}
              icon={<BarChart3 className="h-4 w-4" />}
              description="Total revenue from all sources"
            />
            <StatCard
              title="Avg. Order Value"
              value="$68.50"
              change={{ value: "+3%", trend: "up" }}
              icon={<Activity className="h-4 w-4" />}
              description="Average value of each order"
            />
            <StatCard
              title="AI Insights"
              value="7 new"
              icon={<Sparkles className="h-4 w-4" />}
              description="AI-powered recommendations for your store"
            />
          </div>

          <div className="flex justify-end">
            <div className="text-sm font-medium text-gray-500">Days</div>
          </div>

          {graphFilters.visitorChart && <VisitorChart timeRange={dateRange} analyticsData={analyticsData} />}
          
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
        </div>
      </div>
    </Layout>
  );
};

export default Index;
