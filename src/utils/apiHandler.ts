
import { handleTrackingRequest } from "../lib/supabase";
import { getTrackingScript } from "../lib/tracker";
import { isDuplicateRequest } from "./tracking";

export const serveTrackingScript = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId') || '';
    const endpoint = `${url.origin}`;
    
    console.log('Serving tracking script for siteId:', siteId, 'endpoint:', endpoint);
    
    const script = getTrackingScript(siteId, endpoint);
    
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      },
    });
  } catch (error) {
    console.error('Error serving tracking script:', error);
    return new Response('console.error("Error loading Claro Analytics tracking script");', {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500,
    });
  }
};

export const apiRouteHandler = async (request: Request) => {
  const url = new URL(request.url);
  console.log('API route handler called for:', url.pathname, 'method:', request.method);
  
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for:', url.pathname);
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  if (url.pathname === '/tracker.js') {
    console.log('Serving tracking script');
    return serveTrackingScript(request);
  }
  
  if (url.pathname === '/api/track') {
    console.log('Handling tracking request');
    
    // Don't check for duplicate requests for pings
    let requestData;
    try {
      const clone = request.clone();
      requestData = await clone.json();
    } catch (e) {
      console.error('Error parsing request data:', e);
      requestData = {};
    }
    
    if (!requestData.isPing && !requestData.eventType?.includes('ping')) {
      // Check for duplicate requests only for page views
      if (isDuplicateRequest(request.url)) {
        console.log('Skipping duplicate tracking request');
        return new Response(JSON.stringify({ success: true, skipped: 'duplicate' }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } else {
      console.log('Processing ping request without duplicate check');
    }
    
    return handleTrackingRequest(request);
  }
  
  console.log('Unknown API route:', url.pathname);
  return new Response('Not found', { 
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain'
    }
  });
};

export const isApiRequest = (url: string) => {
  return url.includes('/api/') || url.includes('/tracker.js');
};

// Set up API request interception
export const setupApiInterception = () => {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      if (typeof input === 'string' && isApiRequest(input)) {
        console.log('Intercepting API request:', input);
        const request = new Request(input, init);
        return apiRouteHandler(request);
      }
      return originalFetch(input, init);
    };
    
    console.log('API interception set up for fetch');
  }

  if (typeof window !== 'undefined') {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      const url = arguments[1];
      if (typeof url === 'string' && url.includes('/tracker.js')) {
        console.log('Intercepting XHR for tracker.js:', url);
        const request = new Request(arguments[1]);
        const response = apiRouteHandler(request);
        
        return response;
      }
      return originalXHROpen.apply(this, arguments as any);
    };
    
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SCRIPT' && (target as HTMLScriptElement).src?.includes('/tracker.js')) {
        console.log('Caught script error for tracker.js, will attempt to serve directly');
      }
    }, true);
    
    console.log('API interception set up for XHR and script errors');
  }
};
