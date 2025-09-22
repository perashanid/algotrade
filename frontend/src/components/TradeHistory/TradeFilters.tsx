import React from 'react';
import { Calendar, DollarSign, Filter } from 'lucide-react';

interface TradeFiltersProps {
  filters: {
    dateRange: '7d' | '30d' | '90d' | '1y' | 'all';
    tradeType: 'all' | 'BUY' | 'SELL';
    triggerType: 'all' | 'PRICE_DROP' | 'PRICE_RISE' | 'PROFIT_TARGET';
    stockSymbol: string;
    minAmount: string;
    maxAmount: string;
  };
  onFiltersChange: (filters: any) => void;
}

const TradeFilters: React.FC<TradeFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: 'all',
      tradeType: 'all',
      triggerType: 'all',
      stockSymbol: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="ml-auto text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Trade Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type</label>
          <select
            value={filters.tradeType}
            onChange={(e) => handleFilterChange('tradeType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Types</option>
            <option value="BUY">Buy Orders</option>
            <option value="SELL">Sell Orders</option>
          </select>
        </div>

        {/* Trigger Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
          <select
            value={filters.triggerType}
            onChange={(e) => handleFilterChange('triggerType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Triggers</option>
            <option value="PRICE_DROP">Price Drop</option>
            <option value="PRICE_RISE">Price Rise</option>
            <option value="PROFIT_TARGET">Profit Target</option>
          </select>
        </div>

        {/* Stock Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
          <input
            type="text"
            value={filters.stockSymbol}
            onChange={(e) => handleFilterChange('stockSymbol', e.target.value)}
            placeholder="e.g., AAPL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Min Amount
          </label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            placeholder="0"
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Max Amount
          </label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            placeholder="No limit"
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default TradeFilters;