// Main entry point that composes the full tracker script
import { debugModule } from './debug';
import { dashboardDetection } from './dashboardDetection';
import { pageTracking } from './pageTracking';
import { sessionPing } from './sessionPing';
import { navigationTracking } from './navigationTracking';
import { initModule } from './init';

// Assemble the full script from individual modules
export const trackerScript = `
(function() {
  const TRACKING_ENDPOINT = "{{TRACKING_ENDPOINT}}";
  const SITE_ID = document.currentScript.getAttribute('data-site-id') || '';
  
  ${debugModule}
  
  ${dashboardDetection}
  
  ${pageTracking}
  
  ${sessionPing}
  
  ${navigationTracking}
  
  ${initModule}
})();
`;

// Keep the getTrackingScript function for backward compatibility
export const getTrackingScript = (siteId: string, endpoint: string): string => {
  return trackerScript
    .replace('{{TRACKING_ENDPOINT}}', endpoint);
};
