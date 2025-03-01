
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

// Sample data for demonstration - this would be replaced with real data
const generateMockData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const baseVisitors = 8000;
  
  for (let i = 30; i <= 30 + 28; i += 3) {
    const month = months[Math.floor(Math.random() * months.length)];
    let visitors = baseVisitors + Math.floor(Math.random() * 6000);
    
    // Create pattern with alternating high and low periods
    if (i % 12 < 6) {
      visitors = baseVisitors + Math.floor(Math.random() * 3000);
    }

    data.push({
      date: `${i % 31} ${month}`,
      visitors,
    });
  }
  
  return data;
};

interface ChartData {
  date: string;
  visitors: number;
}

interface VisitorChartProps {
  timeRange: string;
}

export const VisitorChart = ({ timeRange }: VisitorChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Simulate data loading based on time range
    setLoading(true);
    
    const timer = setTimeout(() => {
      const newData = generateMockData();
      setData(newData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [timeRange]);

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
