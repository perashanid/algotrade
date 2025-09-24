import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Power, PowerOff, TrendingUp, TrendingDown, Target, Users, Tag, ChevronDown, ChevronRight, Save, X, UserPlus, UserMinus } from 'lucide-react';
import { constraintsService } from '../../services/constraints';
import { constraintGroupsService } from '../../services/constraintGroups';
import { stockGroupsService } from '../../services/stockGroups';
import { TradingConstraint, ConstraintGroup, StockGroup, CreateConstraintGroupRequest } from '../../types';
import CreateConstraintModal from './CreateConstraintModal';
import CreateStockGroupModal from './CreateStockGroupModal';
import StockGroupManager from './StockGroupManager';
import LegacyStocks from './LegacyStocks';
import ConstraintGroupStocks from './ConstraintGroupStocks';
import StockSearchInput from '../Common/StockSearchInput';
import { getStockInfo } from '../../data/stockDatabase';
import { useInvalidateQueries } from '../../hooks/useInvalidateQueries';
import toast from 'react-hot-toast';

const Constraints: React.FC = () => {
  const { invalidateConstraintData } = useInvalidateQueries();
  const [constraints, setConstraints] = useState<TradingConstraint[]>([]);
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStockGroupModal, setShowCreateStockGroupModal] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'groups' | 'stock-groups'>('groups');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedIndividual, setExpandedIndividual] = useState<Set<string>>(new Set());
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editingIndividual, setEditingIndividual] = useState<string | null>(null);
  const [addingStockToGroup, setAddingStockToGroup] = useState<string | null>(null);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [editValues, setEditValues] = useState<{
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
    buyAmount: number;
    sellAmount: number;
  }>({
    buyTriggerPercent: 0,
    sellTriggerPercent: 0,
    buyAmount: 0,
    sellAmount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [constraintsData, constraintGroupsData, stockGroupsData] = await Promise.all([
        constraintsService.getConstraints(),
        constraintGroupsService.getConstraintGroups(),
        stockGroupsService.getStockGroups()
      ]);



      setConstraints(constraintsData);
      setConstraintGroups(constraintGroupsData);
      setStockGroups(stockGroupsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await constraintsService.toggleConstraint(id, !isActive);
      setConstraints(prev =>
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      await invalidateConstraintData(); // Invalidate React Query cache
      toast.success(`Constraint ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint');
    }
  };

  const handleDelete = async (id: string, stockSymbol: string) => {
    console.log('handleDelete called with:', { id, stockSymbol });
    
    if (!window.confirm(`Are you sure you want to delete the constraint for ${stockSymbol}?`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Starting delete operation for constraint:', { id, stockSymbol });
      console.log('Current constraints before delete:', constraints.length);
      
      await constraintsService.deleteConstraint(id);
      console.log('Delete API call successful');
      
      setConstraints(prev => {
        const filtered = prev.filter(c => c.id !== id);
        console.log('Constraints after filter:', filtered.length);
        return filtered;
      });
      
      await invalidateConstraintData(); // Invalidate React Query cache
      console.log('Cache invalidated');
      
      toast.success('Constraint deleted successfully');
    } catch (error) {
      console.error('Delete constraint error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint');
    }
  };

  const handleCreateConstraintGroup = async (constraintData: CreateConstraintGroupRequest) => {
    await constraintGroupsService.createConstraintGroup(constraintData);
    await loadData();
    await invalidateConstraintData(); // Invalidate React Query cache
  };

  const handleCreateStockGroup = async (stockGroupData: any) => {
    await stockGroupsService.createStockGroup(stockGroupData);
    await loadData();
    await invalidateConstraintData(); // Invalidate React Query cache
  };

  const handleToggleConstraintGroup = async (id: string, isActive: boolean) => {
    try {
      await constraintGroupsService.toggleConstraintGroup(id, !isActive);
      setConstraintGroups(prev =>
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      await invalidateConstraintData(); // Invalidate React Query cache
      toast.success(`Constraint group ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint group');
    }
  };

  const handleDeleteConstraintGroup = async (id: string, name: string) => {
    console.log('handleDeleteConstraintGroup called with:', { id, name });
    
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Starting delete operation for constraint group:', { id, name });
      console.log('Current constraint groups before delete:', constraintGroups.length);
      
      await constraintGroupsService.deleteConstraintGroup(id);
      console.log('Delete API call successful');
      
      setConstraintGroups(prev => {
        const filtered = prev.filter(c => c.id !== id);
        console.log('Constraint groups after filter:', filtered.length);
        return filtered;
      });
      
      await invalidateConstraintData(); // Invalidate React Query cache
      console.log('Cache invalidated');
      
      toast.success('Constraint group deleted successfully');
    } catch (error) {
      console.error('Delete constraint group error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint group');
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleIndividualExpansion = (constraintId: string) => {
    setExpandedIndividual(prev => {
      const newSet = new Set(prev);
      if (newSet.has(constraintId)) {
        newSet.delete(constraintId);
      } else {
        newSet.add(constraintId);
      }
      return newSet;
    });
  };

  const handleEditGroup = (group: ConstraintGroup) => {
    setEditingGroup(group.id);
    setEditValues({
      buyTriggerPercent: group.buyTriggerPercent,
      sellTriggerPercent: group.sellTriggerPercent,
      profitTriggerPercent: group.profitTriggerPercent,
      buyAmount: group.buyAmount,
      sellAmount: group.sellAmount
    });
  };



  const handleSaveEdit = async () => {
    try {
      if (editingGroup) {
        await constraintGroupsService.updateConstraintGroup(editingGroup, editValues);
        toast.success('Constraint group updated successfully!');
        setEditingGroup(null);
        await loadData();
        await invalidateConstraintData(); // Invalidate React Query cache
      } else if (editingStock) {
        // For individual stock editing, update the stock's individual constraints within the group
        const [groupId, stockSymbol] = editingStock.split('-');

        await constraintGroupsService.updateStockConstraint(groupId, stockSymbol, {
          buyTriggerPercent: editValues.buyTriggerPercent,
          sellTriggerPercent: editValues.sellTriggerPercent,
          profitTriggerPercent: editValues.profitTriggerPercent,
          buyAmount: editValues.buyAmount,
          sellAmount: editValues.sellAmount
        });

        toast.success(`${stockSymbol} constraints updated successfully!`);
        setEditingStock(null);
        await loadData();
        await invalidateConstraintData(); // Invalidate React Query cache
      } else if (editingIndividual) {
        // For individual constraint editing
        await constraintsService.updateConstraint(editingIndividual, editValues);
        toast.success('Individual constraint updated successfully!');
        setEditingIndividual(null);
        await loadData();
        await invalidateConstraintData(); // Invalidate React Query cache
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint');
    }
  };

  const handleAddStockToGroup = async (groupId: string, stockSymbol: string) => {
    if (!stockSymbol.trim()) {
      toast.error('Please select a stock symbol');
      return;
    }

    try {
      console.log('Adding stock to group:', { groupId, stockSymbol: stockSymbol.trim() });
      await constraintGroupsService.addStockToGroup(groupId, stockSymbol.trim());
      toast.success(`${stockSymbol} added to group successfully!`);
      setAddingStockToGroup(null);
      setNewStockSymbol('');
      await loadData();
      await invalidateConstraintData(); // Invalidate React Query cache
    } catch (error) {
      console.error('Add stock to group error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add stock to group');
    }
  };

  const handleRemoveStockFromGroup = async (groupId: string, stockSymbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${stockSymbol} from this group?`)) {
      try {
        await constraintGroupsService.removeStockFromGroup(groupId, stockSymbol);
        toast.success(`${stockSymbol} removed from group successfully!`);
        await loadData();
        await invalidateConstraintData(); // Invalidate React Query cache
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove stock from group');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditingStock(null);
    setEditingIndividual(null);
    setAddingStockToGroup(null);
    setNewStockSymbol('');
    setEditValues({
      buyTriggerPercent: 0,
      sellTriggerPercent: 0,
      buyAmount: 0,
      sellAmount: 0
    });
  };

  // Stock management functions moved to ConstraintGroupStocks component

  const handleEditStock = (groupId: string, stock: string, group: ConstraintGroup) => {
    setEditingStock(`${groupId}-${stock}`);

    // Check if this stock has individual overrides, otherwise use group defaults
    const stockOverride = group.stockOverrides?.[stock];
    setEditValues({
      buyTriggerPercent: stockOverride?.buyTriggerPercent ?? group.buyTriggerPercent,
      sellTriggerPercent: stockOverride?.sellTriggerPercent ?? group.sellTriggerPercent,
      profitTriggerPercent: stockOverride?.profitTriggerPercent ?? group.profitTriggerPercent,
      buyAmount: stockOverride?.buyAmount ?? group.buyAmount,
      sellAmount: stockOverride?.sellAmount ?? group.sellAmount
    });
  };

  const handleEditIndividual = (constraint: any) => {
    setEditingIndividual(constraint.id);
    setEditValues({
      buyTriggerPercent: constraint.buyTriggerPercent,
      sellTriggerPercent: constraint.sellTriggerPercent,
      profitTriggerPercent: constraint.profitTriggerPercent,
      buyAmount: constraint.buyAmount,
      sellAmount: constraint.sellAmount
    });
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Constraints</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your automated trading rules and triggers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
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

          {/* Create Buttons */}
          {viewMode === 'groups' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Constraint Group
            </button>
          )}
          {viewMode === 'stock-groups' && (
            <button
              onClick={() => setShowCreateStockGroupModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Stock Group
            </button>
          )}
          {viewMode === 'individual' && (
            <Link
              to="/constraints/create"
              className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Individual Constraint
            </Link>
          )}
        </div>
      </div>

      {viewMode === 'groups' && constraintGroups.length === 0 && constraints.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No constraint groups yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create your first constraint group to apply trading rules to multiple stocks at once. Use the "New Constraint Group" button above to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {viewMode === 'individual' && (
            <LegacyStocks onConstraintCreated={loadData} />
          )}

          {viewMode === 'individual' && constraints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Individual Constraints</h3>
              <div className="grid gap-4">
                {constraints.map((constraint) => (
                  <div key={constraint.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Always show dropdown button for collapsing/expanding constraint details */}
                          <button
                            onClick={() => toggleIndividualExpansion(constraint.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title={expandedIndividual.has(constraint.id) ? "Collapse details" : "Expand details"}
                          >
                            {expandedIndividual.has(constraint.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {constraint.stockSymbol}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${constraint.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                            {constraint.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Show summary when collapsed */}
                        {!expandedIndividual.has(constraint.id) && (
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            <span className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3 text-red-500" />
                              Buy: {formatPercent(constraint.buyTriggerPercent)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              Sell: {formatPercent(constraint.sellTriggerPercent)}
                            </span>
                            {constraint.profitTriggerPercent && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-blue-500" />
                                Profit: {formatPercent(constraint.profitTriggerPercent)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Show detailed constraint information only when expanded */}
                        {expandedIndividual.has(constraint.id) && (
                          <>
                            {editingIndividual === constraint.id ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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
                                        value={editValues.buyTriggerPercent}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                                        className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                        step="0.1"
                                      />
                                      <span className="text-sm text-gray-900 dark:text-white">%</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                      <input
                                        type="number"
                                        value={editValues.buyAmount}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
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
                                        value={editValues.sellTriggerPercent}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                                        className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                        step="0.1"
                                      />
                                      <span className="text-sm text-gray-900 dark:text-white">%</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                      <input
                                        type="number"
                                        value={editValues.sellAmount}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
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
                                        value={editValues.profitTriggerPercent || ''}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
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
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Buy Trigger */}
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatPercent(constraint.buyTriggerPercent)} drop
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      Amount: {formatCurrency(constraint.buyAmount)}
                                    </p>
                                  </div>
                                </div>

                                {/* Sell Trigger */}
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatPercent(constraint.sellTriggerPercent)} rise
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      Amount: {formatCurrency(constraint.sellAmount)}
                                    </p>
                                  </div>
                                </div>

                                {/* Profit Trigger */}
                                {constraint.profitTriggerPercent && (
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {formatPercent(constraint.profitTriggerPercent)}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Amount: {formatCurrency(constraint.sellAmount)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Created: {new Date(constraint.createdAt).toLocaleDateString()}
                              {constraint.updatedAt !== constraint.createdAt && (
                                <span className="ml-4">
                                  Updated: {new Date(constraint.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

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
                              onClick={() => handleToggleActive(constraint.id, constraint.isActive)}
                              className={`p-2 rounded-lg transition-colors ${constraint.isActive
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                }`}
                              title={constraint.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {constraint.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                console.log('Delete button clicked for constraint:', constraint.id, constraint.stockSymbol);
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(constraint.id, constraint.stockSymbol);
                              }}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'groups' && constraintGroups.map((constraintGroup) => (
            <div key={constraintGroup.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Always show dropdown button for collapsing/expanding constraint details */}
                    <button
                      onClick={() => toggleGroupExpansion(constraintGroup.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={expandedGroups.has(constraintGroup.id) ? "Collapse details" : "Expand details"}
                    >
                      {expandedGroups.has(constraintGroup.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </button>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {constraintGroup.name}
                    </h3>

                    {/* For single stock, show the stock name directly */}
                    {constraintGroup.stocks.length === 1 && constraintGroup.stockGroups.length === 0 && (
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {constraintGroup.stocks[0]}
                      </span>
                    )}

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${constraintGroup.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                      {constraintGroup.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Show stock count badge */}
                    {(() => {
                      const totalStocks = constraintGroup.stocks.length + 
                        constraintGroup.stockGroups.reduce((sum, sg) => sum + (sg.stocks?.length || 0), 0);
                      return totalStocks > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                          {totalStocks} stock{totalStocks !== 1 ? 's' : ''}
                        </span>
                      );
                    })()}
                  </div>

                  {constraintGroup.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{constraintGroup.description}</p>
                  )}

                  {/* Show summary when collapsed */}
                  {!expandedGroups.has(constraintGroup.id) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        Buy: {formatPercent(constraintGroup.buyTriggerPercent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Sell: {formatPercent(constraintGroup.sellTriggerPercent)}
                      </span>
                      {constraintGroup.profitTriggerPercent && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-blue-500" />
                          Profit: {formatPercent(constraintGroup.profitTriggerPercent)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Group-level constraints with edit functionality - only show when expanded */}
                  {expandedGroups.has(constraintGroup.id) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {editingGroup === constraintGroup.id ? (
                        <>
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
                                  value={editValues.buyTriggerPercent}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                                  className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">%</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={editValues.buyAmount}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
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
                                  value={editValues.sellTriggerPercent}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                                  className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">%</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={editValues.sellAmount}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
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
                                  value={editValues.profitTriggerPercent || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
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
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatPercent(constraintGroup.buyTriggerPercent)} drop
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Amount: {formatCurrency(constraintGroup.buyAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatPercent(constraintGroup.sellTriggerPercent)} rise
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Amount: {formatCurrency(constraintGroup.sellAmount)}
                              </p>
                            </div>
                          </div>

                          {constraintGroup.profitTriggerPercent && (
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatPercent(constraintGroup.profitTriggerPercent)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Amount: {formatCurrency(constraintGroup.sellAmount)}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Collapsible Stocks Section */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Applies to {(() => {
                        const totalStocks = constraintGroup.stocks.length + 
                          constraintGroup.stockGroups.reduce((sum, sg) => sum + (sg.stocks?.length || 0), 0);
                        return `${totalStocks} stock${totalStocks !== 1 ? 's' : ''}`;
                      })()} 
                      {constraintGroup.stockGroups.length > 0 && 
                        ` (${constraintGroup.stocks.length} individual + ${constraintGroup.stockGroups.length} group${constraintGroup.stockGroups.length !== 1 ? 's' : ''})`
                      }
                    </p>

                    {/* Show detailed stocks section only when expanded */}
                    {expandedGroups.has(constraintGroup.id) && (
                      <ConstraintGroupStocks
                        group={constraintGroup}
                        onUpdate={loadData}
                      />
                    )}


                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(constraintGroup.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {editingGroup === constraintGroup.id ? (
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
                        onClick={() => handleEditGroup(constraintGroup)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="Edit group constraints"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleToggleConstraintGroup(constraintGroup.id, constraintGroup.isActive)}
                        className={`p-2 rounded-lg transition-colors ${constraintGroup.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        title={constraintGroup.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {constraintGroup.isActive ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      console.log('Delete button clicked for constraint group:', constraintGroup.id, constraintGroup.name);
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteConstraintGroup(constraintGroup.id, constraintGroup.name);
                    }}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {viewMode === 'stock-groups' && (
            <StockGroupManager stockGroups={stockGroups} onUpdate={loadData} />
          )}
        </div>
      )}

      {/* Create Constraint Modal */}
      <CreateConstraintModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateConstraintGroup}
        stockGroups={stockGroups}
        onStockGroupsUpdate={loadData}
      />

      {/* Create Stock Group Modal */}
      <CreateStockGroupModal
        isOpen={showCreateStockGroupModal}
        onClose={() => setShowCreateStockGroupModal(false)}
        onSubmit={handleCreateStockGroup}
      />
    </div>
  );
};

export default Constraints;