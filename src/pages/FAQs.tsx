import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Menu, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const faqs = [
    {
      question: "What is Claro?",
      answer: "Claro is an analytics platform designed specifically for ecommerce businesses. It helps you track visitor behavior, understand customer journeys, and optimize your marketing efforts with easy-to-understand insights."
    },
    {
      question: "How do I get started with Claro?",
      answer: "Getting started is simple! Sign up for an account, add our tracking script to your website, and you'll start receiving analytics data immediately. Our dashboard will show you insights about your visitors and their behavior."
    },
    {
      question: "Is Claro GDPR and CCPA compliant?",
      answer: "Yes, Claro is designed with privacy regulations in mind. We help you collect analytics data in a way that respects user privacy and complies with major regulations like GDPR and CCPA."
    },
    {
      question: "How is Claro different from Google Analytics?",
      answer: "Unlike Google Analytics, Claro is specifically built for ecommerce businesses. We focus on metrics that matter for online stores and provide actionable insights without the complexity. Our interface is intuitive and our reports are designed to help you make better marketing decisions."
    },
    {
      question: "Do I need to be a technical person to use Claro?",
      answer: "Not at all! Claro is designed to be user-friendly for everyone, regardless of technical background. Adding our tracking script is simple, and our dashboard presents information in an easy-to-understand way."
    },
    {
      question: "What pricing plans do you offer?",
      answer: "We offer a range of pricing plans to suit businesses of all sizes, from startups to enterprise. Visit our pricing page to see detailed information about our plans and features."
    }
  ];

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
              <Link to="/faqs" className="text-indigo-600 font-medium">FAQs</Link>
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
            <button 
              onClick={toggleMobileMenu} 
              className="p-2 flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
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
                className="text-indigo-600 font-medium text-lg"
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
          <h1 className="text-4xl font-bold mb-10 text-center">Frequently Asked Questions</h1>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-16 mb-8">
            <p className="text-gray-700 mb-4">Still have questions?</p>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
