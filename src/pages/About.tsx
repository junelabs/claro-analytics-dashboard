
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Menu, X } from 'lucide-react';

const About = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <Link to="/" className="flex items-center">
            <Header />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-grow mx-8">
            <div className="flex space-x-12">
              <Link to="/about" className="text-indigo-600 font-medium">About</Link>
              <Link to="/faqs" className="text-gray-600 hover:text-gray-900">FAQs</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Sign up</Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="p-2">
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white pt-20 px-6">
            <div className="flex flex-col space-y-6 items-center">
              <Link 
                to="/about" 
                className="text-indigo-600 font-medium text-lg"
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
                to="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">Sign up</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-6">About Claro</h1>
          <p className="text-lg text-gray-700 mb-6">
            Claro is a powerful yet simple analytics platform designed specifically for ecommerce businesses. 
            Our mission is to help online stores make data-driven decisions without the complexity of traditional analytics tools.
          </p>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Our Story</h2>
          <p className="text-lg text-gray-700 mb-6">
            Founded in 2023, Claro was born out of frustration with existing analytics solutions that were either too 
            complex or not focused enough on the unique needs of ecommerce businesses. We set out to build a platform that 
            provides actionable insights without requiring a data science degree to understand them.
          </p>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Our Approach</h2>
          <p className="text-lg text-gray-700 mb-6">
            We believe that analytics should be accessible to everyone. Our platform focuses on delivering clear, 
            actionable insights that help you understand your customers' behavior and optimize your marketing efforts.
          </p>
          
          <div className="mt-16 mb-8">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Sign up for free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
