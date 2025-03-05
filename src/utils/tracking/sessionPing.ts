
import { isDashboardUrl } from './urlUtils';
import { supabase } from '@/integrations/supabase/client';

// Ping interval for active sessions - reduced for more frequent updates
export const pingInterval = 15000; // 15 seconds for frequent updates
let lastPingTime = 0;
let pingCount = 0;

export const pingActiveSession = async () => {
  const siteId = localStorage.getItem('claro_site_id');
  if (!siteId) {
    console.log('No site ID found, cannot ping active session');
    return;
  }
  
  const now = Date.now();
  if (now - lastPingTime < pingInterval) {
    console.log('Skipping ping - too soon since last ping');
    return;
  }
  
  // Skip pinging if this is a dashboard URL
  if (isDashboardUrl(window.location.href)) {
    console.log('Not pinging for analytics dashboard');
    return;
  }
  
  try {
    pingCount++;
    console.log(`Sending session ping #${pingCount} for site ID:`, siteId);
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
      eventType: 'session_ping'
    };
    
    // First try direct Supabase insertion for more reliable tracking
    try {
      console.log('Attempting direct Supabase insertion...');
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
      });
      
      if (error) {
        console.error('Direct Supabase insertion error:', error);
        // Fall back to API endpoint if direct insertion fails
        console.log('Falling back to API endpoint...');
      } else {
        console.log('✅ Direct Supabase insertion successful:', data);
        lastPingTime = now;
        return;
      }
    } catch (supabaseError) {
      console.error('Error with direct Supabase insertion:', supabaseError);
      console.log('Falling back to API endpoint...');
    }
    
    // Fall back to API endpoint
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pingData)
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Session ping API response:', result);
    
    lastPingTime = now;
    console.log('Session ping sent at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error pinging active session:', error);
    // Try one last fallback method - image pixel
    try {
      const img = new Image();
      img.src = `/api/track?fallback=true&siteId=${encodeURIComponent(siteId)}&url=${encodeURIComponent(window.location.href)}&time=${Date.now()}`;
      console.log('Attempting image pixel fallback for tracking');
    } catch (e) {
      console.error('All tracking methods failed', e);
    }
  }
};
