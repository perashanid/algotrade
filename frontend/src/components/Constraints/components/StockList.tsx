import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { StockDisplayData } from '../../../types';

interface StockListProps {
    stocks: StockDisplayData[];
    onStockEdit?: (stockSymbol: string) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, onStockEdit }) => {
    const formatPercent = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
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
        </div>
    );
};

export default StockList;