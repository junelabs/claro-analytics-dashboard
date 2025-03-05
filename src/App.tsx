
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import Pricing from "./pages/Pricing";
import TallyForm from "./pages/TallyForm";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import { AuthProvider } from "./context/AuthContext";
import DashboardRoute from "./routes/DashboardRoute";
import { setupApiInterception } from "./utils/apiHandler";
import { initializePingTracking } from "./utils/tracking";

// Set up the query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize API interception
setupApiInterception();

// Initialize ping tracking
initializePingTracking();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/beta-signup" element={<TallyForm />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard/*" element={<DashboardRoute />} />
            
            {/* API route handler */}
            <Route path="/api/*" element={<div>API Route</div>} />
            <Route path="/tracker.js" element={<div>Tracker Script</div>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
