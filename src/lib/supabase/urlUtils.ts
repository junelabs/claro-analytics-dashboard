
// Enhanced dashboard detection
export function isDashboardUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    
    // Check hosts that are definitely dashboards
    if (hostname.includes('localhost') || 
        hostname.includes('127.0.0.1') ||
        hostname.includes('lovable.app') ||
        hostname.includes('lovable.dev') ||
        hostname.includes('lovableproject.com')) {
      console.log('Dashboard detected via hostname:', hostname);
      return true;
    }
    
    // Check paths that indicate dashboard
    if (path === '/' || 
        path.includes('/dashboard') || 
        path.includes('/analytics')) {
      console.log('Dashboard detected via path:', path);
      return true;
    }
    
    // Check for specific query parameters
    if (urlObj.searchParams.has('analytics') || 
        urlObj.searchParams.has('dashboard') ||
        url.includes('claro-analytics')) {
      return true;
    }
    
    return false;
  } catch (e) {
    // If URL parsing fails, fall back to simple string matching
    return url.includes('localhost') ||
           url.includes('lovable') ||
           url.includes('/dashboard') ||
           url.includes('/analytics');
  }
}
