
import React from 'react';
import { Circle } from 'lucide-react';

export const Header = () => {
  return (
    <div className="flex items-center">
      <Circle className="h-8 w-8 text-claro-purple mr-2 fill-claro-purple" />
      <h1 className="text-2xl font-semibold tracking-tight">Claro</h1>
    </div>
  );
};
