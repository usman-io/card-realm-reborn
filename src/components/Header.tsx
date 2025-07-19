
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import logo from '@/assets/images/logo.png';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cards?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-brand-blue">
              <img src={logo} alt="Logo" className="w-16 h-16" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/dashboard" className="text-gray-700 hover:text-brand-dark-blue/80 px-3 py-2 text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/sets" className="text-gray-700 hover:text-brand-dark-blue/80 px-3 py-2 text-sm font-medium transition-colors">
              Sets
            </Link>
            <Link to="/cards" className="text-gray-700 hover:text-brand-dark-blue/80 px-3 py-2 text-sm font-medium transition-colors">
              Cards
            </Link>
            <Link to="/dashboard/premium" className="text-brand-gold hover:text-brand-purple px-3 py-2 text-sm font-medium font-semibold transition-colors">
              Premium
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-brand-dark-blue/20 focus:border-brand-dark-blue"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 bg-brand-dark-blue hover:bg-brand-dark-blue/80"
                variant="default"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-brand-blue text-brand-dark-blue hover:bg-brand-dark-blue/80 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-brand-dark-blue/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 border-brand-dark-blue/20 focus:border-brand-dark-blue"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-brand-dark-blue hover:bg-brand-dark-blue/80"
                    variant="default"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-dark-blue/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/sets"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-dark-blue/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sets
              </Link>
              <Link
                to="/cards"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-dark-blue/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cards
              </Link>
              <Link
                to="/dashboard/premium"
                className="block px-3 py-2 text-base font-medium text-brand-gold hover:text-brand-purple font-semibold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Premium
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
