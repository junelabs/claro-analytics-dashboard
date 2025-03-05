
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Index from '@/pages/Index';
import { toast } from 'sonner';

const DashboardRoute = () => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Detect if we're on the dashboard subdomain
  const isDashboardDomain = window.location.hostname === 'dashboard.claroinsights.com';
  const isProd = window.location.hostname === 'claroinsights.com' || 
                 window.location.hostname === 'www.claroinsights.com';
  
  useEffect(() => {
    // If there's an error in the URL (like after a failed authentication)
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      console.error('Auth error:', error, errorDescription);
      toast.error('Authentication error', {
        description: errorDescription || 'Please try logging in again'
      });
      
      // Clear the error from URL but stay on the same page
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  // Using a second useEffect to ensure auth check happens only once
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        console.log('Auth check completed. User authenticated:', !!user);
        console.log('Current domain:', window.location.hostname);
        console.log('Is dashboard domain:', isDashboardDomain);
        console.log('Is production:', isProd);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [loading, user, isDashboardDomain, isProd]);
  
  // Show loading state while authentication status is being determined
  if (loading || !authChecked) {
    console.log('Dashboard route: Still loading or checking auth...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If no user is authenticated after checking, redirect to login
  if (!user && !session) {
    console.log('No authenticated user found, redirecting to login');
    // If on dashboard subdomain, redirect to main domain login
    if (isDashboardDomain) {
      console.log('Redirecting from dashboard subdomain to main domain login');
      window.location.href = isProd 
        ? 'https://claroinsights.com/auth/login' 
        : `${window.location.origin.replace('dashboard.', '')}/auth/login`;
      return null;
    }
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  // If we're on the main domain but should be on dashboard subdomain in production
  if (isProd && !isDashboardDomain && (user || session)) {
    console.log('User is authenticated but on main domain, redirecting to dashboard subdomain');
    window.location.href = 'https://dashboard.claroinsights.com';
    return null;
  }
  
  // User is authenticated, render the dashboard
  console.log('User authenticated, rendering dashboard');
  return <Index />;
};

export default DashboardRoute;
