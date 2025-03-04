
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

  useEffect(() => {
    // Mark auth as checked once we've determined loading state
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);
  
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login page
  if (!user && !session) {
    console.log('No authenticated user found, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Index />;
};

export default DashboardRoute;
