
import { isDashboardUrl } from './urlUtils';
import { supabase } from '@/integrations/supabase/client';

let lastPageViewUrl = '';
let lastPageViewTime = 0;

export const shouldTrackPageView = (url: string = window.location.href) => {
  const currentUrl = url;
  const now = Date.now();
  
  // Don't track analytics dashboard
  if (isDashboardUrl(currentUrl)) {
    console.log('Not tracking page view for analytics dashboard');
    return false;
  }
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 30000) { // 30s window
    console.log('Skipping duplicate page view tracking within 30s window');
    return false;
  }
  
  console.log('Should track page view for:', currentUrl);
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};

// Export this helper to check if tracking is working
export const getTrackingStatus = () => {
  const supabaseIntegration = getSupabaseIntegrationStatus();
  
  return {
    lastPageViewUrl,
    lastPageViewTime,
    timeSinceLastTracking: lastPageViewTime ? `${Math.floor((Date.now() - lastPageViewTime) / 1000)}s ago` : 'Never tracked',
    trackingEnabled: !!localStorage.getItem('claro_site_id'),
    siteId: localStorage.getItem('claro_site_id'),
    supbaseConfigured: supabaseIntegration
  };
};

// Helper to check if Supabase is properly configured
const getSupabaseIntegrationStatus = () => {
  try {
    // Use the integration client directly
    console.log('Checking Supabase integration status with direct client');
    
    // Check if client has the needed methods
    const clientConfigured = supabase && typeof supabase.from === 'function';
    
    if (clientConfigured) {
      console.log('Supabase integration client available and properly configured');
    } else {
      console.warn('Supabase integration client not properly configured');
    }
    
    // Test integration client by getting a table reference (doesn't need to query)
    let tableAccessWorks = false;
    if (clientConfigured) {
      try {
        const tableRef = supabase.from('page_views');
        tableAccessWorks = !!tableRef;
        console.log('Table reference exists:', tableAccessWorks);
      } catch (e) {
        console.error('Error accessing page_views table:', e);
      }
    }
    
    return {
      hasConfiguredClient: clientConfigured,
      integrationConfigured: clientConfigured,
      tableAccessible: tableAccessWorks,
      integrationDetails: {
        clientAvailable: !!supabase
      }
    };
  } catch (e) {
    console.error('Error checking Supabase integration status:', e);
    return { error: String(e) };
  }
};

// Add a test function to manually check Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('page_views').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection test successful:', data);
    return { success: true, data };
  } catch (e) {
    console.error('Supabase connection test exception:', e);
    return { success: false, error: String(e) };
  }
};
