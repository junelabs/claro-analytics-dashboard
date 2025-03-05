
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
    
    // Check for Lovable domains which host the analytics dashboard
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com')) {
      console.log('Analytics dashboard detected (Lovable domain):', url);
      return true;
    }
    
    // Check for localhost or development only if it's the dashboard path
    if ((hostname.includes('localhost') || hostname.includes('127.0.0.1')) && 
        (path.includes('/dashboard') || path.includes('/analytics') || path === '/')) {
      console.log('Analytics dashboard detected (localhost dashboard path):', url);
      return true;
    }
    
    // Check for dashboard-specific paths
    if (path.includes('/dashboard') || path.includes('/analytics')) {
      console.log('Analytics dashboard detected (dashboard path):', url);
      return true;
    }
    
    // This is a client website URL, should be tracked
    console.log('Client website URL detected, will track:', url);
    return false;
  } catch (e) {
    // If URL parsing fails, fall back to simple string matching
    console.error('Error parsing URL:', e);
    const isDashboard = url.includes('lovable') || 
                        (url.includes('localhost') && url.includes('/dashboard')) ||
                        url.includes('/analytics');
    
    console.log('URL parsing failed, dashboard detection fallback result:', isDashboard);
    return isDashboard;
  }
};

// Ping interval for active sessions - reduce to make updates more frequent
export const pingInterval = 15000; // Change to 15 seconds for more frequent updates
let lastPingTime = 0;
let lastPageViewUrl = '';
let lastPageViewTime = 0;

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
  
  console.log('Should track page view for:', currentUrl);
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};

// Enhanced initialize tracking function with more frequent updates
export const initializePingTracking = () => {
  console.log('Initializing ping tracking with current URL:', window.location.href);
  
  // Force enable tracking for testing
  localStorage.setItem('enable_local_tracking', 'true');
  
  if (!isDashboardUrl(window.location.href)) {
    console.log('This is a client site, initializing tracking');
    pingActiveSession(); // Initial ping
    
    // More frequent pinging for better real-time data
    setInterval(pingActiveSession, pingInterval);
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !isDashboardUrl(window.location.href)) {
        console.log('Page became visible, sending ping');
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
    
    // Add initial page view tracking with better logging
    if (shouldTrackPageView()) {
      console.log('Tracking initial page view');
      const siteId = localStorage.getItem('claro_site_id');
      if (siteId) {
        const pageViewData = {
          siteId,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          pageTitle: document.title,
          timestamp: new Date().toISOString(),
          eventType: 'page_view'
        };
        
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageViewData)
        })
        .then(() => console.log('Initial page view tracked successfully'))
        .catch(err => console.error('Error tracking initial page view:', err));
      }
    }
  } else {
    console.log('This is the dashboard, not initializing client tracking');
  }
};
