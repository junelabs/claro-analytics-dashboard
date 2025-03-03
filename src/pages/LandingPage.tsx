
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogOut } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Log authentication state for debugging
    console.log("Current auth state:", { user, isLoggedIn: !!user });
  }, [user]);

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-100">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <Header />
          </div>
          <div className="flex items-center justify-center flex-grow mx-8">
            <div className="flex space-x-12">
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/faqs" className="text-gray-600 hover:text-gray-900">FAQs</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            {user ? (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/auth/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center mt-24 mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-8">
            Simplifying analytics and data for <span className="text-indigo-500">ecommerce businesses</span>.
          </h1>
          <Link to="/auth/signup">
            <Button className="bg-indigo-500 hover:bg-indigo-600 px-8 py-6 text-lg">
              Join the waitlist <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Loved by teams section */}
        <div className="max-w-4xl mx-auto text-center mt-24 mb-20">
          <h2 className="text-xl font-medium text-gray-600 mb-10">Loved by teams at</h2>
          <div className="flex justify-between items-center">
            <img src="/lovable-uploads/341bf82f-998c-4367-b5fe-4bc338377d52.png" alt="Partner companies" className="w-full" />
          </div>
        </div>

        {/* Demo section with title */}
        <div className="relative bg-white shadow-xl rounded-lg p-8 mt-4 mb-24 cursor-not-allowed">
          <div className="absolute top-0 left-0 w-full bg-indigo-600 text-white py-2 px-4 rounded-t-lg text-center">
            <span className="font-medium">Interactive Demo Preview</span>
          </div>
          <div className="pt-8 pointer-events-none select-none opacity-95">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-500 w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="font-semibold text-xl">Claro</span>
              </div>
              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-500 opacity-90">Get Tracking Script</Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-gray-700">AI Insights</span>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="opacity-90">Generate new insight</Button>
                </div>
              </div>
              <p className="text-gray-600 text-sm ml-7 mb-2">
                You've received 18 page views from approximately 3 unique visitors. Your most visited page is "/home" with 6 views. This is followed by "/pricing" with 5 views.
              </p>
              <button className="text-indigo-500 text-sm ml-7">Show more</button>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-5 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-500 uppercase text-xs mb-1">UNIQUE VISITORS</p>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-green-500 text-xs">+0%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-500 uppercase text-xs mb-1">TOTAL VISITS</p>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-green-500 text-xs">+0%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-500 uppercase text-xs mb-1">TOTAL PAGEVIEWS</p>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-green-500 text-xs">+0%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-500 uppercase text-xs mb-1">VIEWS PER VISIT</p>
                  <p className="text-2xl font-bold">6.00</p>
                  <p className="text-green-500 text-xs">+0%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-500 uppercase text-xs mb-1">VISIT DURATION</p>
                  <p className="text-2xl font-bold">0s</p>
                  <p className="text-green-500 text-xs">+0%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
