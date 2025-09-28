import React from 'react';
import { ChevronDown, ChevronRight, Users, Activity } from 'lucide-react';
import { ConstraintGroup } from '../../../types';

interface GroupHeaderProps {
  group: ConstraintGroup;
  isExpanded: boolean;
  activePositions: number;
  totalStocks: number;
  onToggleExpansion: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  isExpanded,
  activePositions,
  totalStocks,
  onToggleExpansion
}) => {
  return (
    <div className="flex items-center gap-3 mb-3">
      <button
        onClick={onToggleExpansion}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title={isExpanded ? "Collapse group" : "Expand group"}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {group.name}
        </h3>
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {group.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          group.isActive
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}>
          {group.isActive ? 'Active' : 'Inactive'}
        </span>
        
        {activePositions > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <Activity className="h-3 w-3 mr-1" />
            {activePositions} positions
          </span>
        )}
        
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalStocks} stocks
        </span>
      </div>
    </div>
  );
};

export default GroupHeader;