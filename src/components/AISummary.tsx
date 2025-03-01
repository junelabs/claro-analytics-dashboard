import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface AISummaryProps {
  className?: string;
  data?: any; // This will be replaced with proper typing once we have the data schema
}

export const AISummary = ({ className, data }: AISummaryProps) => {
  const [summary, setSummary] = useState<string | null>(
    "Your website traffic is up 6% compared to last period. Visitors are spending more time on your product pages, but your checkout abandonment rate has increased. Consider optimizing your checkout flow."
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (data) {
      console.log('Received analytics data for AI processing:', data);
      // In the future, this is where we'll process real data
    }
  }, [data]);

  const generateNewInsight = () => {
    setLoading(true);
    setSummary(null);
    
    // Simulate loading time - will be replaced with actual API call
    setTimeout(() => {
      try {
        // For now, we'll keep using mock insights
        const insights = [
          "Your website traffic is up 6% compared to last period. Visitors are spending more time on your product pages, but your checkout abandonment rate has increased. Consider optimizing your checkout flow.",
          "Mobile visitors convert 15% less than desktop users. Your site loads 2 seconds slower on mobile devices. Improving mobile performance could boost your revenue significantly.",
          "Your most visited product pages aren't generating proportional sales. Visitors view these products but don't add them to cart. Consider reviewing pricing or product descriptions.",
          "Your evening traffic (6-10pm) shows the highest conversion rate. Consider running time-sensitive promotions during these hours to maximize sales.",
          "Returning visitors spend 40% more than first-time visitors. Your loyalty program may be working - consider expanding these incentives."
        ];
        
        setSummary(insights[Math.floor(Math.random() * insights.length)]);
        setLoading(false);
      } catch (error) {
        console.error('Error generating insight:', error);
        toast({
          title: "Error generating insight",
          description: "There was a problem analyzing your data. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        setSummary("Unable to generate insights at this time. Please try again later.");
      }
    }, 1500);
  };

  return (
    <div className={cn("p-5 bg-white rounded-lg border border-gray-100 transition-all duration-300 mb-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-claro-purple mr-2" />
          <h3 className="font-medium text-sm">AI Insights</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8 bg-white hover:bg-gray-50"
          onClick={generateNewInsight}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Generate new insight'}
        </Button>
      </div>
      
      <div 
        className={cn(
          "text-sm text-gray-700 leading-relaxed transition-all duration-300 overflow-hidden", 
          expanded ? "max-h-60" : "max-h-20"
        )}
      >
        {loading ? (
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-11/12"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        ) : (
          summary
        )}
      </div>
      
      {(summary && summary.length > 130) && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs text-claro-purple mt-2 hover:underline focus:outline-none"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};
