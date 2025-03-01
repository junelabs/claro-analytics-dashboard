
// This file will be the source for the tracker.js script
// that gets served to client websites

export const trackerScript = `
(function() {
  const TRACKING_ENDPOINT = "{{TRACKING_ENDPOINT}}";
  const SITE_ID = document.currentScript.getAttribute('data-site-id');
  
  if (!SITE_ID) {
    console.error('Claro Analytics: No site ID provided');
    return;
  }

  // Track page view
  function trackPageView() {
    console.log('Claro Analytics: Tracking page view for site ID', SITE_ID);
    
    const data = {
      siteId: SITE_ID,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };

    console.log('Claro Analytics: Sending data to ' + TRACKING_ENDPOINT + '/api/track');

    // Use sendBeacon if available, fall back to fetch
    if (navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(TRACKING_ENDPOINT + '/api/track', JSON.stringify(data));
        console.log('Claro Analytics: Beacon sent successfully:', sent);
      } catch (err) {
        console.error('Claro Analytics: Beacon error', err);
        sendWithFetch();
      }
    } else {
      sendWithFetch();
    }
    
    function sendWithFetch() {
      fetch(TRACKING_ENDPOINT + '/api/track', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        keepalive: true
      })
      .then(response => {
        console.log('Claro Analytics: Fetch response status:', response.status);
        return response.text();
      })
      .then(text => console.log('Claro Analytics: Response:', text))
      .catch(err => console.error('Claro Analytics: Fetch error', err));
    }
  }

  // Track initial page view
  console.log('Claro Analytics: Script loaded from ' + TRACKING_ENDPOINT);
  trackPageView();

  // Track navigation changes for SPAs
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      console.log('Claro Analytics: URL changed, tracking new page view');
      trackPageView();
    }
  }).observe(document, { subtree: true, childList: true });

  // Handle navigation events
  window.addEventListener('popstate', trackPageView);
  
  // Log successful initialization
  console.log('Claro Analytics: Successfully initialized for site ID', SITE_ID);
})();
`;

export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
