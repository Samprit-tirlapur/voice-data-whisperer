
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Home, Database, LogOut } from 'lucide-react';

interface HeaderProps {
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center">
          <span className="text-white font-bold">VW</span>
        </div>
        <h1 className="text-xl font-bold">Voice Data Whisperer</h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/database">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Database
            </Button>
          </Link>
          <div className="mx-2 h-6 border-l border-border"></div>
          <div className="text-sm mr-2">
            Welcome, {user.name}
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            Theme
          </Button>
        </div>
      )}

      {!user && (
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          Toggle Theme
        </Button>
      )}
    </header>
  );
};

export default Header;
