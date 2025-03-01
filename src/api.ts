
import { trackPageView, handleTrackingRequest } from './lib/supabase';
import { getTrackingScript } from './lib/tracker';

// Export the API route handler for serverless functions
export default async function handler(request: Request) {
  const url = new URL(request.url);
  
  // Serve the tracking script
  if (url.pathname.endsWith('/tracker.js')) {
    const siteId = url.searchParams.get('siteId') || '';
    const endpoint = `${url.origin}`;
    const script = getTrackingScript(siteId, endpoint);
    
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  
  // Handle tracking endpoint
  if (url.pathname.endsWith('/api/track') && request.method === 'POST') {
    return handleTrackingRequest(request);
  }
  
  // Return a 404 for any other routes
  return new Response('Not found', { status: 404 });
}
