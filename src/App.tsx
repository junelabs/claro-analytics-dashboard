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

const serveTrackingScript = async (req: Request) => {
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

const apiRouteHandler = async (request: Request) => {
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

const isApiRequest = (url: string) => {
  return url.includes('/api/') || url.includes('/tracker.js');
};

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
}

const pingInterval = 60000;
let lastPingTime = 0;

const pingActiveSession = async () => {
  const siteId = localStorage.getItem('claro_site_id');
  if (!siteId) return;
  
  const now = Date.now();
  if (now - lastPingTime < pingInterval) return;
  
  try {
    const pingData = {
      siteId,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pageTitle: document.title,
      timestamp: new Date().toISOString(),
      isPing: true
    };
    
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pingData)
    });
    
    lastPingTime = now;
    console.log('Session ping sent at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error pinging active session:', error);
  }
};

pingActiveSession();
setInterval(pingActiveSession, pingInterval);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    pingActiveSession();
  }
});

['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
  let debounceTimer: number;
  window.addEventListener(eventType, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(pingActiveSession, 1000);
  }, { passive: true });
});

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
