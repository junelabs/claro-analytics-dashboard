
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface FilterButtonProps {
  onClick: () => void;
  graphFilters: Record<string, boolean>;
  onFilterChange: (id: string, checked: boolean) => void;
}

export const FilterButton = ({ onClick, graphFilters, onFilterChange }: FilterButtonProps) => {
  const graphs = [
    { id: 'visitorChart', name: 'Visitor Trends' },
    { id: 'abandonment', name: 'Abandonment Analytics' },
    { id: 'location', name: 'Location Analytics' },
    { id: 'pageTime', name: 'Page Time Analytics' },
    { id: 'revenueSources', name: 'Revenue Sources' },
    { id: 'revenueTrends', name: 'Revenue Trends' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            // Prevent dropdown from opening when we want to trigger the filter click
            if (e.altKey || e.ctrlKey || e.metaKey) {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="sr-only">Display Options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel>Display Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {graphs.map((graph) => (
          <DropdownMenuCheckboxItem
            key={graph.id}
            checked={graphFilters[graph.id]}
            onCheckedChange={(checked) => onFilterChange(graph.id, checked)}
          >
            {graph.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
