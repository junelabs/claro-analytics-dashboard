
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Check, Menu, X } from 'lucide-react';

const Pricing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const lifetimePlan = {
    name: "Lifetime",
    price: "$99",
    period: "one-time payment",
    description: "Pay once, use forever",
    features: [
      "Unlimited page views",
      "Full analytics suite",
      "Unlimited websites",
      "12-month data retention",
      "Priority support",
      "Custom events tracking",
      "Premium AI-powered insights",
      "API access",
      "Early access to new features"
    ],
    cta: "Get Access",
    highlighted: true
  };

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
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/faqs" className="text-gray-600 hover:text-gray-900">FAQs</Link>
              <Link to="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Get Access</Button>
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
                className="text-indigo-600 font-medium text-lg"
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">Get Access</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto mt-12">
          <h1 className="text-4xl font-bold mb-4 text-center">Get early access today</h1>
          <p className="text-lg text-gray-700 mb-12 text-center">
            Limited beta users will receive lifetime access at a special price
          </p>
          
          <div className="flex justify-center mb-16">
            <div 
              className="rounded-lg p-8 bg-indigo-50 border-2 border-indigo-500 shadow-lg max-w-md w-full"
            >
              <h3 className="text-xl font-semibold mb-2">{lifetimePlan.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-bold">{lifetimePlan.price}</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">{lifetimePlan.period}</div>
              <p className="text-gray-600 mb-6">{lifetimePlan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {lifetimePlan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {lifetimePlan.cta}
              </Button>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-2">Need a custom enterprise solution?</p>
            <Button variant="link" className="text-indigo-600">
              Contact our sales team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
