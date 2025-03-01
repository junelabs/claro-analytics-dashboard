
import { createClient } from '@supabase/supabase-js';

// These environment variables will be provided after connecting to Supabase
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
        timestamp: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return { success: false, error };
  }
};

// Get analytics summary for a site
export const getAnalyticsSummary = async (siteId: string, period: string = '30d') => {
  try {
    // This would normally filter by date range based on period
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .eq('site_id', siteId);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error };
  }
};
