
// Initialization module
export const initModule = `
  // Don't track if dashboard is detected
  if (isDashboard()) {
    debug.log('Analytics dashboard detected - not initializing tracking');
    return;
  }
  
  // Use setTimeout to ensure the script runs after the page has fully loaded
  setTimeout(trackPageView, 200);
  
  // Log successful initialization
  debug.log('Successfully initialized');

  // Add a global function to manually track page views
  window.claroTrackPageView = trackPageView;
  
  // Export for debugging
  window.claroAnalytics = {
    trackPageView,
    debug,
    pingSession
  };
`;
