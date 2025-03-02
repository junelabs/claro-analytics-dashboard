
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
  console.log('API route handler called for:', request.url, 'method:', request.method);
  
  const url = new URL(request.url);
  
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
  
  // Serve the tracking script
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
