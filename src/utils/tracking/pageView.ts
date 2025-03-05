
import { isDashboardUrl } from './urlUtils';

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
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 30000) { // Reduced to 30s from 60s
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
  return {
    lastPageViewUrl,
    lastPageViewTime,
    timeSinceLastTracking: lastPageViewTime ? `${Math.floor((Date.now() - lastPageViewTime) / 1000)}s ago` : 'Never tracked',
    trackingEnabled: !!localStorage.getItem('claro_site_id'),
    siteId: localStorage.getItem('claro_site_id'),
    supbaseConfigured: checkSupabaseConfig()
  };
};

// Helper to check if Supabase is properly configured
const checkSupabaseConfig = () => {
  try {
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Check client config from integrations
    let integrationConfigured = false;
    try {
      const integrationModule = require('@/integrations/supabase/client');
      integrationConfigured = !!integrationModule.supabase;
    } catch (e) {
      console.error('Error checking integration configuration:', e);
    }
    
    return {
      hasEnvVars: !!(supabaseUrl && supabaseKey),
      integrationConfigured,
      envDetails: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing'
      }
    };
  } catch (e) {
    console.error('Error checking Supabase config:', e);
    return { error: String(e) };
  }
};
