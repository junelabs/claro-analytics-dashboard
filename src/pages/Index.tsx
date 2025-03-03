
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
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AbandonmentAnalytics } from '@/components/AbandonmentAnalytics';
import { PageTimeAnalytics } from '@/components/PageTimeAnalytics';
import { LocationAnalytics } from '@/components/LocationAnalytics';
import { RevenueSources } from '@/components/RevenueSources';
import { RevenueTrends } from '@/components/RevenueTrends';

const Index = () => {
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
    
    const intervalId = setInterval(fetchData, 15000);
    
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
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">{siteName}</div>
              <CurrentVisitors count={currentVisitors} siteName={siteName} isLive={isLiveCount} />
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
          
          {/* Updated layout: 2 columns with 2 tables/rows in each column, all with consistent height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* First column */}
            <div className="grid grid-cols-1 gap-6">
              <AbandonmentAnalytics loading={loading} />
              <PageTimeAnalytics loading={loading} />
            </div>
            
            {/* Second column */}
            <div className="grid grid-cols-1 gap-6">
              <LocationAnalytics loading={loading} />
              <div className="grid grid-cols-2 gap-6">
                <RevenueSources loading={loading} />
                <RevenueTrends loading={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
