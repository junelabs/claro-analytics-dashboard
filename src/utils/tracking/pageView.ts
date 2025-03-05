
import { isDashboardUrl } from './urlUtils';

let lastPageViewUrl = '';
let lastPageViewTime = 0;

export const shouldTrackPageView = () => {
  const currentUrl = window.location.href;
  const now = Date.now();
  
  // Don't track analytics dashboard
  if (isDashboardUrl(currentUrl)) {
    console.log('Not tracking page view for analytics dashboard');
    return false;
  }
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 60000) {
    console.log('Skipping duplicate page view tracking within 60s window');
    return false;
  }
  
  console.log('Should track page view for:', currentUrl);
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};
