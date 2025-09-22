import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, AlertCircle, Plus, Edit, Save, X, ChevronDown, ChevronRight, Search, Trash2 } from 'lucide-react';
import { constraintPositionsService } from '../../services/constraintPositions';
import { constraintGroupsService } from '../../services/constraintGroups';
import { stockGroupsService } from '../../services/stockGroups';
import { ConstraintPosition, ConstraintGroup, StockGroup } from '../../types';
import toast from 'react-hot-toast';

const ConstraintPositionList: React.FC = () => {
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [positions, setPositions] = useState<ConstraintPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editValues, setEditValues] = useState<{
    buyAmount: number;
    sellAmount: number;
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
  }>({
    buyAmount: 0,
    sellAmount: 0,
    buyTriggerPercent: 0,
    sellTriggerPercent: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, stockGroupsData, positionsData] = await Promise.all([
        constraintGroupsService.getConstraintGroups(),
        stockGroupsService.getStockGroups(),
        constraintPositionsService.getConstraintPositions()
      ]);
      setConstraintGroups(groupsData);
      setStockGroups(stockGroupsData);
      setPositions(positionsData);
    } catch (error) {
      toast.error('Failed to load constraint data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  const handleEditStock = (groupId: string, stock: string, group: ConstraintGroup) => {
    setEditingStock(`${groupId}-${stock}`);
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
      } else if (editingStock) {
        const [groupId] = editingStock.split('-');
        await constraintGroupsService.updateConstraintGroup(groupId, editValues);
        toast.success('Stock constraint updated successfully!');
        setEditingStock(null);
        await loadData();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint');
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditingStock(null);
    setEditValues({
      buyAmount: 0,
      sellAmount: 0,
      buyTriggerPercent: 0,
      sellTriggerPercent: 0
    });
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
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

  const handleDeleteStockGroup = async (stockGroupId: string, stockGroupName: string) => {
    if (window.confirm(`Are you sure you want to delete the stock group "${stockGroupName}"? This action cannot be undone.`)) {
      try {
        await stockGroupsService.deleteStockGroup(stockGroupId);
        toast.success('Stock group deleted successfully!');
        await loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete stock group');
      }
    }
  };

  const handleRemoveStockFromGroup = async (stockGroupId: string, stockSymbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${stockSymbol} from this group?`)) {
      try {
        const stockGroup = stockGroups.find(g => g.id === stockGroupId);
        if (stockGroup) {
          const updatedStocks = stockGroup.stocks.filter(s => s !== stockSymbol);
          await stockGroupsService.updateStockGroup(stockGroupId, { stocks: updatedStocks });
          toast.success(`${stockSymbol} removed from group successfully!`);
          await loadData();
        }
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

  const formatNumber = (value: number, decimals: number = 4) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const positionCount = positions.filter(p => p.status === 'position').length;
  const totalConstraints = constraintGroups.length;
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalStocks = constraintGroups.reduce((sum, group) => sum + group.stocks.length, 0);

  // Filter constraints based on search term
  const filteredConstraintGroups = constraintGroups.filter(group => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.stocks.some(stock => stock.toLowerCase().includes(searchLower))
    );
  });

  // Get all stocks that match search term for expanded view
  const getMatchingStocks = (group: ConstraintGroup) => {
    if (!searchTerm) return group.stocks;
    return group.stocks.filter(stock =>
      stock.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Auto-expand groups when searching for stocks
  React.useEffect(() => {
    if (searchTerm) {
      const groupsWithMatchingStocks = constraintGroups
        .filter(group => group.stocks.some(stock =>
          stock.toLowerCase().includes(searchTerm.toLowerCase())
        ))
        .map(group => group.id);

      if (groupsWithMatchingStocks.length > 0) {
        setExpandedGroups(new Set(groupsWithMatchingStocks));
      }
    }
  }, [searchTerm, constraintGroups]);

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (constraintGroups.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Constraints</h3>
          <p className="text-gray-600 mb-4">
            Create constraints to start monitoring stocks and building positions automatically.
          </p>
          <Link
            to="/constraints"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <h2 className="text-xl font-semibold text-gray-900">Active Constraints</h2>
          <p className="text-gray-600 text-sm">
            All constraints and their current positions
          </p>
        </div>
        <Link
          to="/constraints"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Manage Constraints
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search constraints or stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-600">{totalConstraints}</div>
          <div className="text-sm text-blue-700">Constraint Groups</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-semibold text-purple-600">{totalStocks}</div>
          <div className="text-sm text-purple-700">Total Stocks</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-600">{positionCount}</div>
          <div className="text-sm text-green-700">Active Positions</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-600">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-700">Total Value</div>
        </div>
      </div>



      {/* Constraint Groups List */}
      <div className="space-y-3">
        {filteredConstraintGroups.map((group) => (
          <div key={group.id} className="card border border-blue-200">
            {/* Group Header - Always Visible */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {group.stocks.length} stocks
                  </span>
                </div>

                {group.description && (
                  <p className="text-gray-600 mb-3">{group.description}</p>
                )}

                {/* Group Constraints - Editable */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {editingGroup === group.id ? (
                    <>
                      {/* Editable Buy Trigger */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Buy Trigger</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.buyTriggerPercent}
                              onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                              className="w-16 px-1 py-0.5 text-sm border rounded"
                              step="0.1"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">$</span>
                            <input
                              type="number"
                              value={editValues.buyAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                              className="w-20 px-1 py-0.5 text-xs border rounded"
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
                          <p className="text-sm text-gray-600">Sell Trigger</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.sellTriggerPercent}
                              onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                              className="w-16 px-1 py-0.5 text-sm border rounded"
                              step="0.1"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">$</span>
                            <input
                              type="number"
                              value={editValues.sellAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                              className="w-20 px-1 py-0.5 text-xs border rounded"
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
                          <p className="text-sm text-gray-600">Profit Target</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.profitTriggerPercent || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                              className="w-16 px-1 py-0.5 text-sm border rounded"
                              step="0.1"
                              placeholder="15"
                            />
                            <span className="text-sm">%</span>
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
                          <p className="text-sm text-gray-600">Buy Trigger</p>
                          <p className="font-medium text-gray-900">
                            {formatPercent(group.buyTriggerPercent)} drop
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(group.buyAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sell Trigger</p>
                          <p className="font-medium text-gray-900">
                            {formatPercent(group.sellTriggerPercent)} rise
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(group.sellAmount)}
                          </p>
                        </div>
                      </div>

                      {group.profitTriggerPercent && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Profit Target</p>
                            <p className="font-medium text-gray-900">
                              {formatPercent(group.profitTriggerPercent)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: {formatCurrency(group.sellAmount)}
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
                {editingGroup === group.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit group constraints"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete constraint group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Expanded Stocks Section */}
            {expandedGroups.has(group.id) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Stocks in this group {searchTerm && `(matching "${searchTerm}"):`}:
                </h4>

                {/* Individual Stocks */}
                {group.stocks.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-600 mb-2">Individual Stocks:</h5>
                    <div className="space-y-2">
                      {getMatchingStocks(group).map((stock) => (
                        <div key={stock} className={`flex items-center justify-between p-3 rounded-lg ${searchTerm && stock.toLowerCase().includes(searchTerm.toLowerCase())
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-50'
                          }`}>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${searchTerm && stock.toLowerCase().includes(searchTerm.toLowerCase())
                              ? 'text-yellow-900'
                              : 'text-gray-900'
                              }`}>
                              {stock}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Individual Stock
                            </span>
                            {searchTerm && stock.toLowerCase().includes(searchTerm.toLowerCase()) && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Match
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {editingStock === `${group.id}-${stock}` ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                  <input
                                    type="number"
                                    value={editValues.buyTriggerPercent}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                                    className="w-12 px-1 py-0.5 text-xs border rounded"
                                    step="0.1"
                                  />
                                  <span className="text-xs">%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                  <input
                                    type="number"
                                    value={editValues.sellTriggerPercent}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                                    className="w-12 px-1 py-0.5 text-xs border rounded"
                                    step="0.1"
                                  />
                                  <span className="text-xs">%</span>
                                </div>
                                <button
                                  onClick={handleSaveEdit}
                                  className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                  title="Save changes"
                                >
                                  <Save className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                  title="Cancel editing"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-600">
                                  <span className="text-red-600">{formatPercent(group.buyTriggerPercent)}</span>
                                  {' / '}
                                  <span className="text-green-600">{formatPercent(group.sellTriggerPercent)}</span>
                                </div>
                                <button
                                  onClick={() => handleEditStock(group.id, stock, group)}
                                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                  title="Edit stock constraint"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Groups */}
                {group.stockGroups.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">Stock Groups:</h5>
                    <div className="space-y-2">
                      {group.stockGroups.map((stockGroupId) => {
                        const stockGroup = stockGroups.find(sg => sg.id === stockGroupId);
                        if (!stockGroup) return null;

                        return (
                          <div key={stockGroupId} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stockGroup.color }}
                                />
                                <span className="font-medium text-gray-900">{stockGroup.name}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {stockGroup.stocks.length} stocks
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteStockGroup(stockGroup.id, stockGroup.name)}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                title="Delete stock group"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Stocks in this group */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {stockGroup.stocks.map((stock) => (
                                <div key={stock} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <span className="text-sm font-medium text-gray-900">{stock}</span>
                                  <button
                                    onClick={() => handleRemoveStockFromGroup(stockGroup.id, stock)}
                                    className="p-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                    title={`Remove ${stock} from group`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}


        <Link
          to={`/constraints/edit/${constraint.id}`}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          title="Edit constraint"
        >
          <Edit className="h-4 w-4" />
        </Link>
      </div>
    </div>
          </div >
        ))}
      </div >

{
  filteredConstraintGroups.length === 0 && filteredIndividualConstraints.length === 0 && (
    <div className="text-center py-8">
      <p className="text-gray-600">
        {searchTerm ? `No constraints found matching "${searchTerm}"` : 'No constraints found'}
      </p>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Clear search
        </button>
      )}
    </div>
  )
}
    </div >
  );
};

export default ConstraintPositionList;