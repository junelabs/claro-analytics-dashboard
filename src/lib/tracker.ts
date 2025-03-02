
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
  
  if (!SITE_ID) {
    debug.warn('No site ID provided. Add data-site-id attribute to your script tag. Tracking will continue but data may not be associated correctly.');
  }

  // Check if this is the analytics dashboard to avoid self-tracking
  const isAnalyticsDashboard = window.location.pathname === '/' && 
    window.location.host.includes('lovable.app');
  
  if (isAnalyticsDashboard) {
    debug.log('Analytics dashboard detected - not tracking to avoid inflating metrics');
    return; // Exit early without tracking
  }

  // Track page view
  function trackPageView() {
    debug.log('Tracking page view for site ID', SITE_ID || 'unknown');
    
    const data = {
      siteId: SITE_ID || 'unknown',
      url: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      pageTitle: document.title || ''
    };

    const endpoint = TRACKING_ENDPOINT + '/api/track';
    debug.log('Preparing to send data to', endpoint, data);

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
      debug.log('Sending data via fetch to', endpoint);
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
  
  // Notify that the script loaded successfully
  debug.log('Script loaded and executed successfully');
})();
`;

export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
