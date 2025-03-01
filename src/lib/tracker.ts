
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
    const data = {
      siteId: SITE_ID,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };

    // Use sendBeacon if available, fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_ENDPOINT + '/api/track', JSON.stringify(data));
    } else {
      fetch(TRACKING_ENDPOINT + '/api/track', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => console.error('Claro Analytics:', err));
    }
  }

  // Track initial page view
  trackPageView();

  // Track navigation changes for SPAs
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      trackPageView();
    }
  }).observe(document, { subtree: true, childList: true });

  // Handle navigation events
  window.addEventListener('popstate', trackPageView);
})();
`;

export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
