
import { supabase } from './client';
import { isDashboardUrl } from './urlUtils';
import { getMockData, isDuplicate } from './mockData';

export const trackPageView = async (data: {
  siteId: string;
  url: string;
  referrer: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  timestamp?: string;
  pageTitle?: string;
  isPing?: boolean;
  eventType?: string;
  isTest?: boolean;
}) => {
  try {
    console.log('Tracking request received:', data);
    
    // Skip if this is a dashboard URL
    if (isDashboardUrl(data.url)) {
      console.log('Skipping tracking for analytics dashboard URL:', data.url);
      return { success: true, skipped: 'dashboard' };
    }
    
    // Skip if this is a duplicate within the time window
    if (!data.isTest && isDuplicate(data)) {
      console.log('Skipping duplicate tracking request for URL:', data.url);
      return { success: true, skipped: 'duplicate' };
    }
    
    console.log('Processing tracking for:', data.url, 'Event type:', data.eventType || 'page_view');
    
    // Check if we're missing Supabase credentials
    const isMissingCredentials = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
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
        created_at: data.timestamp || new Date().toISOString(),
        event_type: data.eventType || 'page_view',
        page_title: data.pageTitle || ''
      });
      localStorage.setItem('claro_mock_analytics_data', JSON.stringify(mockData));
      console.log('Added tracking data to mock storage (development mode)');
      return { success: true, mock: true };
    }
    
    // Log the supabase instance to check for proper initialization
    console.log('Supabase instance check:', 
      supabase ? 'Instance exists' : 'No instance', 
      supabase?.from ? 'from() available' : 'from() unavailable'
    );
    
    try {
      // Test connection to Supabase
      const testResponse = await supabase.from('page_views').select('count(*)', { count: 'exact', head: true });
      console.log('Supabase connection test:', testResponse);
    } catch (connectionError) {
      console.error('Supabase connection test failed:', connectionError);
    }
    
    // Use supabase client from integrations if available
    let supabaseClient = supabase;
    try {
      const integrationModule = require('@/integrations/supabase/client');
      if (integrationModule.supabase) {
        console.log('Using supabase client from integrations module');
        supabaseClient = integrationModule.supabase;
      }
    } catch (e) {
      console.log('Integration module not available, using default client');
    }
    
    // Insert tracking data
    console.log('Inserting tracking data into page_views table');
    const { data: insertedData, error } = await supabaseClient
      .from('page_views')
      .insert([{
        site_id: data.siteId,
        url: data.url,
        referrer: data.referrer, 
        user_agent: data.userAgent,
        screen_width: data.screenWidth,
        screen_height: data.screenHeight,
        page_title: data.pageTitle || '',
        timestamp: data.timestamp || new Date().toISOString(),
        event_type: data.eventType || 'page_view'
      }])
      .select();
    
    if (error) {
      console.error('Error tracking page view in Supabase:', error);
      throw error;
    }
    
    console.log('Successfully inserted tracking data:', insertedData);
    return { success: true, data: insertedData };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return { success: false, error: String(error) };
  }
};
