import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Activity } from 'lucide-react';
import { tradeHistoryService } from '../../services/tradeHistory';
import { ClosedPosition } from '../../types';
import toast from 'react-hot-toast';

const BookedPnL: React.FC = () => {
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'profit' | 'loss'>('all');

  useEffect(() => {
    loadClosedPositions();
  }, []);

  const loadClosedPositions = async () => {
    try {
      setLoading(true);
      const data = await tradeHistoryService.getClosedPositions();
      // Ensure data is always an array
      setClosedPositions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load closed positions');
      console.error('Error loading closed positions:', error);
      // Set empty array on error
      setClosedPositions([]);
    } finally {
      setLoading(false);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Ensure closedPositions is always an array
  const safeClosedPositions = Array.isArray(closedPositions) ? closedPositions : [];

  const filteredPositions = safeClosedPositions.filter(position => {
    if (filter === 'profit') return position.realizedPnl > 0;
    if (filter === 'loss') return position.realizedPnl < 0;
    return true;
  });

  const totalPnL = safeClosedPositions.reduce((sum, p) => sum + p.realizedPnl, 0);
  const profitCount = safeClosedPositions.filter(p => p.realizedPnl > 0).length;
  const lossCount = safeClosedPositions.filter(p => p.realizedPnl < 0).length;

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

  if (safeClosedPositions.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Closed Positions</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Closed positions will appear here once you complete trades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Booked P&L</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Realized profits and losses from closed positions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className={`text-lg font-semibold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalPnL)}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-400">Total P&L</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">{profitCount}</div>
          <div className="text-sm text-green-700 dark:text-green-300">Profitable</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{lossCount}</div>
          <div className="text-sm text-red-700 dark:text-red-300">Loss Making</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'all'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({safeClosedPositions.length})
        </button>
        <button
          onClick={() => setFilter('profit')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'profit'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Profit ({profitCount})
        </button>
        <button
          onClick={() => setFilter('loss')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'loss'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Loss ({lossCount})
        </button>
      </div>

      {/* Closed Positions List */}
      <div className="space-y-3">
        {filteredPositions.map((position) => (
          <div
            key={position.id}
            className={`p-4 border rounded-lg ${
              position.realizedPnl >= 0 
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{position.stockSymbol}</h3>
                  
                  {position.constraintName && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                      {position.constraintName}
                    </span>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    position.constraintType === 'group' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {position.constraintType === 'group' ? 'Group' : 'Individual'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Trade Details */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Trade Details</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {position.quantity} shares
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Avg: {formatCurrency(position.averageCost)}
                    </p>
                  </div>

                  {/* Exit Price */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Exit Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(position.exitPrice)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(position.closedAt)}
                    </p>
                  </div>

                  {/* Realized P&L */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Realized P&L</p>
                    <p className={`font-medium ${
                      position.realizedPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(position.realizedPnl)}
                    </p>
                    <p className={`text-xs ${
                      position.realizedPnlPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercent(position.realizedPnlPercent)}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{position.holdingDays} days</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(position.openedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {position.realizedPnl >= 0 ? (
                  <div title="Profitable trade">
                    <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </div>
                ) : (
                  <div title="Loss making trade">
                    <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </div>
                )}
                <div title="Closed position">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPositions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">
            No {filter === 'all' ? '' : filter === 'profit' ? 'profitable' : 'loss making'} positions found
          </p>
        </div>
      )}
    </div>
  );
};

export default BookedPnL;