import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { Users, TrendingUp, TrendingDown, Target, Plus, Activity, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { constraintPositionsService } from '../../services/constraintPositions';
import { constraintGroupsService } from '../../services/constraintGroups';
import toast from 'react-hot-toast';

const ConstraintsSummary: React.FC = () => {
  const queryClient = useQueryClient();
  const [loadingActions, setLoadingActions] = React.useState<Set<string>>(new Set());
  
  const {
    data: processedGroups = [],
    isLoading: loading,
    error
  } = useQuery(
    'constraint-positions',
    constraintPositionsService.getProcessedGroupData,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  const setActionLoading = (actionId: string, isLoading: boolean) => {
    setLoadingActions(prev => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(actionId);
      } else {
        newSet.delete(actionId);
      }
      return newSet;
    });
  };

  const handleToggleGroup = async (groupId: string, isActive: boolean) => {
    const actionId = `toggle-${groupId}`;
    setActionLoading(actionId, true);
    
    try {
      console.log('Toggling constraint group from dashboard:', { groupId, isActive });
      await constraintGroupsService.toggleConstraintGroup(groupId, !isActive);
      toast.success(`Constraint group ${!isActive ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries('constraint-positions');
    } catch (error) {
      console.error('Toggle constraint group error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint group');
    } finally {
      setActionLoading(actionId, false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"?`)) {
      return;
    }

    const actionId = `delete-${groupId}`;
    setActionLoading(actionId, true);

    try {
      console.log('Deleting constraint group from dashboard:', { groupId, groupName });
      await constraintGroupsService.deleteConstraintGroup(groupId);
      toast.success('Constraint group deleted successfully');
      queryClient.invalidateQueries('constraint-positions');
    } catch (error) {
      console.error('Delete constraint group error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint group');
    } finally {
      setActionLoading(actionId, false);
    }
  };

  if (error) {
    console.error('Failed to load constraint groups:', error);
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
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mb-3">Failed to load constraint groups</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeGroups = processedGroups.filter(g => g.group.isActive);
  const totalActive = activeGroups.length;
  const totalConstraints = processedGroups.length;
  const totalStocks = processedGroups.reduce((sum, group) => sum + group.allStocks.length, 0);
  const totalPositions = processedGroups.reduce((sum, group) => sum + group.activePositions, 0);

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
          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{totalActive}</div>
              <div className="text-xs text-green-700 dark:text-green-300">Active Groups</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalStocks}</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Total Stocks</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalPositions}</div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Active Positions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-xl font-bold text-gray-600 dark:text-gray-300">{totalConstraints}</div>
              <div className="text-xs text-gray-700 dark:text-gray-400">Total Groups</div>
            </div>
          </div>

          {/* Enhanced Constraint Groups Display */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Constraint Groups ({processedGroups.length})
            </h4>
            <div className="space-y-2">
              {processedGroups.slice(0, 3).map((groupData) => (
                <div key={groupData.group.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${groupData.group.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{groupData.group.name}</span>
                      {groupData.activePositions > 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded">
                          {groupData.activePositions} pos
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1">
                      <Link
                        to="/constraints"
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Edit group"
                      >
                        <Edit className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleToggleGroup(groupData.group.id, groupData.group.isActive)}
                        disabled={loadingActions.has(`toggle-${groupData.group.id}`)}
                        className={`p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${groupData.group.isActive
                          ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={groupData.group.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {loadingActions.has(`toggle-${groupData.group.id}`) ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : groupData.group.isActive ? (
                          <Power className="h-3 w-3" />
                        ) : (
                          <PowerOff className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(groupData.group.id, groupData.group.name)}
                        disabled={loadingActions.has(`delete-${groupData.group.id}`)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete group"
                      >
                        {loadingActions.has(`delete-${groupData.group.id}`) ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500 dark:text-red-400" />
                      {formatPercent(groupData.group.buyTriggerPercent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
                      {formatPercent(groupData.group.sellTriggerPercent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                      {groupData.allStocks.length} stocks
                    </span>
                  </div>
                  
                  {/* Show first few stocks */}
                  {groupData.allStocks.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {groupData.allStocks.slice(0, 3).join(', ')}
                      {groupData.allStocks.length > 3 && ` +${groupData.allStocks.length - 3} more`}
                    </div>
                  )}
                </div>
              ))}
              {processedGroups.length > 3 && (
                <div className="text-center">
                  <Link
                    to="/constraints"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    +{processedGroups.length - 3} more groups
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