import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="bg-white/80 dark:bg-brand-900/80 backdrop-blur-lg shadow-sm border-b border-brand-100 dark:border-brand-800 fixed w-full top-0 z-50 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={handleLogoClick}
                className="text-xl font-bold text-gray-900 dark:text-white hover:from-brand-500 hover:to-brand-400 dark:hover:from-brand-50 dark:hover:to-brand-100 transition-all cursor-pointer"
                aria-label="Go to dashboard"
                role="button"
              >
                AlgoTrader
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-100 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.email}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-brand-100 rounded-lg hover:bg-gray-100 dark:hover:bg-brand-800 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;