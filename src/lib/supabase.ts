
import { createClient } from '@supabase/supabase-js';

// These environment variables are automatically provided when Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client for development when credentials are missing
const isMissingCredentials = !supabaseUrl || !supabaseKey;

if (isMissingCredentials) {
  console.warn('Supabase credentials missing. Using mock implementation for development.');
}

// Create client with fallback for development
export const supabase = isMissingCredentials 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseKey);

// Create a mock client that doesn't throw errors during development
function createMockClient() {
  return {
    from: () => ({
      insert: () => Promise.resolve({ data: null, error: null }),
      select: () => ({
        eq: () => ({
          gte: () => Promise.resolve({ data: [], error: null })
        }),
        gte: () => Promise.resolve({ data: [], error: null })
      }),
    }),
  } as any;
}

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
    
    // Use the mock data in development
    if (isMissingCredentials) {
      return { 
        success: true, 
        data: {
          pageViews: 42,
          uniqueVisitors: 15,
          topPages: generateMockData(period).reduce((acc, item) => {
            const url = item.url;
            if (!acc[url]) acc[url] = 0;
            acc[url]++;
            return acc;
          }, {}).map((url, views) => ({ url, views })).slice(0, 5),
          period,
          rawData: generateMockData(period)
        } 
      };
    }
    
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
    const pageViewData = data || [];
    const pageViews = pageViewData.length;
    const uniqueUrls = new Set(pageViewData.map(view => view.url)).size;
    const uniqueUserAgents = new Set(pageViewData.map(view => view.user_agent)).size;
    
    // Group page views by URL to find top pages
    const urlCounts: Record<string, number> = {};
    pageViewData.forEach(view => {
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
        rawData: pageViewData
      } 
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error };
  }
};

// Generate mock data for development
function generateMockData(period: string) {
  const periodDays = parseInt(period.replace('d', '')) || 30;
  const count = 10 + Math.floor(Math.random() * 50); // Random number of entries
  const mockData = [];
  
  const paths = ['/home', '/about', '/pricing', '/blog', '/contact', '/products'];
  const referrers = ['https://google.com', 'https://twitter.com', 'https://facebook.com', 'direct', ''];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];
  
  // Generate entries for the last X days
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * periodDays);
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    
    mockData.push({
      id: `mock-${i}`,
      site_id: 'demo-site',
      url: paths[Math.floor(Math.random() * paths.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
      screen_width: [1920, 1440, 1366, 375, 414][Math.floor(Math.random() * 5)],
      screen_height: [1080, 900, 768, 812, 896][Math.floor(Math.random() * 5)],
      timestamp: date.toISOString(),
      created_at: date.toISOString()
    });
  }
  
  return mockData;
}

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
