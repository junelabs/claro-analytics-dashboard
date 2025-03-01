
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
    
    // Generate tracking script with proper endpoint
    const script = getTrackingScript(siteId, endpoint);
    
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving tracking script:', error);
    return new Response('console.error("Error loading tracking script");', {
      headers: {
        'Content-Type': 'application/javascript',
      },
      status: 500,
    });
  }
};

// API route handler
const apiRouteHandler = async (request: Request) => {
  const url = new URL(request.url);
  
  // Serve the tracking script
  if (url.pathname === '/tracker.js') {
    return serveTrackingScript(request);
  }
  
  // Handle tracking endpoint
  if (url.pathname === '/api/track' && request.method === 'POST') {
    return handleTrackingRequest(request);
  }
  
  // Return a 404 for any other API routes
  return new Response('Not found', { status: 404 });
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
