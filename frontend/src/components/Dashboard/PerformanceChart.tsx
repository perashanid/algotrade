import React from 'react';
import { PerformanceMetrics } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface PerformanceChartProps {
  performance: PerformanceMetrics;
  loading?: boolean;
  error?: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  performance, 
  loading, 
  error 
}) => {
  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load performance data</p>
      </div>
    );
  }

  const timeRanges = [
    { label: '1D', value: performance.dayReturnPercent },
    { label: '1W', value: performance.weekReturnPercent },
    { label: '1M', value: performance.monthReturnPercent },
    { label: '1Y', value: performance.yearReturnPercent },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Return</p>
          <p className={clsx(
            'text-2xl font-bold',
            performance.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
          )}>
            {formatCurrency(performance.totalReturn)}
          </p>
          <p className={clsx(
            'text-sm',
            performance.totalReturnPercent >= 0 ? 'text-success-600' : 'text-danger-600'
          )}>
            {formatPercent(performance.totalReturnPercent)}
          </p>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">vs Benchmark</p>
          <p className={clsx(
            'text-2xl font-bold',
            performance.benchmarkComparison >= 0 ? 'text-success-600' : 'text-danger-600'
          )}>
            {formatPercent(performance.benchmarkComparison)}
          </p>
          <p className="text-sm text-gray-600">
            {performance.benchmarkComparison >= 0 ? 'Outperforming' : 'Underperforming'}
          </p>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Sharpe Ratio</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performance.sharpeRatio?.toFixed(2) || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">Risk-adjusted return</p>
        </div>
      </div>

      {/* Time Range Performance */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Time Range</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {timeRanges.map((range) => {
            const isPositive = range.value >= 0;
            return (
              <div key={range.label} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{range.label}</p>
                <div className={clsx(
                  'flex items-center justify-center mb-1',
                  isPositive ? 'text-success-600' : 'text-danger-600'
                )}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-semibold">
                    {formatPercent(range.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Metrics */}
      {performance.maxDrawdown !== undefined && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Max Drawdown</p>
              <p className="text-xl font-semibold text-danger-600">
                {formatPercent(performance.maxDrawdown)}
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Volatility</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {Math.abs(performance.totalReturnPercent * 0.3).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;