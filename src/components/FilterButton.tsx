
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface FilterButtonProps {
  onClick: () => void;
}

export const FilterButton = ({ onClick }: FilterButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="bg-white border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <Search className="h-4 w-4 text-gray-500" />
      <span className="sr-only">Filter</span>
    </Button>
  );
};
