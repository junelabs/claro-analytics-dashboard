
// This file will be the source for the tracker.js script
// that gets served to client websites

export const trackerScript = `
(function() {
  const TRACKING_ENDPOINT = "{{TRACKING_ENDPOINT}}";
  const SITE_ID = document.currentScript.getAttribute('data-site-id');
  
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

  // Initialization check
  debug.log('Script initializing...');
  
  if (!SITE_ID) {
    debug.error('No site ID provided. Add data-site-id attribute to your script tag.');
    return;
  }

  // Track page view
  function trackPageView() {
    debug.log('Tracking page view for site ID', SITE_ID);
    
    const data = {
      siteId: SITE_ID,
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
      .catch(err => debug.error('Fetch error', err));
    }
  }

  // Add error handler for the script
  window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('tracker.js')) {
      debug.error('Script error:', event.message);
    }
  });

  // Track initial page view
  debug.log('Script loaded from ' + TRACKING_ENDPOINT);
  
  // Use setTimeout to ensure the script runs after the page has fully loaded
  setTimeout(trackPageView, 200);

  // Track navigation changes for SPAs
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      debug.log('URL changed, tracking new page view');
      trackPageView();
    }
  });
  
  try {
    observer.observe(document, { subtree: true, childList: true });
  } catch (err) {
    debug.error('Failed to observe DOM changes', err);
  }

  // Handle navigation events
  window.addEventListener('popstate', function() {
    debug.log('History navigation detected');
    trackPageView();
  });
  
  // Log successful initialization
  debug.log('Successfully initialized for site ID', SITE_ID);

  // Add a global function to manually track page views
  window.claroTrackPageView = trackPageView;
})();
`;

export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
