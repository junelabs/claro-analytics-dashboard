
// Dashboard detection module
export const dashboardDetection = `
  // Comprehensive check to detect if current page is an analytics dashboard
  const isDashboard = function() {
    // Get current URL and host
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    
    // Check for domains which host the analytics dashboard
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com')) {
      debug.log('Analytics dashboard domain detected, skipping tracking');
      return true;
    }
    
    // Only treat localhost as dashboard if it has dashboard paths
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      if (path.includes('/dashboard') || path.includes('/analytics')) {
        debug.log('Localhost dashboard path detected, skipping tracking');
        return true;
      }
      debug.log('Localhost detected but not dashboard path, will track');
      return false;
    }
    
    // Check URL path for analytics-specific patterns
    if (path.includes('/dashboard') || path.includes('/analytics')) {
      debug.log('Analytics URL pattern detected');
      return true;
    }
    
    debug.log('Not a dashboard URL, will track');
    return false;
  };
`;
