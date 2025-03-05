
import { isDashboardUrl } from './urlUtils';

let lastPageViewUrl = '';
let lastPageViewTime = 0;

export const shouldTrackPageView = (url: string = window.location.href) => {
  const currentUrl = url;
  const now = Date.now();
  
  // Don't track analytics dashboard
  if (isDashboardUrl(currentUrl)) {
    console.log('Not tracking page view for analytics dashboard');
    return false;
  }
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 30000) { // Reduced to 30s from 60s
    console.log('Skipping duplicate page view tracking within 30s window');
    return false;
  }
  
  console.log('Should track page view for:', currentUrl);
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};
