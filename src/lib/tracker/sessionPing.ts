// Session ping module
export const sessionPing = `
  // Set up active session pinging with more frequent updates
  function pingSession() {
    if (isDashboard()) return;
    
    debug.log('Pinging active session');
    
    const data = {
      siteId: SITE_ID || 'unknown',
      url: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      pageTitle: document.title || '',
      eventType: 'session_ping',
      isPing: true
    };
    
    const endpoint = TRACKING_ENDPOINT + '/api/track';
    
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } catch (err) {
      // Fallback to fetch if sendBeacon fails
      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(e => debug.error('Error pinging session:', e));
    }
  }
  
  // Ping more frequently to keep session active and data fresh
  setInterval(pingSession, 30000); // Every 30 seconds
  
  // Ping on user activity
  ['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
    let debounceTimer;
    window.addEventListener(eventType, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(pingSession, 1000);
    }, { passive: true });
  });
`;
