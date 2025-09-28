import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  History, 
  TestTube,
  TrendingUp
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Constraints',
      href: '/app/constraints',
      icon: Settings,
    },
    {
      name: 'Analytics',
      href: '/app/analytics',
      icon: BarChart3,
    },
    {
      name: 'Trade History',
      href: '/app/trades',
      icon: History,
    },
    {
      name: 'Backtest',
      href: '/app/backtest',
      icon: TestTube,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-brand-900 shadow-sm border-r border-brand-100 dark:border-brand-800 pt-16 transition-colors duration-200">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-700 text-brand-700 dark:text-white border-r-2 border-brand-700 dark:border-brand-400 shadow-md'
                      : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-brand-800'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-brand-800">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Algorithmic Trading Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;