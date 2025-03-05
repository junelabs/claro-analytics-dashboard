import { isDashboardUrl } from './urlUtils';
import { supabase } from '@/integrations/supabase/client';

let lastPageViewUrl = '';
let lastPageViewTime = 0;
let connectionTestCount = 0;

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
    
    // Access project URL safely
    const projectUrl = supabase.supabaseUrl || 'Not available';
    const hasKey = !!supabase.supabaseKey;
    
    return {
      hasConfiguredClient: clientConfigured,
      integrationConfigured: clientConfigured,
      tableAccessible: tableAccessWorks,
      integrationDetails: {
        clientAvailable: !!supabase,
        projectUrl: projectUrl,
        hasApiKey: hasKey
      }
    };
  } catch (e) {
    console.error('Error checking Supabase integration status:', e);
    return { 
      error: String(e),
      integrationDetails: {
        clientAvailable: false,
        errorMessage: String(e)
      }
    };
  }
};

// Add a test function to manually check Supabase connection
export const testSupabaseConnection = async () => {
  connectionTestCount++;
  const testId = connectionTestCount;
  try {
    console.log(`[Test ${testId}] Testing Supabase connection...`);
    
    // First test that we can reach the Supabase REST API
    try {
      // Use the supabase client URL directly
      const url = supabase.supabaseUrl;
      if (!url) {
        throw new Error('Supabase URL is not available from client');
      }
      
      console.log(`[Test ${testId}] Checking Supabase API at ${url}`);
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': supabase.supabaseKey || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`[Test ${testId}] API endpoint check failed with status: ${response.status}`);
        let responseBody = 'No response body';
        try {
          responseBody = await response.text();
        } catch (e) {}
        
        return { 
          success: false, 
          error: `API endpoint check failed: ${response.status} ${response.statusText}`,
          details: responseBody
        };
      }
      
      console.log(`[Test ${testId}] API endpoint check successful`);
    } catch (apiCheckError) {
      console.error(`[Test ${testId}] API endpoint check error:`, apiCheckError);
      return {
        success: false,
        error: `API endpoint check error: ${apiCheckError.message}`,
      };
    }
    
    // Now actually try to query the database
    console.log(`[Test ${testId}] Testing direct table query...`);
    const { data, error, count } = await supabase
      .from('page_views')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error(`[Test ${testId}] Supabase connection test failed:`, error);
      return { 
        success: false, 
        error: error.message,
        errorCode: error.code,
        hint: error.hint || 'No hint provided',
        statusText: error.message || 'No status message'
      };
    }
    
    const result = {
      success: true,
      message: 'Supabase connection test successful',
      count: count,
      data: data
    };
    console.log(`[Test ${testId}] Supabase connection test successful:`, result);
    return result;
  } catch (e) {
    console.error(`[Test ${testId}] Supabase connection test exception:`, e);
    return { 
      success: false, 
      error: String(e),
      errorType: 'Exception',
      stack: e.stack
    };
  }
};
