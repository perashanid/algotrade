import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, BarChart3, History, TestTube } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Create Constraint',
      description: 'Set up new trading rules',
      icon: Plus,
      href: '/constraints/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Manage Constraints',
      description: 'View and edit existing constraints',
      icon: Settings,
      href: '/constraints',
      color: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600',
    },
    {
      title: 'Analytics',
      description: 'Detailed performance analysis',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Trade History',
      description: 'View past trades and triggers',
      icon: History,
      href: '/trades',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Backtest',
      description: 'Test strategies on historical data',
      icon: TestTube,
      href: '/backtest',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;