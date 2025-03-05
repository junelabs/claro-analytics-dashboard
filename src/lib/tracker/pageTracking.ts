
// Page tracking module
export const pageTracking = `
  // Cache tracking status to prevent multiple loads
  const TRACKER_CACHE_KEY = 'claro_last_track_' + window.location.href;
  const TRACK_INTERVAL = 30000; // 30 seconds for more frequent updates
  
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
    debug.log('Will track this page view');
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
    let sent = false;
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        sent = navigator.sendBeacon(endpoint, blob);
        debug.log('Beacon sent successfully:', sent);
      } catch (err) {
        debug.error('Beacon error', err);
        sent = false;
      }
    }
    
    if (!sent) {
      debug.log('Using fetch for tracking');
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
`;
