
// Debug logging module
export const debugModule = `
  // More visible debug logging
  const debug = {
    log: (message, ...args) => {
      console.log('%c Claro Analytics: ' + message, 'background: #f3f4f6; color: #6366f1; padding: 2px 4px; border-radius: 2px;', ...args);
    },
    error: (message, ...args) => {
      console.error('%c Claro Analytics Error: ' + message, 'background: #fee2e2; color: #ef4444; padding: 2px 4px; border-radius: 2px;', ...args);
    },
    warn: (message, ...args) => {
      console.warn('%c Claro Analytics Warning: ' + message, 'background: #fef3c7; color: #d97706; padding: 2px 4px; border-radius: 2px;', ...args);
    }
  };

  // Script initialization
  debug.log('Script initializing from ' + TRACKING_ENDPOINT);
  debug.log('Site ID: ' + (SITE_ID || 'Not provided'));

  if (!SITE_ID) {
    debug.warn('No site ID provided. Add data-site-id attribute to your script tag. Tracking will continue but data may not be associated correctly.');
  }
`;
