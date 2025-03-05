
// Helper to determine if a URL is from the analytics dashboard
export const isDashboardUrl = (url: string): boolean => {
  try {
    // For testing - force bypassing dashboard detection if needed
    if (localStorage.getItem('force_tracking') === 'true') {
      console.log('Force tracking enabled, bypassing dashboard detection');
      return false;
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    
    // More selective detection of dashboard URLs
    // Only classify as dashboard if it's explicitly in a dashboard path
    if (path.includes('/dashboard') || path.includes('/analytics')) {
      console.log('Analytics dashboard path detected:', path);
      return true;
    }
    
    // Only treat specific domains as dashboard
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com')) {
      console.log('Dashboard domain detected:', hostname);
      return true;
    }
    
    // For localhost, only treat as dashboard if explicit dashboard path
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && 
        (path === '/' || path.includes('/dashboard'))) {
      console.log('Dashboard localhost detected');
      return true;
    }
    
    // This is likely a client website URL that should be tracked
    console.log('Client website URL detected, will track:', url);
    return false;
  } catch (e) {
    console.error('Error parsing URL:', e);
    // Simpler fallback - only detect explicit dashboard keywords
    return url.includes('/dashboard') || url.includes('/analytics');
  }
};
