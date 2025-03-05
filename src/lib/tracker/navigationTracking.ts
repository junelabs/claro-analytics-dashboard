
// Navigation tracking module for SPAs
export const navigationTracking = `
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
`;
