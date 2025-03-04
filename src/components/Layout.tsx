
import React, { ReactNode } from 'react';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow py-8 px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};
