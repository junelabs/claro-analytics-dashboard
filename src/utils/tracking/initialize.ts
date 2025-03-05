
import { isDashboardUrl } from './urlUtils';
import { pingActiveSession, pingInterval } from './sessionPing';
import { shouldTrackPageView } from './pageView';

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
