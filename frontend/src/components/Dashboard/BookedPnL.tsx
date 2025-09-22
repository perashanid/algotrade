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
      setClosedPositions(data);
    } catch (error) {
      toast.error('Failed to load closed positions');
      console.error('Error loading closed positions:', error);
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

  const filteredPositions = closedPositions.filter(position => {
    if (filter === 'profit') return position.realizedPnl > 0;
    if (filter === 'loss') return position.realizedPnl < 0;
    return true;
  });

  const totalPnL = closedPositions.reduce((sum, p) => sum + p.realizedPnl, 0);
  const profitCount = closedPositions.filter(p => p.realizedPnl > 0).length;
  const lossCount = closedPositions.filter(p => p.realizedPnl < 0).length;

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

  if (closedPositions.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Closed Positions</h3>
          <p className="text-gray-600">
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
          <h2 className="text-xl font-semibold text-gray-900">Booked P&L</h2>
          <p className="text-gray-600 text-sm">
            Realized profits and losses from closed positions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-lg font-semibold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalPnL)}
          </div>
          <div className="text-sm text-gray-700">Total P&L</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-600">{profitCount}</div>
          <div className="text-sm text-green-700">Profitable</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-semibold text-red-600">{lossCount}</div>
          <div className="text-sm text-red-700">Loss Making</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({closedPositions.length})
        </button>
        <button
          onClick={() => setFilter('profit')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'profit'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Profit ({profitCount})
        </button>
        <button
          onClick={() => setFilter('loss')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex-1 ${
            filter === 'loss'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
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
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{position.stockSymbol}</h3>
                  
                  {position.constraintName && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {position.constraintName}
                    </span>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    position.constraintType === 'group' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {position.constraintType === 'group' ? 'Group' : 'Individual'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Trade Details */}
                  <div>
                    <p className="text-gray-600">Trade Details</p>
                    <p className="font-medium">
                      {position.quantity} shares
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg: {formatCurrency(position.averageCost)}
                    </p>
                  </div>

                  {/* Exit Price */}
                  <div>
                    <p className="text-gray-600">Exit Price</p>
                    <p className="font-medium">{formatCurrency(position.exitPrice)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(position.closedAt)}
                    </p>
                  </div>

                  {/* Realized P&L */}
                  <div>
                    <p className="text-gray-600">Realized P&L</p>
                    <p className={`font-medium ${
                      position.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(position.realizedPnl)}
                    </p>
                    <p className={`text-xs ${
                      position.realizedPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(position.realizedPnlPercent)}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{position.holdingDays} days</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(position.openedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {position.realizedPnl >= 0 ? (
                  <div title="Profitable trade">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div title="Loss making trade">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                )}
                <div title="Closed position">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPositions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No {filter === 'all' ? '' : filter === 'profit' ? 'profitable' : 'loss making'} positions found
          </p>
        </div>
      )}
    </div>
  );
};

export default BookedPnL;