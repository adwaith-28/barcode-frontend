import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Home, File, Library, Plus } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-md flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">CloudLabel</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button
            variant={isActiveLink('/') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>

          <Button
            variant={isActiveLink('/templates') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/templates" className="flex items-center space-x-2">
              <Library className="h-4 w-4" />
              <span>Templates</span>
            </Link>
          </Button>

          <Button
            variant={location.pathname.startsWith('/designer') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/designer" className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span>Designer</span>
            </Link>
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:flex"
          >
            <Link to="/designer">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Link>
          </Button>

          <Button
            variant="default"
            size="sm"
            asChild
            className="bg-gradient-primary hover:opacity-90 border-0"
          >
            <Link to="/templates">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;