import { isDashboardUrl } from './urlUtils';
import { supabase } from '@/integrations/supabase/client';

// Ping interval for active sessions - reduced for more frequent updates
export const pingInterval = 15000; // 15 seconds for frequent updates
let lastPingTime = 0;
let pingCount = 0;
let failedPingCount = 0;

export const pingActiveSession = async () => {
  const siteId = localStorage.getItem('claro_site_id');
  if (!siteId) {
    console.log('No site ID found, cannot ping active session');
    return {
      success: false,
      error: 'No site ID found'
    };
  }
  
  const now = Date.now();
  if (now - lastPingTime < pingInterval) {
    console.log('Skipping ping - too soon since last ping');
    return {
      success: true,
      skipped: true,
      reason: 'Too soon since last ping'
    };
  }
  
  // Skip pinging if this is a dashboard URL
  if (isDashboardUrl(window.location.href)) {
    console.log('Not pinging for analytics dashboard');
    return {
      success: true,
      skipped: true,
      reason: 'Dashboard URL'
    };
  }
  
  try {
    pingCount++;
    const thisPingNum = pingCount;
    console.log(`[Ping ${thisPingNum}] Sending session ping for site ID: ${siteId}`);
    
    const pingData = {
      siteId,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pageTitle: document.title,
      timestamp: new Date().toISOString(),
      isPing: true,
      eventType: 'session_ping',
      pingNumber: thisPingNum
    };
    
    // Verify Supabase client is available before trying to use it
    if (!supabase || typeof supabase.from !== 'function') {
      console.error(`[Ping ${thisPingNum}] Supabase client not properly initialized`);
      failedPingCount++;
      
      // Fall back to API endpoint
      return await fallbackToApiEndpoint(pingData, thisPingNum);
    }
    
    // First try direct Supabase insertion for more reliable tracking
    try {
      console.log(`[Ping ${thisPingNum}] Attempting direct Supabase insertion...`);
      const startTime = Date.now();
      const { data, error, status } = await supabase.from('page_views').insert({
        site_id: siteId,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        timestamp: new Date().toISOString(),
        page_title: document.title,
        event_type: 'session_ping'
      }).select();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (error) {
        console.error(`[Ping ${thisPingNum}] Direct Supabase insertion error:`, error);
        console.log(`[Ping ${thisPingNum}] Status: ${error.code || 'unknown'}, Duration: ${duration}ms`);
        // Fall back to API endpoint if direct insertion fails
        console.log(`[Ping ${thisPingNum}] Falling back to API endpoint...`);
        failedPingCount++;
        return await fallbackToApiEndpoint(pingData, thisPingNum);
      } else {
        console.log(`[Ping ${thisPingNum}] ✅ Direct Supabase insertion successful. Duration: ${duration}ms`, data);
        lastPingTime = Date.now();
        return {
          success: true,
          method: 'direct',
          data,
          duration
        };
      }
    } catch (supabaseError) {
      console.error(`[Ping ${thisPingNum}] Error with direct Supabase insertion:`, supabaseError);
      console.log(`[Ping ${thisPingNum}] Falling back to API endpoint...`);
      failedPingCount++;
      return await fallbackToApiEndpoint(pingData, thisPingNum);
    }
  } catch (error) {
    console.error('Error pinging active session:', error);
    failedPingCount++;
    
    // Try one last fallback method - image pixel
    try {
      const img = new Image();
      const siteId = localStorage.getItem('claro_site_id') || 'unknown';
      img.src = `/api/track?fallback=true&siteId=${encodeURIComponent(siteId)}&url=${encodeURIComponent(window.location.href)}&time=${Date.now()}`;
      console.log('Attempting image pixel fallback for tracking');
      return {
        success: false,
        fallbackAttempted: true,
        error: String(error),
        method: 'pixel'
      };
    } catch (e) {
      console.error('All tracking methods failed', e);
      return {
        success: false,
        allMethodsFailed: true,
        error: String(error)
      };
    }
  }
};

// Helper function to try the API endpoint fallback
async function fallbackToApiEndpoint(pingData, pingNumber) {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pingData)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`[Ping ${pingNumber}] Session ping API response (${duration}ms):`, result);
    
    lastPingTime = Date.now();
    console.log(`[Ping ${pingNumber}] Session ping sent at ${new Date().toLocaleTimeString()}`);
    
    return {
      success: true,
      method: 'api',
      result,
      duration
    };
  } catch (apiError) {
    console.error(`[Ping ${pingNumber}] API endpoint fallback failed:`, apiError);
    return {
      success: false,
      error: String(apiError),
      method: 'api-failed'
    };
  }
}

// Get diagnostics about ping history
export const getPingDiagnostics = () => {
  return {
    totalPings: pingCount,
    failedPings: failedPingCount,
    lastPingTime: lastPingTime ? new Date(lastPingTime).toLocaleString() : 'Never',
    timeSinceLastPing: lastPingTime ? `${Math.floor((Date.now() - lastPingTime) / 1000)}s ago` : 'Never',
    pingInterval: `${pingInterval / 1000}s`,
  };
};
