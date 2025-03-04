import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star, Users, BarChart3, Zap, Menu, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only redirect after auth state has been determined
    if (!loading && user) {
      console.log("User is logged in, redirecting to dashboard");
      setIsRedirecting(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // If user is authenticated or we're checking auth status, show loading
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-white to-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-100">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <Link to="/">
              <Header />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-grow mx-8">
            <div className="flex space-x-12">
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/faqs" className="text-gray-600 hover:text-gray-900">FAQs</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/pricing">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Get Access</Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="p-2">
              {mobileMenuOpen ? 
                <X className="h-6 w-6 text-gray-900" /> : 
                <Menu className="h-6 w-6 text-gray-900" />
              }
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white pt-20 px-6">
            <div className="flex flex-col space-y-6 items-center">
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-gray-900 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/faqs" 
                className="text-gray-600 hover:text-gray-900 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-600 hover:text-gray-900 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/auth/login" 
                className="text-gray-600 hover:text-gray-900 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">Get Access</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mt-24 mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-8">
            Simplifying marketing and analytics for <span className="text-indigo-500">ecommerce businesses</span>.
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Gain valuable insights, track customer behavior, and optimize your online store with our powerful analytics platform.
          </p>
          <Link to="/pricing">
            <Button className="bg-indigo-500 hover:bg-indigo-600 px-8 py-6 text-lg">
              Get access <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">Why choose our platform?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md p-8 transform transition-all duration-300 hover:scale-105">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitor Tracking</h3>
              <p className="text-gray-600">
                Monitor user behavior, page views, and engagement in real-time with our intuitive dashboard.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md p-8 transform transition-all duration-300 hover:scale-105">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <BarChart3 className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Get detailed insights and visualizations to understand your customer journey and conversion funnel.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md p-8 transform transition-all duration-300 hover:scale-105">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Zap className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Leverage machine learning to uncover trends and receive personalized recommendations.
              </p>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="bg-white rounded-xl shadow-lg p-12 mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by ecommerce leaders</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="border border-gray-100 rounded-lg p-6">
              <div className="flex space-x-1 mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-600 italic mb-4">
                "This platform transformed how we understand our customers. The insights we've gained have directly increased our conversion rate by 24%."
              </p>
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-100 w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold text-indigo-600">JD</span>
                </div>
                <div>
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-sm text-gray-500">CEO, FashionStore</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="border border-gray-100 rounded-lg p-6">
              <div className="flex space-x-1 mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-600 italic mb-4">
                "The AI-powered recommendations have been game-changing for our marketing strategy. We've seen a 40% increase in repeat customers."
              </p>
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-100 w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-bold text-indigo-600">MS</span>
                </div>
                <div>
                  <p className="font-semibold">Mark Smith</p>
                  <p className="text-sm text-gray-500">Marketing Director, TechGadgets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl p-12 mb-24 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your marketing and analytics?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Request access to join our group of beta customers and get a lifetime discount.
          </p>
          <Link to="/pricing">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Get access
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
