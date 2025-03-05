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
    
    // More precise detection of dashboard URLs
    // Check for dashboard in the path
    if (path.includes('/dashboard')) {
      return true;
    }
    
    // Check for analytics in the path
    if (path.includes('/analytics')) {
      return true;
    }
    
    // Check for specific dashboard domains
    if (hostname.includes('lovable.app') || 
        hostname.includes('lovable.dev') || 
        hostname.includes('lovableproject.com') ||
        hostname.includes('claroinsights.com')) {
      return true;
    }
    
    // Localhost detection - only treat as dashboard if explicit dashboard path
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && 
        (path === '/' || path.includes('/dashboard'))) {
      return true;
    }
    
    // Additional check for preview URLs
    if (hostname.includes('preview') && 
        (path === '/' || path.includes('/dashboard'))) {
      return true;
    }
    
    // This is likely a client website URL that should be tracked
    return false;
  } catch (e) {
    console.error('Error parsing URL:', e);
    // Simpler fallback - only detect explicit dashboard keywords
    return url.includes('/dashboard') || 
           url.includes('/analytics') || 
           url.includes('claroinsights.com');
  }
};
