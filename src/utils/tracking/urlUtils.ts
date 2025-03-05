
// Helper to determine if a URL is from the analytics dashboard
export const isDashboardUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    
    // Check for Lovable domains which host the analytics dashboard
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com')) {
      console.log('Analytics dashboard detected (Lovable domain):', url);
      return true;
    }
    
    // Check for localhost or development only if it's the dashboard path
    if ((hostname.includes('localhost') || hostname.includes('127.0.0.1')) && 
        (path.includes('/dashboard') || path.includes('/analytics') || path === '/')) {
      console.log('Analytics dashboard detected (localhost dashboard path):', url);
      return true;
    }
    
    // Check for dashboard-specific paths
    if (path.includes('/dashboard') || path.includes('/analytics')) {
      console.log('Analytics dashboard detected (dashboard path):', url);
      return true;
    }
    
    // This is a client website URL, should be tracked
    console.log('Client website URL detected, will track:', url);
    return false;
  } catch (e) {
    // If URL parsing fails, fall back to simple string matching
    console.error('Error parsing URL:', e);
    const isDashboard = url.includes('lovable') || 
                        (url.includes('localhost') && url.includes('/dashboard')) ||
                        url.includes('/analytics');
    
    console.log('URL parsing failed, dashboard detection fallback result:', isDashboard);
    return isDashboard;
  }
};
