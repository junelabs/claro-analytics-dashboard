
import React from 'react';
import { StatCard } from '@/components/StatCard';
import { Users, Eye, Timer, MousePointer, TrendingUp, BarChart3, Activity, Sparkles } from 'lucide-react';

interface StatsOverviewProps {
  analyticsData: any;
}

export const StatsOverview = ({ analyticsData }: StatsOverviewProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Unique Visitors"
          value={analyticsData?.uniqueVisitors ? `${analyticsData.uniqueVisitors}` : "0"}
          change={{ value: "0%", trend: "neutral" }}
          icon={<Users className="h-4 w-4" />}
          description="Total unique users visiting your site"
        />
        <StatCard
          title="Page Views"
          value={analyticsData?.pageViews ? `${analyticsData.pageViews}` : "0"}
          change={{ value: "0%", trend: "neutral" }}
          icon={<Eye className="h-4 w-4" />}
          description="Total pages viewed across all visits"
        />
        <StatCard
          title="Avg. Time on Page"
          value="2m 34s"
          change={{ value: "0%", trend: "neutral" }}
          icon={<Timer className="h-4 w-4" />}
          description="Average time spent on each page"
        />
        <StatCard
          title="Bounce Rate"
          value="42%"
          change={{ value: "0%", trend: "neutral" }}
          icon={<MousePointer className="h-4 w-4" />}
          description="Percentage of single-page visits"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          change={{ value: "+0.5%", trend: "up" }}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Visitors who completed desired actions"
        />
        <StatCard
          title="Revenue"
          value="$1,245"
          change={{ value: "+12%", trend: "up" }}
          icon={<BarChart3 className="h-4 w-4" />}
          description="Total revenue from all sources"
        />
        <StatCard
          title="Avg. Order Value"
          value="$68.50"
          change={{ value: "+3%", trend: "up" }}
          icon={<Activity className="h-4 w-4" />}
          description="Average value of each order"
        />
        <StatCard
          title="AI Insights"
          value="7 new"
          icon={<Sparkles className="h-4 w-4" />}
          description="AI-powered recommendations for your store"
        />
      </div>
    </>
  );
};
