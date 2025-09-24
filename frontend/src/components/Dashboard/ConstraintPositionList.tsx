import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, Plus, Edit, Save, X, ChevronDown, ChevronRight, Search, Tag, Power, PowerOff, UserPlus, UserMinus } from 'lucide-react';
import DeleteButton from '../Common/DeleteButton';
import EditTriggersModal from '../Common/EditTriggersModal';
import { constraintPositionsService } from '../../services/constraintPositions';
import { constraintGroupsService } from '../../services/constraintGroups';
import { ConstraintPosition, ConstraintGroup, GroupDisplayData, StockTriggers, GroupUIState } from '../../types';
import { getStockInfo } from '../../data/stockDatabase';
import StockSearchInput from '../Common/StockSearchInput';
import toast from 'react-hot-toast';

const ConstraintPositionList: React.FC = () => {
  const [groupDisplayData, setGroupDisplayData] = useState<GroupDisplayData[]>([]);
  const [individualConstraints, setIndividualConstraints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStockSymbol, setNewStockSymbol] = useState('');
  
  // UI State management
  const [uiState, setUIState] = useState<GroupUIState>({
    expandedGroups: new Set(),
    editingGroup: null,
    editingStock: null,
    addingStockToGroup: null,
    editValues: {
      buyAmount: 0,
      sellAmount: 0,
      buyTriggerPercent: 0,
      sellTriggerPercent: 0
    }
  });

  // Add state for stock editing similar to the working constraints page
  const [editingStockData, setEditingStockData] = useState<{
    stock: any;
    groupId: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { constraintsService } = await import('../../services/constraints');
      const [groupsData, individualConstraintsData] = await Promise.all([
        constraintPositionsService.getGroupDisplayData(),
        constraintsService.getConstraints()
      ]);
      
      // Debug: Log the loaded data
      console.log('Loaded group data:', groupsData);
      console.log('Groups with stocks:', groupsData.map(g => ({ 
        groupName: g.group.name, 
        stocks: g.stocks.map(s => ({ symbol: s.symbol, hasPosition: !!s.position }))
      })));
      
      // Ensure data is always arrays
      setGroupDisplayData(Array.isArray(groupsData) ? groupsData : []);
      setIndividualConstraints(Array.isArray(individualConstraintsData) ? individualConstraintsData : []);

      // Expand all groups by default
      const allGroupIds = new Set(groupsData.map(group => group.group.id));
      setUIState(prev => ({
        ...prev,
        expandedGroups: allGroupIds
      }));
    } catch (error) {
      toast.error('Failed to load constraint data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setUIState(prev => {
      const newExpandedGroups = new Set(prev.expandedGroups);
      if (newExpandedGroups.has(groupId)) {
        newExpandedGroups.delete(groupId);
      } else {
        newExpandedGroups.add(groupId);
      }
      return {
        ...prev,
        expandedGroups: newExpandedGroups
      };
    });
  };

  const handleEditGroup = (group: ConstraintGroup) => {
    setUIState(prev => ({
      ...prev,
      editingGroup: group.id,
      editValues: {
        buyTriggerPercent: group.buyTriggerPercent,
        sellTriggerPercent: group.sellTriggerPercent,
        profitTriggerPercent: group.profitTriggerPercent,
        buyAmount: group.buyAmount,
        sellAmount: group.sellAmount
      }
    }));
  };

  const handleEditStock = (groupId: string, stockData: any, group: ConstraintGroup) => {
    console.log('handleEditStock called with:', { groupId, stockSymbol: stockData.symbol, groupName: group.name });
    
    // Validate that stockSymbol is actually a stock symbol (not a numeric ID)
    if (!stockData.symbol || /^\d+$/.test(stockData.symbol)) {
      console.error('Invalid stock symbol passed to handleEditStock:', stockData.symbol);
      toast.error('Invalid stock symbol. Please refresh the page and try again.');
      return;
    }
    
    // Use the new approach similar to the working constraints page
    setEditingStockData({
      stock: stockData,
      groupId: groupId
    });
  };

  const [editingIndividual, setEditingIndividual] = useState<string | null>(null);

  const handleEditIndividual = (constraint: any) => {
    setEditingIndividual(constraint.id);
    setUIState(prev => ({
      ...prev,
      editValues: {
        buyTriggerPercent: constraint.buyTriggerPercent,
        sellTriggerPercent: constraint.sellTriggerPercent,
        profitTriggerPercent: constraint.profitTriggerPercent,
        buyAmount: constraint.buyAmount,
        sellAmount: constraint.sellAmount
      }
    }));
  };

  // Handle stock editing using the same approach as the working constraints page
  const handleEditStockData = async (values: any) => {
    if (!editingStockData) return;
    
    try {
      console.log('Updating stock constraint:', { 
        groupId: editingStockData.groupId, 
        stockSymbol: editingStockData.stock.symbol, 
        values 
      });

      await constraintGroupsService.updateStockConstraint(
        editingStockData.groupId, 
        editingStockData.stock.symbol, 
        values
      );
      
      toast.success(`Updated triggers for ${editingStockData.stock.symbol}`);
      setEditingStockData(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stock triggers');
      throw error;
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (uiState.editingGroup) {
        await constraintGroupsService.updateConstraintGroup(uiState.editingGroup, uiState.editValues);
        toast.success('Constraint group updated successfully!');
        setUIState(prev => ({ ...prev, editingGroup: null }));
        await loadData();
      } else if (editingIndividual) {
        // For individual constraint editing
        const { constraintsService } = await import('../../services/constraints');
        await constraintsService.updateConstraint(editingIndividual, uiState.editValues);
        toast.success('Individual constraint updated successfully!');
        setEditingIndividual(null);
        await loadData();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint');
    }
  };

  const handleCancelEdit = () => {
    setUIState(prev => ({
      ...prev,
      editingGroup: null,
      editingStock: null,
      editValues: {
        buyAmount: 0,
        sellAmount: 0,
        buyTriggerPercent: 0,
        sellTriggerPercent: 0
      }
    }));
    setEditingIndividual(null);
    setEditingStockData(null);
  };

  // Helper function to update edit values
  const updateEditValues = (updates: Partial<StockTriggers>) => {
    setUIState(prev => ({
      ...prev,
      editValues: { ...prev.editValues, ...updates }
    }));
  };

  const handleToggleConstraintGroup = async (groupId: string, isActive: boolean) => {
    try {
      await constraintGroupsService.updateConstraintGroup(groupId, { isActive: !isActive });
      toast.success(`Constraint group ${!isActive ? 'activated' : 'deactivated'}`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint group');
    }
  };

  const handleToggleIndividualConstraint = async (constraintId: string, isActive: boolean) => {
    try {
      const { constraintsService } = await import('../../services/constraints');
      await constraintsService.toggleConstraint(constraintId, !isActive);
      toast.success(`Constraint ${!isActive ? 'activated' : 'deactivated'}`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint');
    }
  };

  const handleDeleteConstraintGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete the constraint group "${groupName}"? This action cannot be undone.`)) {
      try {
        await constraintGroupsService.deleteConstraintGroup(groupId);
        toast.success('Constraint group deleted successfully!');
        await loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete constraint group');
      }
    }
  };

  const handleDeleteIndividualConstraint = async (constraintId: string, stockSymbol: string) => {
    if (window.confirm(`Are you sure you want to delete the constraint for ${stockSymbol}? This action cannot be undone.`)) {
      try {
        const { constraintsService } = await import('../../services/constraints');
        await constraintsService.deleteConstraint(constraintId);
        toast.success('Constraint deleted successfully!');
        await loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete constraint');
      }
    }
  };

  const handleAddStockToGroup = async (groupId: string, stockSymbol: string) => {
    if (!stockSymbol.trim()) {
      toast.error('Please select a stock symbol');
      return;
    }

    try {
      await constraintGroupsService.addStockToGroup(groupId, stockSymbol.trim());
      toast.success(`${stockSymbol} added to group successfully!`);
      setUIState(prev => ({ ...prev, addingStockToGroup: null }));
      setNewStockSymbol('');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add stock to group');
    }
  };

  const handleRemoveStockFromGroup = async (groupId: string, stockSymbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${stockSymbol} from this group?`)) {
      try {
        await constraintGroupsService.removeStockFromGroup(groupId, stockSymbol);
        toast.success(`${stockSymbol} removed from group successfully!`);
        await loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove stock from group');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Ensure arrays are safe to use
  const safeGroupDisplayData = Array.isArray(groupDisplayData) ? groupDisplayData : [];
  const safeIndividualConstraints = Array.isArray(individualConstraints) ? individualConstraints : [];

  // Calculate summary statistics from group display data
  const positionCount = safeGroupDisplayData.reduce((sum, group) => sum + group.activePositions, 0) + 
                       safeIndividualConstraints.filter(c => c.isActive).length;
  const totalConstraints = safeGroupDisplayData.length + safeIndividualConstraints.length;
  const totalValue = safeGroupDisplayData.reduce((sum, group) => sum + group.totalValue, 0);
  const totalStocks = safeGroupDisplayData.reduce((sum, group) => sum + group.stocks.length, 0) + safeIndividualConstraints.length;

  // Filter constraint groups based on search term
  const filteredGroupDisplayData = safeGroupDisplayData.filter(groupData => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      groupData.group.name.toLowerCase().includes(searchLower) ||
      groupData.stocks.some(stock => stock.symbol.toLowerCase().includes(searchLower))
    );
  });

  // Get stocks that match search term for a group
  const getMatchingStocks = (groupData: GroupDisplayData) => {
    const safeStocks = Array.isArray(groupData.stocks) ? groupData.stocks : [];
    if (!searchTerm) return safeStocks;
    return safeStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (groupDisplayData.length === 0 && individualConstraints.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Constraints</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create constraints to start monitoring stocks and building positions automatically.
          </p>
          <Link
            to="/constraints"
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Constraints
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Constraints</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            All constraints and their current positions
          </p>
        </div>
        <Link
          to="/constraints"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          Manage Constraints
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search constraints or stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{totalConstraints}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Total Constraints</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{totalStocks}</div>
          <div className="text-sm text-purple-700 dark:text-purple-300">Total Stocks</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">{positionCount}</div>
          <div className="text-sm text-green-700 dark:text-green-300">Active Positions</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-700 dark:text-gray-400">Total Value</div>
        </div>
      </div>

      {/* Constraint Groups List */}
      <div className="space-y-3">
        {filteredGroupDisplayData.map((groupData) => (
          <div key={groupData.group.id} className="card border border-blue-200 dark:border-blue-800">
            {/* Group Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {/* Only show dropdown button if there are multiple stocks */}
                  {groupData.stocks.length > 1 && (
                    <button
                      onClick={() => toggleGroupExpansion(groupData.group.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {uiState.expandedGroups.has(groupData.group.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                  )}
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{groupData.group.name}</h3>
                  
                  {/* For single stock, show the stock name directly */}
                  {groupData.stocks.length === 1 && (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {groupData.stocks[0].symbol}
                    </span>
                  )}
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${groupData.group.isActive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                    {groupData.group.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {/* Only show stock count badge for multiple stocks */}
                  {groupData.stocks.length > 1 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                      {groupData.stocks.length} stocks
                    </span>
                  )}
                  
                  {groupData.activePositions > 0 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                      {groupData.activePositions} positions
                    </span>
                  )}
                </div>

                {/* Group Constraints Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {uiState.editingGroup === groupData.group.id ? (
                    <>
                      {/* Editable Buy Trigger */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={uiState.editValues.buyTriggerPercent}
                              onChange={(e) => updateEditValues({ buyTriggerPercent: parseFloat(e.target.value) })}
                              className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                            <input
                              type="number"
                              value={uiState.editValues.buyAmount}
                              onChange={(e) => updateEditValues({ buyAmount: parseFloat(e.target.value) })}
                              className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Editable Sell Trigger */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={uiState.editValues.sellTriggerPercent}
                              onChange={(e) => updateEditValues({ sellTriggerPercent: parseFloat(e.target.value) })}
                              className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                            <input
                              type="number"
                              value={uiState.editValues.sellAmount}
                              onChange={(e) => updateEditValues({ sellAmount: parseFloat(e.target.value) })}
                              className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Editable Profit Target */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={uiState.editValues.profitTriggerPercent || ''}
                              onChange={(e) => updateEditValues({ profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                              className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="0.1"
                              placeholder="15"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Display-only triggers */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatPercent(groupData.group.buyTriggerPercent)} ({formatCurrency(groupData.group.buyAmount)})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatPercent(groupData.group.sellTriggerPercent)} ({formatCurrency(groupData.group.sellAmount)})
                          </p>
                        </div>
                      </div>

                      {groupData.group.profitTriggerPercent && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatPercent(groupData.group.profitTriggerPercent)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {uiState.editingGroup === groupData.group.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditGroup(groupData.group)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit group constraints"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleConstraintGroup(groupData.group.id, groupData.group.isActive)}
                      className={`p-2 rounded-lg transition-colors ${groupData.group.isActive
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      title={groupData.group.isActive ? 'Deactivate constraint group' : 'Activate constraint group'}
                    >
                      {groupData.group.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                    <DeleteButton
                      onDelete={async () => handleDeleteConstraintGroup(groupData.group.id, groupData.group.name)}
                      itemName={groupData.group.name}
                      itemType="constraint group"
                      size="md"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Stocks Section - Always show for single stock, expandable for multiple */}
            {(groupData.stocks.length === 1 || uiState.expandedGroups.has(groupData.group.id)) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Only show header and add button for multiple stocks */}
                {groupData.stocks.length > 1 && (
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stocks in this group ({groupData.stocks.length}):
                    </h4>
                    <button
                      onClick={() => setUIState(prev => ({ ...prev, addingStockToGroup: groupData.group.id }))}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Add stock to group"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Stock
                    </button>
                  </div>
                )}

                {/* Add Stock Button for single stock groups */}
                {groupData.stocks.length === 1 && (
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => setUIState(prev => ({ ...prev, addingStockToGroup: groupData.group.id }))}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Add another stock to group"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Stock
                    </button>
                  </div>
                )}

                {/* Add Stock Form */}
                {uiState.addingStockToGroup === groupData.group.id && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <StockSearchInput
                          onStockSelect={(stock) => setNewStockSymbol(stock)}
                          placeholder="Search and select stock..."
                          className="w-full"
                        />
                        <input
                          type="text"
                          value={newStockSymbol}
                          onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                          placeholder="Or type stock symbol (e.g., AAPL)"
                          className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleAddStockToGroup(groupData.group.id, newStockSymbol)}
                        disabled={!newStockSymbol.trim()}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setUIState(prev => ({ ...prev, addingStockToGroup: null }));
                          setNewStockSymbol('');
                        }}
                        className="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Individual Stocks with Enhanced Display */}
                <div className="space-y-3">
                  {groupData.stocks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No stocks in this group yet. Click "Add Stock" to add some.
                    </div>
                  ) : (
                    getMatchingStocks(groupData).map((stockData) => {
                      // Debug: Log the stock data to see what's being rendered
                      console.log('Rendering stock:', stockData.symbol, 'for group:', groupData.group.name);
                      
                      const stockInfo = getStockInfo(stockData.symbol);
                      const isEditing = uiState.editingStock === `${groupData.group.id}-${stockData.symbol}`;
                      
                      // Determine status color and icon
                      const getStatusDisplay = (status: string) => {
                        switch (status) {
                          case 'position':
                            return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Position' };
                          case 'triggered':
                            return { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'Triggered' };
                          default:
                            return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'Watching' };
                        }
                      };
                      
                      const statusDisplay = getStatusDisplay(stockData.status);

                      return (
                        <div key={stockData.symbol} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col flex-1">
                              {/* Stock Header */}
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {stockData.symbol}
                                </span>
                                
                                {/* Status Badge */}
                                <span className={`text-xs px-2 py-1 rounded ${statusDisplay.bg} ${statusDisplay.color}`}>
                                  {statusDisplay.text}
                                </span>
                                
                                {/* Custom Triggers Indicator */}
                                {stockData.isCustomTriggers ? (
                                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                                    Custom Triggers
                                  </span>
                                ) : (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                    Group Default
                                  </span>
                                )}
                              </div>

                              {/* Company Name */}
                              {stockInfo && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  {stockInfo.name}
                                </span>
                              )}

                              {/* Current Price and Position Info */}
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${stockData.currentPrice.toFixed(2)}
                                  </span>
                                </div>
                                
                                {stockData.position && stockData.position.quantity > 0 && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Qty: {stockData.position.quantity}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Value: {formatCurrency(stockData.marketValue)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className={`text-sm font-medium ${stockData.unrealizedPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPercent(stockData.unrealizedPnlPercent)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Trigger Values Display */}
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Buy: {formatPercent(stockData.triggers.buyTriggerPercent)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({formatCurrency(stockData.triggers.buyAmount)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Sell: {formatPercent(stockData.triggers.sellTriggerPercent)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({formatCurrency(stockData.triggers.sellAmount)})
                                  </span>
                                </div>
                                {stockData.triggers.profitTriggerPercent && (
                                  <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      Profit: {formatPercent(stockData.triggers.profitTriggerPercent)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Inline Editing Section */}
                              {isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  {/* Editable Buy Trigger */}
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded">
                                      <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-600 dark:text-gray-400">Buy Trigger</p>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={uiState.editValues.buyTriggerPercent}
                                          onChange={(e) => updateEditValues({ buyTriggerPercent: parseFloat(e.target.value) })}
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                          step="0.1"
                                        />
                                        <span className="text-xs text-gray-900 dark:text-white">%</span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        <input
                                          type="number"
                                          value={uiState.editValues.buyAmount}
                                          onChange={(e) => updateEditValues({ buyAmount: parseFloat(e.target.value) })}
                                          className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                          step="100"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Editable Sell Trigger */}
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                                      <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-600 dark:text-gray-400">Sell Trigger</p>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={uiState.editValues.sellTriggerPercent}
                                          onChange={(e) => updateEditValues({ sellTriggerPercent: parseFloat(e.target.value) })}
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                          step="0.1"
                                        />
                                        <span className="text-xs text-gray-900 dark:text-white">%</span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        <input
                                          type="number"
                                          value={uiState.editValues.sellAmount}
                                          onChange={(e) => updateEditValues({ sellAmount: parseFloat(e.target.value) })}
                                          className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                          step="100"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Editable Profit Target */}
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                      <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-600 dark:text-gray-400">Profit Target</p>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={uiState.editValues.profitTriggerPercent || ''}
                                          onChange={(e) => updateEditValues({ profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                          step="0.1"
                                          placeholder="15"
                                        />
                                        <span className="text-xs text-gray-900 dark:text-white">%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Stock Action Buttons */}
                            <div className="flex items-center gap-1 ml-4">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                    title="Save changes"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    title="Cancel editing"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditStock(groupData.group.id, stockData, groupData.group)}
                                    className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    title="Edit individual constraints"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveStockFromGroup(groupData.group.id, stockData.symbol)}
                                    className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    title="Remove stock from group"
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Individual Constraints */}
      {safeIndividualConstraints.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Individual Stock Constraints
          </h3>
          <div className="space-y-3">
            {safeIndividualConstraints
              .filter(constraint => !searchTerm || constraint.stockSymbol.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((constraint) => {
                const stockInfo = getStockInfo(constraint.stockSymbol);
                return (
                  <div key={constraint.id} className="card border border-green-200 dark:border-green-800 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {constraint.stockSymbol}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${constraint.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                            {constraint.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                            Individual
                          </span>
                        </div>

                        {stockInfo && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {stockInfo.name}
                          </span>
                        )}

                        {/* Always show trigger values prominently */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                              Buy: {formatPercent(constraint.buyTriggerPercent)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({formatCurrency(constraint.buyAmount)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Sell: {formatPercent(constraint.sellTriggerPercent)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({formatCurrency(constraint.sellAmount)})
                            </span>
                          </div>
                          {constraint.profitTriggerPercent && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Profit: {formatPercent(constraint.profitTriggerPercent)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Detailed Constraint Information */}
                        {editingIndividual === constraint.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            {/* Editable Buy Trigger */}
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={uiState.editValues.buyTriggerPercent}
                                    onChange={(e) => updateEditValues({ buyTriggerPercent: parseFloat(e.target.value) })}
                                    className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                    step="0.1"
                                  />
                                  <span className="text-sm text-gray-900 dark:text-white">%</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                  <input
                                    type="number"
                                    value={uiState.editValues.buyAmount}
                                    onChange={(e) => updateEditValues({ buyAmount: parseFloat(e.target.value) })}
                                    className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                    step="100"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Editable Sell Trigger */}
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={uiState.editValues.sellTriggerPercent}
                                    onChange={(e) => updateEditValues({ sellTriggerPercent: parseFloat(e.target.value) })}
                                    className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                    step="0.1"
                                  />
                                  <span className="text-sm text-gray-900 dark:text-white">%</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                  <input
                                    type="number"
                                    value={uiState.editValues.sellAmount}
                                    onChange={(e) => updateEditValues({ sellAmount: parseFloat(e.target.value) })}
                                    className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                    step="100"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Editable Profit Target */}
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={uiState.editValues.profitTriggerPercent || ''}
                                    onChange={(e) => updateEditValues({ profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                    step="0.1"
                                    placeholder="15"
                                  />
                                  <span className="text-sm text-gray-900 dark:text-white">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Buy Trigger */}
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Buy Trigger</p>
                                <p className="font-medium text-red-600 dark:text-red-400">
                                  {formatPercent(constraint.buyTriggerPercent)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatCurrency(constraint.buyAmount)}
                                </p>
                              </div>
                            </div>

                            {/* Sell Trigger */}
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Sell Trigger</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                  {formatPercent(constraint.sellTriggerPercent)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatCurrency(constraint.sellAmount)}
                                </p>
                              </div>
                            </div>

                            {/* Profit Target */}
                            {constraint.profitTriggerPercent && (
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Profit Target</p>
                                  <p className="font-medium text-blue-600 dark:text-blue-400">
                                    {formatPercent(constraint.profitTriggerPercent)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(constraint.sellAmount)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {editingIndividual === constraint.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              title="Save changes"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              title="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditIndividual(constraint)}
                              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              title="Edit constraint"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleIndividualConstraint(constraint.id, constraint.isActive)}
                              className={`p-2 rounded-lg transition-colors ${constraint.isActive
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                }`}
                              title={constraint.isActive ? 'Deactivate constraint' : 'Activate constraint'}
                            >
                              {constraint.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </button>
                            <DeleteButton
                              onDelete={async () => handleDeleteIndividualConstraint(constraint.id, constraint.stockSymbol)}
                              itemName={constraint.stockSymbol}
                              itemType="constraint"
                              size="md"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Edit Stock Triggers Modal */}
      {editingStockData && (
        <EditTriggersModal
          isOpen={true}
          onClose={() => setEditingStockData(null)}
          onSave={handleEditStockData}
          initialValues={{
            buyTriggerPercent: editingStockData.stock.triggers.buyTriggerPercent,
            sellTriggerPercent: editingStockData.stock.triggers.sellTriggerPercent,
            profitTriggerPercent: editingStockData.stock.triggers.profitTriggerPercent || undefined,
            buyAmount: editingStockData.stock.triggers.buyAmount,
            sellAmount: editingStockData.stock.triggers.sellAmount
          }}
          title={`Edit ${editingStockData.stock.symbol} Triggers`}
          itemName={editingStockData.stock.symbol}
          itemType="stock"
        />
      )}
    </div>
  );
};

export default ConstraintPositionList;