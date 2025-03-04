import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import Pricing from "./pages/Pricing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { handleTrackingRequest } from "./lib/supabase";
import { getTrackingScript } from "./lib/tracker";

const queryClient = new QueryClient();

// Track already processed URLs to prevent duplicate page views
const processedUrls = new Map<string, number>();
const DUPLICATE_WINDOW = 60000; // 60 seconds

const isDuplicateRequest = (url: string): boolean => {
  const now = Date.now();
  const lastProcessed = processedUrls.get(url);
  
  if (lastProcessed && (now - lastProcessed) < DUPLICATE_WINDOW) {
    console.log('Duplicate request detected for URL:', url);
    return true;
  }
  
  // Update last processed time
  processedUrls.set(url, now);
  
  // Clean up old entries to prevent memory leaks
  if (processedUrls.size > 100) {
    const oldEntries = [...processedUrls.entries()]
      .filter(([_, timestamp]) => (now - timestamp) > DUPLICATE_WINDOW * 2);
    oldEntries.forEach(([key]) => processedUrls.delete(key));
  }
  
  return false;
};

// Helper to determine if a URL is from the analytics dashboard
const isDashboardUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    
    // Check for localhost or Lovable domains
    if (hostname.includes('localhost') || 
        hostname.includes('127.0.0.1') ||
        hostname.includes('lovable.app') ||
        hostname.includes('lovable.dev') ||
        hostname.includes('lovableproject.com')) {
      return true;
    }
    
    // Check paths
    if (path === '/' || 
        path.includes('/dashboard') || 
        path.includes('/analytics')) {
      return true;
    }
    
    return false;
  } catch (e) {
    // If URL parsing fails, fall back to simple string matching
    return url.includes('localhost') ||
           url.includes('lovable') ||
           url.includes('/dashboard') ||
           url.includes('/analytics');
  }
};

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
    
    // Check for duplicate requests
    if (isDuplicateRequest(request.url)) {
      console.log('Skipping duplicate tracking request');
      return new Response(JSON.stringify({ success: true, skipped: 'duplicate' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
let lastPageViewUrl = '';
let lastPageViewTime = 0;

const pingActiveSession = async () => {
  const siteId = localStorage.getItem('claro_site_id');
  if (!siteId) return;
  
  const now = Date.now();
  if (now - lastPingTime < pingInterval) return;
  
  // Skip pinging if this is a dashboard URL
  if (isDashboardUrl(window.location.href)) {
    console.log('Not pinging for analytics dashboard');
    return;
  }
  
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
      isPing: true,
      eventType: 'session_ping'
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

const shouldTrackPageView = () => {
  const currentUrl = window.location.href;
  const now = Date.now();
  
  // Don't track analytics dashboard
  if (isDashboardUrl(currentUrl)) {
    console.log('Not tracking page view for analytics dashboard');
    return false;
  }
  
  if (currentUrl === lastPageViewUrl && now - lastPageViewTime < 60000) {
    console.log('Skipping duplicate page view tracking within 60s window');
    return false;
  }
  
  lastPageViewUrl = currentUrl;
  lastPageViewTime = now;
  return true;
};

// Initialize ping on load, but only if not a dashboard
if (!isDashboardUrl(window.location.href)) {
  pingActiveSession();
  setInterval(pingActiveSession, pingInterval);
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !isDashboardUrl(window.location.href)) {
      pingActiveSession();
    }
  });
  
  ['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
    let debounceTimer: NodeJS.Timeout | null = null;
    window.addEventListener(eventType, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!isDashboardUrl(window.location.href)) {
          pingActiveSession();
        }
      }, 1000);
    }, { passive: true });
  });
}

const Root = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If user is logged in, show the dashboard, otherwise go to landing page
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            <Route path="/tracker.js" element={
              <script dangerouslySetInnerHTML={{ 
                __html: getTrackingScript('', window.location.origin) 
              }} />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
