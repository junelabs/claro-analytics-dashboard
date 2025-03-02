
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartData {
  date: string;
  visitors: number;
}

interface VisitorChartProps {
  timeRange: string;
  analyticsData?: any; // Accept analytics data from parent
}

export const VisitorChart = ({ timeRange, analyticsData }: VisitorChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Process real analytics data if available, otherwise use mock data
    setLoading(true);
    
    setTimeout(() => {
      let newData: ChartData[] = [];
      
      if (analyticsData?.rawData && analyticsData.rawData.length > 0) {
        console.log('Using real analytics data for chart');
        
        // Group data by date
        const dateGroups: Record<string, number> = {};
        
        analyticsData.rawData.forEach((item: any) => {
          // Extract date from timestamp
          const date = new Date(item.timestamp || item.created_at);
          const dateKey = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
          
          // Count visitors per date
          if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = 0;
          }
          dateGroups[dateKey]++;
        });
        
        // Convert to chart data format
        newData = Object.entries(dateGroups)
          .map(([date, visitors]) => ({ date, visitors }))
          .sort((a, b) => {
            // Sort by date (parse the date like "15 Jun")
            const [dayA, monthA] = a.date.split(' ');
            const [dayB, monthB] = b.date.split(' ');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const monthIndexA = months.indexOf(monthA);
            const monthIndexB = months.indexOf(monthB);
            
            if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
            return parseInt(dayA) - parseInt(dayB);
          });
      } else {
        console.log('Using mock data for chart');
        // Fallback to mock data when no real data is available
        newData = generateMockData();
      }
      
      setData(newData);
      setLoading(false);
    }, 500);
  }, [timeRange, analyticsData]);

  useEffect(() => {
    if (!loading && data.length > 0) {
      // Animate the data loading
      const tempData: ChartData[] = [];
      const interval = setInterval(() => {
        if (tempData.length < data.length) {
          tempData.push(data[tempData.length]);
          setAnimatedData([...tempData]);
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [loading, data]);

  // Generate mock data when real data is not available
  const generateMockData = () => {
    const data: ChartData[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const baseVisitors = analyticsData?.pageViews ? Math.max(analyticsData.pageViews / 10, 10) : 100;
    
    for (let i = 1; i <= 10; i++) {
      const month = months[Math.floor(Math.random() * months.length)];
      let visitors = Math.floor(baseVisitors + Math.random() * baseVisitors * 0.5);
      
      data.push({
        date: `${i} ${month}`,
        visitors,
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="chart-container animate-pulse h-[300px] flex items-center justify-center">
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="chart-container animate-fade-in h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={animatedData.length > 0 ? animatedData : data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7B68EE" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7B68EE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 1000', 'dataMax + 1000']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              padding: '8px 12px'
            }}
            itemStyle={{ color: '#7B68EE' }}
            formatter={(value: number) => [`${value.toLocaleString()} visitors`, 'Visitors']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            stroke="#7B68EE" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisitors)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
