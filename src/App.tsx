
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { handleTrackingRequest } from "./lib/supabase";
import { getTrackingScript } from "./lib/tracker";

const queryClient = new QueryClient();

// Create a proper handler for the tracking script
const serveTrackingScript = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId') || '';
    // Use the origin from request or fallback to hardcoded endpoint
    // This ensures the script works both in development and production
    const endpoint = `${url.origin}`;
    
    console.log('Serving tracking script for siteId:', siteId, 'endpoint:', endpoint);
    
    // Generate tracking script with proper endpoint
    const script = getTrackingScript(siteId, endpoint);
    
    // Add CORS headers to allow cross-origin requests
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',  // Disable caching for debugging
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

// API route handler
const apiRouteHandler = async (request: Request) => {
  const url = new URL(request.url);
  console.log('API route handler called for:', url.pathname, 'method:', request.method);
  
  // Handle preflight OPTIONS requests for CORS
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
  
  // Serve the tracking script - note the path is exactly "/tracker.js"
  if (url.pathname === '/tracker.js') {
    console.log('Serving tracking script');
    return serveTrackingScript(request);
  }
  
  // Handle tracking endpoint
  if (url.pathname === '/api/track') {
    console.log('Handling tracking request');
    return handleTrackingRequest(request);
  }
  
  // Return a 404 for any other API routes
  console.log('Unknown API route:', url.pathname);
  return new Response('Not found', { 
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain'
    }
  });
};

// Check if the request is for the API
const isApiRequest = (url: string) => {
  return url.includes('/api/') || url.includes('/tracker.js');
};

// Intercept requests for API routes
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
}

// Setup a specific route for tracker.js using the window.location object
if (typeof window !== 'undefined') {
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    // @ts-ignore - We know there are at least 2 arguments
    const url = arguments[1];
    if (typeof url === 'string' && url.includes('/tracker.js')) {
      console.log('Intercepting XHR for tracker.js:', url);
      // @ts-ignore - We know there are at least 2 arguments
      const request = new Request(arguments[1]);
      const response = apiRouteHandler(request);
      
      // Finish handling in fetch interception
    }
    return originalXHROpen.apply(this, arguments as any);
  };
  
  // Handle direct access to tracker.js (from script src attribute)
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'SCRIPT' && (target as HTMLScriptElement).src?.includes('/tracker.js')) {
      console.log('Caught script error for tracker.js, will attempt to serve directly');
      // We can't fix it here, but we can at least log it
    }
  }, true);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tracker.js" element={
            <script dangerouslySetInnerHTML={{ 
              __html: getTrackingScript('', window.location.origin) 
            }} />
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
