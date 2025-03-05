
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star, Users, BarChart3, Zap, Store, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Layout } from '@/components/Layout';

const LandingPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      console.log("User is logged in, redirecting to dashboard");
      setIsRedirecting(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

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
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Navigation onSignOut={handleLogout} userEmail={user?.email} />

        <div className="max-w-4xl mx-auto text-center mt-24 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Simplified marketing analytics for <span className="text-indigo-500">ecommerce businesses</span>.
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

        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">Why choose our platform?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 transform transition-all duration-300 hover:scale-105">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitor Tracking</h3>
              <p className="text-gray-600">
                Monitor user behavior, page views, and engagement in real-time with our intuitive dashboard.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8 transform transition-all duration-300 hover:scale-105">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <BarChart3 className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Get detailed insights and visualizations to understand your customer journey and conversion funnel.
              </p>
            </div>
            
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
        
        <div className="bg-white rounded-xl shadow-lg p-12 mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Who is Claro for?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-gray-100 rounded-lg p-6 hover:border-indigo-200 transition-all duration-300">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Store className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Small Online Businesses</h3>
              <p className="text-gray-600">
                Perfect for small online shops that need simple, actionable analytics without the complexity of enterprise solutions.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Easy to implement without IT support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Affordable pricing for growing businesses</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-gray-100 rounded-lg p-6 hover:border-indigo-200 transition-all duration-300">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <ShoppingCart className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ecommerce Marketers</h3>
              <p className="text-gray-600">
                Designed for marketing teams who need to optimize campaigns and understand customer behavior across channels.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Campaign performance tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Customer journey visualization</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-gray-100 rounded-lg p-6 hover:border-indigo-200 transition-all duration-300">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Growing D2C Brands</h3>
              <p className="text-gray-600">
                Ideal for direct-to-consumer brands looking to scale operations with data-driven decision making.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Revenue optimization insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Customer retention analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
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
    </Layout>
  );
};

export default LandingPage;
