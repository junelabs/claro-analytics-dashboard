
import { isDashboardUrl } from './urlUtils';
import { supabase } from '@/integrations/supabase/client';

// Ping interval for active sessions - reduced for more frequent updates
export const pingInterval = 15000; // 15 seconds for frequent updates
let lastPingTime = 0;
let pingCount = 0;
let failedPingCount = 0;
let successfulPingCount = 0;

export const pingActiveSession = async () => {
  // Verify site ID exists
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
    return {
      success: true,
      skipped: true,
      reason: 'Too soon since last ping'
    };
  }
  
  // Check if tracking is forced for testing
  const forceTracking = localStorage.getItem('force_tracking') === 'true';
  
  // Skip pinging if this is a dashboard URL (unless forcing)
  if (!forceTracking && isDashboardUrl(window.location.href)) {
    return {
      success: true,
      skipped: true,
      reason: 'Dashboard URL'
    };
  }
  
  try {
    pingCount++;
    const thisPingNum = pingCount;
    
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
      failedPingCount++;
      
      // Fall back to API endpoint
      return await fallbackToApiEndpoint(pingData, thisPingNum);
    }
    
    // First try direct Supabase insertion for more reliable tracking
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('page_views').insert({
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
        failedPingCount++;
        return await fallbackToApiEndpoint(pingData, thisPingNum);
      } else {
        lastPingTime = Date.now();
        successfulPingCount++;
        return {
          success: true,
          method: 'direct',
          data,
          duration
        };
      }
    } catch (supabaseError) {
      failedPingCount++;
      return await fallbackToApiEndpoint(pingData, thisPingNum);
    }
  } catch (error) {
    failedPingCount++;
    
    // Try one last fallback method - image pixel
    try {
      const img = new Image();
      const siteId = localStorage.getItem('claro_site_id') || 'unknown';
      img.src = `/api/track?fallback=true&siteId=${encodeURIComponent(siteId)}&url=${encodeURIComponent(window.location.href)}&time=${Date.now()}`;
      return {
        success: false,
        fallbackAttempted: true,
        error: String(error),
        method: 'pixel'
      };
    } catch (e) {
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
    
    lastPingTime = Date.now();
    successfulPingCount++;
    
    return {
      success: true,
      method: 'api',
      result,
      duration
    };
  } catch (apiError) {
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
    successfulPings: successfulPingCount,
    failedPings: failedPingCount,
    lastPingTime: lastPingTime ? new Date(lastPingTime).toLocaleString() : 'Never',
    timeSinceLastPing: lastPingTime ? `${Math.floor((Date.now() - lastPingTime) / 1000)}s ago` : 'Never',
    pingInterval: `${pingInterval / 1000}s`,
    forcingTracking: localStorage.getItem('force_tracking') === 'true'
  };
};
