
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Menu, ChevronUp } from 'lucide-react';

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
              <Link to="/auth/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  {isActive('/pricing') ? 'Get Access' : 'Sign up'}
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu} 
            className="p-2 flex items-center justify-center bg-indigo-100 rounded-full"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <ChevronUp className="h-6 w-6 text-indigo-600" />
            ) : (
              <Menu className="h-6 w-6 text-indigo-600" />
            )}
          </button>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-20 px-6">
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
                  to="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                    {isActive('/pricing') ? 'Get Access' : 'Sign up'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
