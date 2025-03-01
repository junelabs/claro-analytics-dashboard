
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { CurrentVisitors } from '@/components/CurrentVisitors';
import { DateRangePicker } from '@/components/DateRangePicker';
import { FilterButton } from '@/components/FilterButton';
import { StatCard } from '@/components/StatCard';
import { VisitorChart } from '@/components/VisitorChart';
import { AISummary } from '@/components/AISummary';

const Index = () => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [scriptCopied, setScriptCopied] = useState(false);

  const handleFilterClick = () => {
    toast('Filter functionality coming soon!', {
      description: 'Advanced filtering options will be available in the next update.',
      action: {
        label: 'Dismiss',
        onClick: () => console.log('Dismissed'),
      },
    });
  };

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    toast.success(`Date range changed to ${newRange}`);
  };

  const copyTrackingScript = () => {
    const script = `<script src="https://claro.so/tracker.js" data-site-id="YOUR-SITE-ID" defer></script>`;
    navigator.clipboard.writeText(script);
    setScriptCopied(true);
    toast.success('Tracking script copied to clipboard!', {
      description: 'Paste this in the <head> section of your website.',
    });
    
    setTimeout(() => setScriptCopied(false), 3000);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <Header />
          <button
            onClick={copyTrackingScript}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              scriptCopied
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-claro-purple text-white hover:bg-claro-light-purple'
            }`}
          >
            {scriptCopied ? 'Copied!' : 'Get Tracking Script'}
          </button>
        </div>

        <div className="flex flex-col space-y-6">
          <AISummary />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">claro.so</div>
              <CurrentVisitors count={129} />
            </div>
            <div className="flex items-center space-x-3">
              <FilterButton onClick={handleFilterClick} />
              <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            <StatCard
              title="Unique Visitors"
              value="283k"
              change={{ value: "6%", trend: "up" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Total Visits"
              value="496k"
              change={{ value: "6%", trend: "up" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Total Pageviews"
              value="1.5M"
              change={{ value: "14%", trend: "up" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Views Per Visit"
              value="3.11"
              change={{ value: "9%", trend: "down" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Bounce Rate"
              value="47%"
              change={{ value: "2%", trend: "up" }}
              className="lg:col-span-1"
            />
            <StatCard
              title="Visit Duration"
              value="5m 46s"
              change={{ value: "3%", trend: "up" }}
              className="lg:col-span-1"
            />
          </div>

          <div className="flex justify-end">
            <div className="text-sm font-medium text-gray-500">Days</div>
          </div>

          <VisitorChart timeRange={dateRange} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
