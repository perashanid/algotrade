import React from 'react';
import { Users, Tag, Target } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'individual' | 'groups' | 'stock-groups';
  setViewMode: (mode: 'individual' | 'groups' | 'stock-groups') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => setViewMode('groups')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'groups'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <Users className="h-4 w-4 inline mr-1" />
        Constraints
      </button>
      <button
        onClick={() => setViewMode('stock-groups')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'stock-groups'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <Tag className="h-4 w-4 inline mr-1" />
        Stock Groups
      </button>
      <button
        onClick={() => setViewMode('individual')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'individual'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <Target className="h-4 w-4 inline mr-1" />
        Legacy
      </button>
    </div>
  );
};

export default ViewModeToggle;