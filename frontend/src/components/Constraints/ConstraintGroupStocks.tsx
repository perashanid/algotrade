import React, { useState } from 'react';
import { Edit, Trash2, Plus, Save, X, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { ConstraintGroup } from '../../types';
import { constraintGroupsService } from '../../services/constraintGroups';
import { getStockInfo } from '../../data/stockDatabase';
import StockSearchInput from '../Common/StockSearchInput';
import toast from 'react-hot-toast';

interface ConstraintGroupStocksProps {
  group: ConstraintGroup;
  onUpdate: () => void;
}

const ConstraintGroupStocks: React.FC<ConstraintGroupStocksProps> = ({ group, onUpdate }) => {
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [addingStock, setAddingStock] = useState(false);
  const [editValues, setEditValues] = useState({
    buyTriggerPercent: 0,
    sellTriggerPercent: 0,
    profitTriggerPercent: undefined as number | undefined,
    buyAmount: 0,
    sellAmount: 0
  });

  const handleEditStock = (stockSymbol: string) => {
    const stockOverride = group.stockOverrides?.[stockSymbol];
    setEditingStock(stockSymbol);
    setEditValues({
      buyTriggerPercent: stockOverride?.buyTriggerPercent ?? group.buyTriggerPercent,
      sellTriggerPercent: stockOverride?.sellTriggerPercent ?? group.sellTriggerPercent,
      profitTriggerPercent: stockOverride?.profitTriggerPercent ?? group.profitTriggerPercent,
      buyAmount: stockOverride?.buyAmount ?? group.buyAmount,
      sellAmount: stockOverride?.sellAmount ?? group.sellAmount
    });
  };

  const handleSaveStockEdit = async () => {
    if (!editingStock) return;

    try {
      console.log('Updating stock constraint:', { groupId: group.id, stock: editingStock, values: editValues });
      await constraintGroupsService.updateStockConstraint(group.id, editingStock, editValues);
      toast.success(`${editingStock} constraints updated successfully!`);
      setEditingStock(null);
      onUpdate();
    } catch (error) {
      console.error('Update stock constraint error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stock constraint');
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setAddingStock(false);
    setEditValues({
      buyTriggerPercent: 0,
      sellTriggerPercent: 0,
      profitTriggerPercent: undefined,
      buyAmount: 0,
      sellAmount: 0
    });
  };

  const handleAddStock = async (stockSymbol: string) => {
    if (!stockSymbol.trim()) {
      toast.error('Please select a stock symbol');
      return;
    }

    try {
      console.log('Adding stock to group:', { groupId: group.id, stockSymbol: stockSymbol.trim() });
      await constraintGroupsService.addStockToGroup(group.id, stockSymbol.trim());
      toast.success(`${stockSymbol} added to group successfully!`);
      setAddingStock(false);
      onUpdate();
    } catch (error) {
      console.error('Add stock to group error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add stock to group');
    }
  };

  const handleRemoveStock = async (stockSymbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${stockSymbol} from this group?`)) {
      try {
        console.log('Removing stock from group:', { groupId: group.id, stockSymbol });
        await constraintGroupsService.removeStockFromGroup(group.id, stockSymbol);
        toast.success(`${stockSymbol} removed from group successfully!`);
        onUpdate();
      } catch (error) {
        console.error('Remove stock from group error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to remove stock from group');
      }
    }
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

  // Safely get all stocks from the group
  const safeStocks = Array.isArray(group.stocks) ? group.stocks : [];
  const safeStockGroups = Array.isArray(group.stockGroups) ? group.stockGroups : [];
  const stockGroupStocks = safeStockGroups.flatMap(sg => 
    Array.isArray(sg.stocks) ? sg.stocks : []
  );
  const allStocks = [...safeStocks, ...stockGroupStocks];



  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Stocks in this group ({allStocks.length}):
        </h4>
        <button
          onClick={() => setAddingStock(true)}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Stock
        </button>
      </div>

      {/* Add Stock Form */}
      {addingStock && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <StockSearchInput
                onStockSelect={handleAddStock}
                placeholder="Search by company name or symbol..."
              />
            </div>
            <button
              onClick={() => setAddingStock(false)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stock List */}
      <div className="space-y-2">
        {allStocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No stocks in this group yet. Click "Add Stock" to add some.</p>
          </div>
        ) : (
          allStocks.map((stockSymbol) => {
            const stockInfo = getStockInfo(stockSymbol);
            const stockOverride = group.stockOverrides?.[stockSymbol];
            const isEditing = editingStock === stockSymbol;

            return (
              <div
                key={stockSymbol}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{stockSymbol}</h5>
                      {stockOverride && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    {stockInfo && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{stockInfo.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditStock(stockSymbol)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Edit triggers"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveStock(stockSymbol)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Remove from group"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Buy Trigger */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Buy Trigger</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.buyTriggerPercent}
                              onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                            <input
                              type="number"
                              value={editValues.buyAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sell Trigger */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Sell Trigger</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.sellTriggerPercent}
                              onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                            <input
                              type="number"
                              value={editValues.sellAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                              step="100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Profit Target */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Profit Target</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValues.profitTriggerPercent || ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="0.1"
                            placeholder="15"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSaveStockEdit}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Buy Trigger Display */}
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">Buy Trigger</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPercent(stockOverride?.buyTriggerPercent ?? group.buyTriggerPercent)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(stockOverride?.buyAmount ?? group.buyAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Sell Trigger Display */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">Sell Trigger</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPercent(stockOverride?.sellTriggerPercent ?? group.sellTriggerPercent)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(stockOverride?.sellAmount ?? group.sellAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Profit Target Display */}
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">Profit Target</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {stockOverride?.profitTriggerPercent !== undefined 
                            ? formatPercent(stockOverride.profitTriggerPercent)
                            : group.profitTriggerPercent 
                            ? formatPercent(group.profitTriggerPercent)
                            : 'Not set'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConstraintGroupStocks;