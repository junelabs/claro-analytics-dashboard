
import { supabase as defaultSupabase } from './client';
import { supabase as integrationsSupabase } from '@/integrations/supabase/client';
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
    
    // Choose the appropriate Supabase client
    // Always prefer the integrations client as it has hardcoded credentials
    const supabaseClient = integrationsSupabase || defaultSupabase;
    
    // Check if we're missing Supabase credentials
    const isMissingCredentials = !supabaseClient || !supabaseClient.from;
    
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
    
    // Log the supabase client details to verify proper configuration
    console.log('Supabase client check:', 
      supabaseClient ? 'Instance exists' : 'No instance', 
      supabaseClient?.from ? 'from() available' : 'from() unavailable'
    );
    
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
