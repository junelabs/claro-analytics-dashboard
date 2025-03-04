
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onSignOut?: () => Promise<void>;
  userEmail?: string | null;
}

export const Navigation: React.FC<NavigationProps> = ({ onSignOut, userEmail }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="flex justify-between items-center mb-16">
        <Link to="/" className="flex items-center">
          <Header />
        </Link>
        
        <div className="hidden md:flex items-center justify-center flex-grow mx-8">
          <div className="flex space-x-12">
            <Link 
              to="/about" 
              className={isActive('/about') ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              About
            </Link>
            <Link 
              to="/faqs" 
              className={isActive('/faqs') ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              FAQs
            </Link>
            <Link 
              to="/pricing" 
              className={isActive('/pricing') ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Pricing
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex space-x-4 items-center">
          {userEmail ? (
            <div className="flex items-center">
              <span className="text-sm mr-2 text-gray-600">{userEmail}</span>
              {onSignOut && (
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  Sign out
                </Button>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link to="/pricing">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Get Access
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu} 
            className="p-2 flex items-center justify-center text-indigo-600"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>
      
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-white pt-8 px-6 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
            <Header />
          </Link>
          <button 
            onClick={toggleMobileMenu} 
            className="p-2 flex items-center justify-center text-indigo-600"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col space-y-6 items-center">
          <Link 
            to="/about" 
            className={isActive('/about') ? "text-indigo-600 font-medium text-lg" : "text-gray-600 hover:text-gray-900 text-lg font-medium"}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/faqs" 
            className={isActive('/faqs') ? "text-indigo-600 font-medium text-lg" : "text-gray-600 hover:text-gray-900 text-lg font-medium"}
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQs
          </Link>
          <Link 
            to="/pricing" 
            className={isActive('/pricing') ? "text-indigo-600 font-medium text-lg" : "text-gray-600 hover:text-gray-900 text-lg font-medium"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          {userEmail ? (
            <Button 
              variant="outline" 
              onClick={() => {
                if (onSignOut) onSignOut();
                setMobileMenuOpen(false);
              }}
            >
              Sign out
            </Button>
          ) : (
            <>
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                  Get Access
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};
