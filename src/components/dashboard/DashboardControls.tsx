
import React from 'react';
import { FilterButton } from '@/components/FilterButton';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { CurrentVisitors } from '@/components/CurrentVisitors';

interface DashboardControlsProps {
  siteName: string;
  currentVisitors: number;
  isLiveCount: boolean;
  dateRange: string;
  graphFilters: Record<string, boolean>;
  lastGraphRefresh: string;
  lastVisitorRefresh: string;
  handleDateRangeChange: (newRange: string) => void;
  handleGraphFilterChange: (id: string, checked: boolean) => void;
  manualRefresh: () => void;
}

export const DashboardControls = ({ 
  siteName, 
  currentVisitors, 
  isLiveCount,
  dateRange,
  graphFilters,
  lastGraphRefresh, 
  lastVisitorRefresh,
  handleDateRangeChange,
  handleGraphFilterChange,
  manualRefresh
}: DashboardControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2 items-center">
        <div className="text-sm font-medium text-gray-600">{siteName}</div>
        <CurrentVisitors 
          count={currentVisitors} 
          siteName={siteName} 
          isLive={isLiveCount} 
          autoRefresh={true} 
        />
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-xs text-gray-500">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={manualRefresh} 
            className="text-xs flex items-center"
          >
            <span className="mr-1">↻</span> Refresh
          </Button>
          <div className="text-[10px] text-right">
            <div>Graphs: {lastGraphRefresh}</div>
            <div>Visitors: {lastVisitorRefresh}</div>
          </div>
        </div>
        <FilterButton 
          onClick={() => {}}
          graphFilters={graphFilters}
          onFilterChange={handleGraphFilterChange}
        />
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>
    </div>
  );
};
