import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Eye, Trash2 } from 'lucide-react';

interface HistoricalBacktest {
  id: string;
  constraintName: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  totalReturnPercent: number;
  totalTrades: number;
  successRate: number;
  sharpeRatio: number;
  runDate: string;
}

const BacktestHistory: React.FC = () => {
  // Mock historical backtest data
  const [backtests] = useState<HistoricalBacktest[]>([
    {
      id: '1',
      constraintName: 'Tech Growth Strategy',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      totalReturn: 2450.75,
      totalReturnPercent: 24.51,
      totalTrades: 45,
      successRate: 68.9,
      sharpeRatio: 1.34,
      runDate: '2024-01-15'
    },
    {
      id: '2',
      constraintName: 'Defensive Value Play',
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      totalReturn: -345.20,
      totalReturnPercent: -3.45,
      totalTrades: 23,
      successRate: 43.5,
      sharpeRatio: 0.67,
      runDate: '2024-01-10'
    },
    {
      id: '3',
      constraintName: 'Momentum Trading',
      startDate: '2023-03-01',
      endDate: '2023-11-30',
      totalReturn: 1876.30,
      totalReturnPercent: 18.76,
      totalTrades: 67,
      successRate: 71.6,
      sharpeRatio: 1.89,
      runDate: '2024-01-08'
    },
    {
      id: '4',
      constraintName: 'Dividend Aristocrats',
      startDate: '2023-01-01',
      endDate: '2023-10-31',
      totalReturn: 567.85,
      totalReturnPercent: 5.68,
      totalTrades: 18,
      successRate: 77.8,
      sharpeRatio: 0.92,
      runDate: '2024-01-05'
    },
    {
      id: '5',
      constraintName: 'Small Cap Growth',
      startDate: '2023-04-01',
      endDate: '2023-12-31',
      totalReturn: 3210.45,
      totalReturnPercent: 32.10,
      totalTrades: 89,
      successRate: 65.2,
      sharpeRatio: 2.15,
      runDate: '2024-01-03'
    }
  ]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewResults = (backtestId: string) => {
    // In a real app, this would navigate to the detailed results
    // TODO: Navigate to detailed results page
  };

  const handleDeleteBacktest = (backtestId: string, constraintName: string) => {
    if (window.confirm(`Are you sure you want to delete the backtest for "${constraintName}"?`)) {
      // TODO: Implement backtest deletion
    }
  };

  if (backtests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Backtest History</h3>
        <p className="text-gray-600">
          Run your first backtest to see historical results here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Backtests</p>
              <p className="text-2xl font-bold text-gray-900">{backtests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Return</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(
                  backtests.reduce((sum, bt) => sum + bt.totalReturnPercent, 0) / backtests.length
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Return</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(Math.max(...backtests.map(bt => bt.totalReturnPercent)))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(backtests.reduce((sum, bt) => sum + bt.successRate, 0) / backtests.length).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Backtest History Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Backtest History</h3>
          <div className="text-sm text-gray-600">
            {backtests.length} backtests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sharpe Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Run Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backtests.map((backtest) => (
                <tr key={backtest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{backtest.constraintName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(backtest.startDate)}</div>
                    <div className="text-gray-500">to {formatDate(backtest.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${
                      backtest.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(backtest.totalReturn)}
                    </div>
                    <div className={`text-sm ${
                      backtest.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(backtest.totalReturnPercent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backtest.totalTrades}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backtest.successRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backtest.sharpeRatio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(backtest.runDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewResults(backtest.id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="View results"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBacktest(backtest.id, backtest.constraintName)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete backtest"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacktestHistory;