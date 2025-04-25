
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme }) => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center">
          <span className="text-white font-bold">VW</span>
        </div>
        <h1 className="text-xl font-bold">Voice Data Whisperer</h1>
      </div>
      <Button variant="outline" size="sm" onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </header>
  );
};

export default Header;
