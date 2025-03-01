
import { createClient } from '@supabase/supabase-js';

// These environment variables are automatically provided when Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please connect your Supabase project in the Lovable interface.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Analytics tracking functions
export const trackPageView = async (data: {
  siteId: string;
  url: string;
  referrer: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
}) => {
  try {
    const { error } = await supabase
      .from('page_views')
      .insert([{
        site_id: data.siteId,
        url: data.url,
        referrer: data.referrer, 
        user_agent: data.userAgent,
        screen_width: data.screenWidth,
        screen_height: data.screenHeight,
        // The created_at will be handled by Supabase's now() default
        // The timestamp field matches what we have in the schema
        timestamp: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return { success: false, error };
  }
};

// Get analytics summary for a site
export const getAnalyticsSummary = async (siteId: string, period: string = '30d') => {
  try {
    // This is a simplified query - in production you'd filter by date range
    const now = new Date();
    const periodDays = parseInt(period.replace('d', '')) || 30;
    const startDate = new Date(now.setDate(now.getDate() - periodDays)).toISOString();
    
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .eq('site_id', siteId)
      .gte('created_at', startDate);
    
    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
    
    // Process the raw data into useful metrics
    const pageViews = data.length;
    const uniqueUrls = new Set(data.map(view => view.url)).size;
    const uniqueUserAgents = new Set(data.map(view => view.user_agent)).size;
    
    // Group page views by URL to find top pages
    const urlCounts: Record<string, number> = {};
    data.forEach(view => {
      const url = view.url;
      urlCounts[url] = (urlCounts[url] || 0) + 1;
    });
    
    // Sort URLs by view count
    const topPages = Object.entries(urlCounts)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    
    return { 
      success: true, 
      data: {
        pageViews,
        uniqueVisitors: uniqueUserAgents,
        topPages,
        period,
        rawData: data
      } 
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error };
  }
};

// Create an API endpoint handler for the tracking script
export const handleTrackingRequest = async (request: Request) => {
  try {
    const data = await request.json();
    const result = await trackPageView(data);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    });
  } catch (error) {
    console.error('Error handling tracking request:', error);
    return new Response(JSON.stringify({ success: false, error: 'Invalid request data' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }
};
