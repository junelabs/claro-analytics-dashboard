
// Tracking utility functions

// Track already processed URLs to prevent duplicate page views
const processedUrls = new Map<string, number>();
const DUPLICATE_WINDOW = 60000; // 60 seconds

export const isDuplicateRequest = (url: string): boolean => {
  const now = Date.now();
  const lastProcessed = processedUrls.get(url);
  
  if (lastProcessed && (now - lastProcessed) < DUPLICATE_WINDOW) {
    console.log('Duplicate request detected for URL:', url);
    return true;
  }
  
  // Update last processed time
  processedUrls.set(url, now);
  
  // Clean up old entries to prevent memory leaks
  if (processedUrls.size > 100) {
    const oldEntries = [...processedUrls.entries()]
      .filter(([_, timestamp]) => (now - timestamp) > DUPLICATE_WINDOW * 2);
    oldEntries.forEach(([key]) => processedUrls.delete(key));
  }
  
  return false;
};

// Helper to determine if a URL is from the analytics dashboard
export const isDashboardUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    
    // Check for localhost or Lovable domains
    if (hostname.includes('localhost') || 
        hostname.includes('127.0.0.1') ||
        hostname.includes('lovable.app') ||
        hostname.includes('lovable.dev') ||
        hostname.includes('lovableproject.com')) {
      return true;
    }
    
    // Check paths
    if (path === '/' || 
        path.includes('/dashboard') || 
        path.includes('/analytics')) {
      return true;
    }
    
    return false;
  } catch (e) {
    // If URL parsing fails, fall back to simple string matching
    return url.includes('localhost') ||
           url.includes('lovable') ||
           url.includes('/dashboard') ||
           url.includes('/analytics');
  }
};

// Ping interval for active sessions
export const pingInterval = 60000;
let lastPingTime = 0;
let lastPageViewUrl = '';
let lastPageViewTime = 0;

export const pingActiveSession = async () => {
  const siteId = localStorage.getItem('claro_site_id');
  if (!siteId) return;
  
  const now = Date.now();
  if (now - lastPingTime < pingInterval) return;
  
  // Skip pinging if this is a dashboard URL
  if (isDashboardUrl(window.location.href)) {
    console.log('Not pinging for analytics dashboard');
    return;
  }
  
  try {
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

export const shouldTrackPageView = () => {
  const currentUrl = window.location.href;
  const now = Date.now();
  
  // Don't track analytics dashboard
  if (isDashboardUrl(currentUrl)) {
    console.log('Not tracking page view for analytics dashboard');
    return false;
  }
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 60000) {
    console.log('Skipping duplicate page view tracking within 60s window');
    return false;
  }
  
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};

// Initialize ping functionality
export const initializePingTracking = () => {
  if (!isDashboardUrl(window.location.href)) {
    pingActiveSession();
    setInterval(pingActiveSession, pingInterval);
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !isDashboardUrl(window.location.href)) {
        pingActiveSession();
      }
    });
    
    ['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
      let debounceTimer: NodeJS.Timeout | null = null;
      window.addEventListener(eventType, () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!isDashboardUrl(window.location.href)) {
            pingActiveSession();
          }
        }, 1000);
      }, { passive: true });
    });
  }
};
