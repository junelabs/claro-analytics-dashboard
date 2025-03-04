
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-10 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Claro</h3>
            <p className="text-gray-600 text-sm">
              Simple analytics for ecommerce businesses. Understand your customers without the complexity.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-gray-600 hover:text-indigo-600 text-sm">Pricing</Link></li>
              <li><Link to="/faqs" className="text-gray-600 hover:text-indigo-600 text-sm">FAQs</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-indigo-600 text-sm">About</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-600 hover:text-indigo-600" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
            <p className="text-gray-600 text-sm">contact@claro.so</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© {currentYear} Claro. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-indigo-600 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
