
import { isDashboardUrl } from './urlUtils';

// Ping interval for active sessions - reduced for more frequent updates
export const pingInterval = 15000; // 15 seconds for frequent updates
let lastPingTime = 0;

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
    console.log('Sending session ping for site ID:', siteId);
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
    
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pingData)
    });
    
    lastPingTime = now;
    console.log('Session ping sent at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error pinging active session:', error);
  }
};
