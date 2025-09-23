import React from 'react';
import { Portfolio } from '../../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Value */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolio.totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Gain/Loss */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Gain/Loss</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(portfolio.totalGainLoss)}
            </p>
          </div>
        </div>
      </div>

      {/* Percentage Return */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Return</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Position Count */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Positions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolio.positions.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;