
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Layout } from '@/components/Layout';
import { Check } from 'lucide-react';

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: any) => void;
    };
  }
}

const Pricing = () => {
  useEffect(() => {
    // Load Tally script
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handleGetAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Open Tally popup form
    // Replace 'YOUR_FORM_ID' with your actual Tally form ID
    if (window.Tally) {
      window.Tally.openPopup('YOUR_FORM_ID', {
        width: 540,
        autoClose: 3000,
      });
    } else {
      console.error('Tally.so script not loaded yet');
    }
  };

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Navigation />

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
                onClick={handleGetAccess}
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
    </Layout>
  );
};

export default Pricing;
