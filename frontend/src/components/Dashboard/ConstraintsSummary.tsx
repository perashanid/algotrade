import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Tag, Power, PowerOff, TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';
import { constraintGroupsService } from '../../services/constraintGroups';
import { constraintsService } from '../../services/constraints';
import { ConstraintGroup, TradingConstraint } from '../../types';

const ConstraintsSummary: React.FC = () => {
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [constraints, setConstraints] = useState<TradingConstraint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConstraints();
  }, []);

  const loadConstraints = async () => {
    try {
      setLoading(true);
      const [groupsData, constraintsData] = await Promise.all([
        constraintGroupsService.getConstraintGroups(),
        constraintsService.getConstraints()
      ]);
      setConstraintGroups(groupsData);
      setConstraints(constraintsData);
    } catch (error) {
      console.error('Failed to load constraints:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeGroups = constraintGroups.filter(g => g.isActive);
  const activeConstraints = constraints.filter(c => c.isActive);
  const totalActive = activeGroups.length + activeConstraints.length;
  const totalConstraints = constraintGroups.length + constraints.length;

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Trading Constraints</h3>
        <Link
          to="/constraints"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {totalConstraints === 0 ? (
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 text-sm mb-3">No constraints set up yet</p>
          <Link
            to="/constraints"
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Constraint
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalActive}</div>
              <div className="text-sm text-green-700">Active</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{totalConstraints}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>

          {/* Recent Constraint Groups */}
          {constraintGroups.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Constraint Groups ({constraintGroups.length})
              </h4>
              <div className="space-y-2">
                {constraintGroups.slice(0, 3).map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${group.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900 truncate">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          {formatPercent(group.buyTriggerPercent)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
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
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      +{constraintGroups.length - 3} more groups
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Individual Constraints */}
          {constraints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Individual Constraints ({constraints.length})
              </h4>
              <div className="space-y-2">
                {constraints.slice(0, 2).map((constraint) => (
                  <div key={constraint.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${constraint.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">{constraint.stockSymbol}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          {formatPercent(constraint.buyTriggerPercent)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {formatPercent(constraint.sellTriggerPercent)}
                        </span>
                        <span>{formatCurrency(constraint.buyAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {constraints.length > 2 && (
                  <div className="text-center">
                    <Link
                      to="/constraints"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      +{constraints.length - 2} more constraints
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Action */}
          <div className="pt-3 border-t border-gray-200">
            <Link
              to="/constraints"
              className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Constraint
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstraintsSummary;