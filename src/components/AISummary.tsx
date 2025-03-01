
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { getAnalyticsSummary } from '@/lib/supabase';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ url: string, views: number }>;
  period?: string;
  rawData?: any[];
}

interface AISummaryProps {
  className?: string;
  siteId?: string;
  data?: AnalyticsData;
}

export const AISummary = ({ className, siteId, data }: AISummaryProps) => {
  const [summary, setSummary] = useState<string | null>(
    "Your website traffic insights will appear here once you've collected data using the tracking script."
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // If direct data is provided, use it
    if (data) {
      setAnalyticsData(data);
      console.log('Received analytics data for AI processing:', data);
      generateInsightFromData(data);
    } 
    // Otherwise if we have a siteId, try to fetch from Supabase
    else if (siteId) {
      fetchAnalyticsData(siteId);
    }
  }, [data, siteId]);

  const fetchAnalyticsData = async (siteId: string) => {
    try {
      setLoading(true);
      const result = await getAnalyticsSummary(siteId);
      if (result.success && result.data) {
        setAnalyticsData(result.data);
        generateInsightFromData(result.data);
      } else {
        setSummary("No analytics data available yet. Install the tracking script on your website to start collecting data.");
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setSummary("Unable to fetch analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generateInsightFromData = (data: AnalyticsData) => {
    // Simple logic to generate insights based on the data
    if (data.pageViews === 0) {
      setSummary("No page views recorded yet. Make sure your tracking script is properly installed.");
      return;
    }

    let insight = `You've received ${data.pageViews} page views from approximately ${data.uniqueVisitors} unique visitors`;
    
    if (data.topPages && data.topPages.length > 0) {
      insight += `. Your most visited page is "${data.topPages[0].url}" with ${data.topPages[0].views} views.`;
      
      if (data.topPages.length > 1) {
        insight += ` This is followed by "${data.topPages[1].url}" with ${data.topPages[1].views} views.`;
      }
    }

    // Add recommendations based on the data
    if (data.pageViews < 10) {
      insight += " It's still early days - focus on creating content and driving traffic to your site.";
    } else if (data.pageViews > 1000 && data.uniqueVisitors < data.pageViews * 0.3) {
      insight += " You have a good amount of return visitors, which indicates strong engagement. Consider adding more conversion opportunities.";
    } else if (data.topPages && data.topPages[0].views > data.pageViews * 0.5) {
      insight += " One page is receiving most of your traffic. Consider creating more content similar to your top performer.";
    }

    setSummary(insight);
  };

  const generateNewInsight = () => {
    setLoading(true);
    setSummary(null);
    
    if (analyticsData) {
      setTimeout(() => {
        generateInsightFromData(analyticsData);
        setLoading(false);
      }, 1000);
    } else if (siteId) {
      fetchAnalyticsData(siteId);
    } else {
      // Use mock insights if no real data is available
      setTimeout(() => {
        const insights = [
          "Your website traffic is up 6% compared to last period. Visitors are spending more time on your product pages, but your checkout abandonment rate has increased. Consider optimizing your checkout flow.",
          "Mobile visitors convert 15% less than desktop users. Your site loads 2 seconds slower on mobile devices. Improving mobile performance could boost your revenue significantly.",
          "Your most visited product pages aren't generating proportional sales. Visitors view these products but don't add them to cart. Consider reviewing pricing or product descriptions.",
          "Your evening traffic (6-10pm) shows the highest conversion rate. Consider running time-sensitive promotions during these hours to maximize sales.",
          "Returning visitors spend 40% more than first-time visitors. Your loyalty program may be working - consider expanding these incentives."
        ];
        
        setSummary(insights[Math.floor(Math.random() * insights.length)]);
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className={cn("p-5 bg-white rounded-lg border border-gray-100 transition-all duration-300 mb-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-claro-purple mr-2" />
          <h3 className="font-medium text-sm">AI Insights</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8 bg-white hover:bg-gray-50"
          onClick={generateNewInsight}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Generate new insight'}
        </Button>
      </div>
      
      <div 
        className={cn(
          "text-sm text-gray-700 leading-relaxed transition-all duration-300 overflow-hidden", 
          expanded ? "max-h-60" : "max-h-20"
        )}
      >
        {loading ? (
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-11/12"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        ) : (
          summary
        )}
      </div>
      
      {(summary && summary.length > 130) && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs text-claro-purple mt-2 hover:underline focus:outline-none"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};
