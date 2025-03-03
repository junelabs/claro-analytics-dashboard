
// This file will be the source for the tracker.js script
// that gets served to client websites

export const trackerScript = `
(function() {
  const TRACKING_ENDPOINT = "{{TRACKING_ENDPOINT}}";
  const SITE_ID = document.currentScript.getAttribute('data-site-id') || '';
  
  // More visible debug logging
  const debug = {
    log: (message, ...args) => {
      console.log('%c Claro Analytics: ' + message, 'background: #f3f4f6; color: #6366f1; padding: 2px 4px; border-radius: 2px;', ...args);
    },
    error: (message, ...args) => {
      console.error('%c Claro Analytics Error: ' + message, 'background: #fee2e2; color: #ef4444; padding: 2px 4px; border-radius: 2px;', ...args);
    },
    warn: (message, ...args) => {
      console.warn('%c Claro Analytics Warning: ' + message, 'background: #fef3c7; color: #d97706; padding: 2px 4px; border-radius: 2px;', ...args);
    }
  };

  // Script initialization
  debug.log('Script initializing from ' + TRACKING_ENDPOINT);
  debug.log('Site ID: ' + (SITE_ID || 'Not provided'));

  // Cache tracking status to prevent multiple loads
  const TRACKER_CACHE_KEY = 'claro_last_track_' + window.location.href;
  const TRACK_INTERVAL = 60000; // 60 seconds

  if (!SITE_ID) {
    debug.warn('No site ID provided. Add data-site-id attribute to your script tag. Tracking will continue but data may not be associated correctly.');
  }

  // Comprehensive check to detect if current page is an analytics dashboard
  const isDashboard = function() {
    // Get current URL and host
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    
    // Check for localhost which is likely development environment
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      debug.log('Localhost detected, likely a development environment');
      return true;
    }
    
    // Check for Lovable domains which host the analytics dashboard
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com')) {
      debug.log('Lovable domain detected, likely the analytics dashboard');
      return true;
    }
    
    // Check URL path for analytics-specific patterns
    if (path === '/' || 
        path.includes('/dashboard') || 
        path.includes('/analytics') || 
        url.includes('claro-analytics')) {
      debug.log('Analytics URL pattern detected');
      return true;
    }
    
    // Check for query parameters that might indicate dashboard
    if (url.includes('analytics=') || url.includes('dashboard=')) {
      debug.log('Analytics query parameter detected');
      return true;
    }
    
    return false;
  };
  
  // Check for duplicate tracking
  const shouldTrackPageView = function() {
    // Skip if this is a dashboard
    if (isDashboard()) {
      debug.log('Analytics dashboard detected - not tracking');
      return false;
    }
    
    // Check last track time for current URL
    const lastTrack = localStorage.getItem(TRACKER_CACHE_KEY);
    const now = Date.now();
    
    if (lastTrack) {
      const timeSinceLastTrack = now - parseInt(lastTrack, 10);
      if (timeSinceLastTrack < TRACK_INTERVAL) {
        debug.log('Page view already tracked ' + Math.round(timeSinceLastTrack/1000) + ' seconds ago, skipping duplicate');
        return false;
      }
    }
    
    // Update last track time
    localStorage.setItem(TRACKER_CACHE_KEY, now.toString());
    return true;
  };

  // Track page view
  function trackPageView() {
    // Check if we should track this page view
    if (!shouldTrackPageView()) {
      return;
    }
    
    debug.log('Tracking page view for site ID', SITE_ID || 'unknown');
    
    const data = {
      siteId: SITE_ID || 'unknown',
      url: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      pageTitle: document.title || '',
      eventType: 'page_view'
    };

    const endpoint = TRACKING_ENDPOINT + '/api/track';
    debug.log('Sending data to', endpoint);

    // Use sendBeacon if available, fall back to fetch
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const sent = navigator.sendBeacon(endpoint, blob);
        debug.log('Beacon sent successfully:', sent);
        if (!sent) {
          debug.warn('Beacon failed, falling back to fetch');
          sendWithFetch();
        }
      } catch (err) {
        debug.error('Beacon error', err);
        sendWithFetch();
      }
    } else {
      debug.log('Beacon API not available, using fetch');
      sendWithFetch();
    }
    
    function sendWithFetch() {
      debug.log('Sending data via fetch');
      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        keepalive: true,
        credentials: 'omit' // Don't send cookies for cross-origin requests
      })
      .then(response => {
        debug.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error('Server responded with ' + response.status);
        }
        return response.text();
      })
      .then(text => debug.log('Response:', text))
      .catch(err => {
        debug.error('Fetch error', err);
        // Try one more time with a simple image pixel as last resort
        try {
          const img = new Image();
          const params = new URLSearchParams();
          params.append('data', JSON.stringify(data));
          img.src = endpoint + '?' + params.toString();
          debug.log('Attempting image pixel fallback');
        } catch (e) {
          debug.error('All tracking methods failed', e);
        }
      });
    }
  }

  // Add error handler for the script
  window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('tracker.js')) {
      debug.error('Script error:', event.message);
    }
  });
  
  // Don't track if dashboard is detected
  if (isDashboard()) {
    debug.log('Analytics dashboard detected - not initializing tracking');
    return;
  }
  
  // Use setTimeout to ensure the script runs after the page has fully loaded
  setTimeout(trackPageView, 200);

  // Track navigation changes for SPAs
  let lastUrl = window.location.href;
  
  try {
    // Use different methods to catch navigation changes
    // 1. MutationObserver
    const observer = new MutationObserver(() => {
      if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        debug.log('URL changed (mutation), tracking new page view');
        trackPageView();
      }
    });
    observer.observe(document, { subtree: true, childList: true });
    
    // 2. History API
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      debug.log('pushState called, tracking new page view');
      trackPageView();
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      debug.log('replaceState called, tracking new page view');
      trackPageView();
    };
  } catch (err) {
    debug.error('Failed to setup navigation tracking', err);
  }

  // Handle popstate event
  window.addEventListener('popstate', function() {
    debug.log('History navigation detected');
    trackPageView();
  });
  
  // Log successful initialization
  debug.log('Successfully initialized');

  // Add a global function to manually track page views
  window.claroTrackPageView = trackPageView;
  
  // Export for debugging
  window.claroAnalytics = {
    trackPageView,
    debug
  };
})();
`;

export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
