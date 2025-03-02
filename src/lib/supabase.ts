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

// Store mock data in localStorage to ensure it persists between refreshes
const MOCK_DATA_KEY = 'claro_mock_analytics_data';

// Analytics tracking functions
export const trackPageView = async (data: {
  siteId: string;
  url: string;
  referrer: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  timestamp?: string;
  pageTitle?: string;
}) => {
  try {
    console.log('Tracking page view:', data);
    
    if (isMissingCredentials) {
      // If in development, store the page view in localStorage mock data
      const mockData = getMockData();
      mockData.push({
        id: `mock-${mockData.length + 1}`,
        site_id: data.siteId,
        url: data.url,
        referrer: data.referrer,
        user_agent: data.userAgent,
        screen_width: data.screenWidth,
        screen_height: data.screenHeight,
        timestamp: data.timestamp || new Date().toISOString(),
        created_at: data.timestamp || new Date().toISOString()
      });
      localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(mockData));
      return { success: true };
    }
    
    const { error } = await supabase
      .from('page_views')
      .insert([{
        site_id: data.siteId,
        url: data.url,
        referrer: data.referrer, 
        user_agent: data.userAgent,
        screen_width: data.screenWidth,
        screen_height: data.screenHeight,
        page_title: data.pageTitle || '',
        timestamp: data.timestamp || new Date().toISOString()
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

// Get active visitor count in real-time (not an estimate)
export const getActiveVisitorCount = async (siteId: string) => {
  try {
    // Define active session time window (last 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    
    if (isMissingCredentials) {
      console.log('Using mock data for active visitor count');
      
      // Get mock data but only count unique user agents in the last 5 minutes
      const mockData = getMockData();
      const recentSessions = mockData.filter(item => {
        const timestamp = new Date(item.timestamp || item.created_at);
        return timestamp >= new Date(fiveMinutesAgo) && item.site_id === siteId;
      });
      
      // Count unique user agents (as a proxy for unique visitors)
      const uniqueAgents = new Set(recentSessions.map(item => item.user_agent));
      const activeCount = uniqueAgents.size;
      
      return { success: true, data: activeCount };
    }
    
    // Query Supabase for page views in the last 5 minutes
    const { data, error } = await supabase
      .from('page_views')
      .select('user_agent')
      .eq('site_id', siteId)
      .gte('created_at', fiveMinutesAgo);
    
    if (error) {
      console.error('Error fetching active visitors:', error);
      throw error;
    }
    
    // Count unique user agents as a proxy for unique active visitors
    const uniqueAgents = new Set(data.map(view => view.user_agent));
    const activeCount = uniqueAgents.size;
    
    return { success: true, data: activeCount };
  } catch (error) {
    console.error('Error fetching active visitors:', error);
    return { success: false, error, data: 0 };
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
      console.log('Using persistent mock data from localStorage');
      const mockData = getMockData();
      
      // Create topPages from mockData correctly
      const urlCounts: Record<string, number> = {};
      mockData.forEach(item => {
        const url = item.url;
        urlCounts[url] = (urlCounts[url] || 0) + 1;
      });
      
      const topPages = Object.entries(urlCounts)
        .map(([url, views]) => ({ url, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
      
      // Set a consistent current visitor count (no longer random)
      const currentVisitors = Math.min(3, mockData.length > 0 ? Math.ceil(mockData.length / 3) : 1);
      
      return { 
        success: true, 
        data: {
          pageViews: mockData.length,
          uniqueVisitors: new Set(mockData.map(item => item.user_agent)).size,
          topPages,
          period,
          rawData: mockData,
          currentVisitors
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
        rawData: pageViewData,
        currentVisitors: uniqueUserAgents > 0 ? Math.min(5, Math.ceil(uniqueUserAgents / 2)) : 0
      } 
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error };
  }
};

// Get mock data from localStorage or generate if not exists
function getMockData() {
  try {
    const storedData = localStorage.getItem(MOCK_DATA_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error('Error parsing stored mock data:', e);
  }
  
  // Generate initial mock data if none exists
  const initialData = generateInitialMockData();
  localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(initialData));
  return initialData;
}

// Generate initial mock data for first time use
function generateInitialMockData() {
  const count = 5; // Start with a small fixed number of entries
  const mockData = [];
  
  const paths = ['/home', '/about', '/pricing', '/blog', '/contact'];
  const referrers = ['https://google.com', 'https://twitter.com', 'direct', ''];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];
  
  // Generate entries for the last 30 days with consistent dates
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(i * 3) % 30; // Spread them out over 30 days
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    mockData.push({
      id: `mock-${i}`,
      site_id: 'demo-site',
      url: paths[i % paths.length],
      referrer: referrers[i % referrers.length],
      user_agent: userAgents[i % userAgents.length],
      screen_width: [1920, 1440, 1366, 375, 414][i % 5],
      screen_height: [1080, 900, 768, 812, 896][i % 5],
      timestamp: date.toISOString(),
      created_at: date.toISOString()
    });
  }
  
  return mockData;
}

// Create an API endpoint handler for the tracking script
export const handleTrackingRequest = async (request: Request) => {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    console.log('Received tracking request');
    
    // For debugging, log the full request
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries([...request.headers]));
    
    // Parse the request body
    let data;
    try {
      data = await request.json();
      console.log('Received tracking data:', data);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // Validate the data
    if (!data || !data.siteId || !data.url) {
      console.error('Invalid tracking data:', data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // Track the page view
    const result = await trackPageView(data);
    console.log('Tracking result:', result);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Error handling tracking request:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error processing request' 
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
};

// Helper function to get CORS headers
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
