
import { useEffect } from 'react';
import { initializePingTracking } from '@/utils/tracking';

export const useTracking = () => {
  useEffect(() => {
    // Only run tracking in production or when explicitly enabled
    if (window.location.hostname !== 'localhost' || 
        localStorage.getItem('enable_local_tracking') === 'true') {
      console.log('Initializing tracking from useTracking hook');
      initializePingTracking();
    } else {
      console.log('Tracking disabled for localhost. Set localStorage.enable_local_tracking="true" to enable');
    }
  }, []);
  
  return null;
};
