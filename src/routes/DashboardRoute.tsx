
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
  
  // Safely detect if we're on the dashboard subdomain
  const hostname = window.location.hostname || '';
  const isDashboardDomain = hostname.startsWith('dashboard.') || hostname === 'dashboard.claroinsights.com';
  
  // Check if we're in production environment
  const isProd = hostname.includes('claroinsights.com') || 
                 hostname === 'www.claroinsights.com' ||
                 hostname === 'claroinsights.com';
  
  // For development environment detection
  const isDev = hostname.includes('localhost') || 
                hostname.includes('127.0.0.1') ||
                hostname.includes('lovableproject.com');
  
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
        console.log('Current domain:', hostname);
        console.log('Is dashboard domain:', isDashboardDomain);
        console.log('Is production:', isProd);
        console.log('Is development:', isDev);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [loading, user, isDashboardDomain, isProd, isDev, hostname]);
  
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
      try {
        // For production, use the specific domain
        if (isProd) {
          window.location.href = 'https://claroinsights.com/auth/login';
        } 
        // For local development, just replace 'dashboard.' prefix
        else if (isDev) {
          const loginUrl = `${window.location.protocol}//${hostname.replace('dashboard.', '')}/auth/login`;
          console.log('Redirecting to login URL:', loginUrl);
          window.location.href = loginUrl;
        }
        // Fallback for other environments
        else {
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback if the redirect fails
        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
      }
      return null;
    }
    
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  // If we're on the main domain but should be on dashboard subdomain in production
  if (isProd && !isDashboardDomain && (user || session)) {
    console.log('User is authenticated but on main domain, redirecting to dashboard subdomain');
    try {
      window.location.href = 'https://dashboard.claroinsights.com';
    } catch (error) {
      console.error('Error during redirect to dashboard domain:', error);
      // Continue rendering the dashboard as fallback
    }
    return null;
  }
  
  // User is authenticated, render the dashboard
  console.log('User authenticated, rendering dashboard');
  return <Index />;
};

export default DashboardRoute;
