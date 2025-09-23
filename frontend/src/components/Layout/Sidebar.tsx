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
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Constraints',
      href: '/constraints',
      icon: Settings,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Trade History',
      href: '/trades',
      icon: History,
    },
    {
      name: 'Backtest',
      href: '/backtest',
      icon: TestTube,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 pt-16 transition-colors duration-200">
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
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Algorithmic Trading Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;