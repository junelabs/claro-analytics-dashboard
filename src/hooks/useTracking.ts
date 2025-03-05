
import { useEffect } from 'react';
import { initializePingTracking } from '@/utils/tracking';

export const useTracking = () => {
  useEffect(() => {
    // Always enable tracking for testing purposes
    localStorage.setItem('enable_local_tracking', 'true');
    console.log('Initializing tracking from useTracking hook - forcing enabled');
    initializePingTracking();
  }, []);
  
  return null;
};
