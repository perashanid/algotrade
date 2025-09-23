import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Tag, TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';
import { constraintGroupsService } from '../../services/constraintGroups';
import { ConstraintGroup } from '../../types';

const ConstraintsSummary: React.FC = () => {
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConstraints();
  }, []);

  const loadConstraints = async () => {
    try {
      setLoading(true);
      const groupsData = await constraintGroupsService.getConstraintGroups();
      setConstraintGroups(groupsData);
    } catch (error) {
      console.error('Failed to load constraint groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeGroups = constraintGroups.filter(g => g.isActive);
  const totalActive = activeGroups.length;
  const totalConstraints = constraintGroups.length;

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Constraint Groups</h3>
        <Link
          to="/constraints"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {totalConstraints === 0 ? (
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">No constraint groups set up yet</p>
          <Link
            to="/constraints"
            className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Constraint Group
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActive}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Active</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{totalConstraints}</div>
              <div className="text-sm text-gray-700 dark:text-gray-400">Total</div>
            </div>
          </div>

          {/* Constraint Groups */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Constraint Groups ({constraintGroups.length})
            </h4>
            <div className="space-y-2">
              {constraintGroups.slice(0, 3).map((group) => (
                <div key={group.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${group.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500 dark:text-red-400" />
                        {formatPercent(group.buyTriggerPercent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
                        {formatPercent(group.sellTriggerPercent)}
                      </span>
                      <span>{group.stocks.length + group.stockGroups.length} items</span>
                    </div>
                  </div>
                </div>
              ))}
              {constraintGroups.length > 3 && (
                <div className="text-center">
                  <Link
                    to="/constraints"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    +{constraintGroups.length - 3} more groups
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/constraints"
              className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Constraint Group
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstraintsSummary;