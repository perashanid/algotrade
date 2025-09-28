import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { StockDisplayData } from '../../../types';
import EditTriggersModal from '../../Common/EditTriggersModal';
import { constraintGroupsService } from '../../../services/constraintGroups';
import toast from 'react-hot-toast';

interface StockListProps {
  stocks: StockDisplayData[];
  groupId?: string;
  onUpdate?: () => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, groupId, onUpdate }) => {
  const [editingStock, setEditingStock] = useState<StockDisplayData | null>(null);
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const handleEditStock = async (values: any) => {
    if (!editingStock || !groupId) return;
    
    try {
      await constraintGroupsService.updateStockConstraint(groupId, editingStock.symbol, values);
      toast.success(`Updated triggers for ${editingStock.symbol}`);
      setEditingStock(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stock triggers');
      throw error;
    }
  };

  const handleRemoveStock = async (stockSymbol: string) => {
    if (!groupId) return;
    
    if (!window.confirm(`Remove ${stockSymbol} from this group?`)) {
      return;
    }

    try {
      await constraintGroupsService.removeStockFromGroup(groupId, stockSymbol);
      toast.success(`Removed ${stockSymbol} from group`);
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove stock');
    }
  };

    if (stocks.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No stocks in this group
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {stocks.map((stock) => (
                <div
                    key={stock.symbol}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                                {stock.symbol}
                            </span>

                            {stock.status === 'position' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    <Activity className="h-3 w-3 mr-1" />
                                    Position
                                </span>
                            )}

                            {stock.isCustomTriggers && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                    Custom
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(stock.currentPrice)}
                                </p>
                                {stock.status === 'position' && (
                                    <p className={`text-xs ${stock.unrealizedPnl >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {formatCurrency(stock.unrealizedPnl)} ({formatPercent(stock.unrealizedPnlPercent)})
                                    </p>
                                )}
                            </div>
                            
                            {/* Action buttons */}
                            {groupId && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingStock(stock)}
                                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                        title="Edit stock triggers"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveStock(stock.symbol)}
                                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                        title="Remove stock from group"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            Buy: {formatPercent(stock.triggers.buyTriggerPercent)}
                        </span>
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            Sell: {formatPercent(stock.triggers.sellTriggerPercent)}
                        </span>
                        {stock.triggers.profitTriggerPercent && (
                            <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-blue-500" />
                                Profit: {formatPercent(stock.triggers.profitTriggerPercent)}
                            </span>
                        )}
                    </div>

                    {stock.status === 'position' && stock.position && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {stock.position.quantity.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Avg Cost</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(stock.position.averageCost)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Value</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(stock.marketValue)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            {/* Edit Stock Triggers Modal */}
            {editingStock && (
                <EditTriggersModal
                    isOpen={true}
                    onClose={() => setEditingStock(null)}
                    onSave={handleEditStock}
                    initialValues={{
                        buyTriggerPercent: editingStock.triggers.buyTriggerPercent,
                        sellTriggerPercent: editingStock.triggers.sellTriggerPercent,
                        profitTriggerPercent: editingStock.triggers.profitTriggerPercent || undefined,
                        buyAmount: editingStock.triggers.buyAmount,
                        sellAmount: editingStock.triggers.sellAmount
                    }}
                    title={`Edit ${editingStock.symbol} Triggers`}
                    itemName={editingStock.symbol}
                    itemType="stock"
                />
            )}
        </div>
    );
};

export default StockList;