import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <Navigation />

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
