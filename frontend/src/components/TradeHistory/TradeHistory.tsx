import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, TrendingDown, Target, Search } from 'lucide-react';
import { TradeHistory as TradeHistoryType } from '../../types';

// Mock data
const mockTrades: TradeHistoryType[] = [
  {
    id: 'trade-1',
    userId: 'user-1',
    constraintId: 'constraint-1',
    stockSymbol: 'AAPL',
    tradeType: 'BUY',
    triggerType: 'PRICE_DROP',
    quantity: 10,
    price: 150.50,
    triggerPrice: 145.00,
    executedAt: new Date().toISOString()
  },
  {
    id: 'trade-2',
    userId: 'user-1',
    constraintId: 'constraint-2',
    stockSymbol: 'GOOGL',
    tradeType: 'SELL',
    triggerType: 'PRICE_RISE',
    quantity: 5,
    price: 2800.75,
    triggerPrice: 2750.00,
    executedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'trade-3',
    userId: 'user-1',
    constraintId: 'constraint-3',
    stockSymbol: 'MSFT',
    tradeType: 'BUY',
    triggerType: 'PRICE_DROP',
    quantity: 15,
    price: 380.25,
    triggerPrice: 375.00,
    executedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'trade-4',
    userId: 'user-1',
    constraintId: 'constraint-4',
    stockSymbol: 'TSLA',
    tradeType: 'SELL',
    triggerType: 'PROFIT_TARGET',
    quantity: 8,
    price: 245.80,
    triggerPrice: 240.00,
    executedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

const TradeHistory: React.FC = () => {
  const [trades] = useState<TradeHistoryType[]>(mockTrades);
  const [filteredTrades, setFilteredTrades] = useState<TradeHistoryType[]>(mockTrades);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = trades;
    
    if (searchTerm) {
      filtered = filtered.filter(trade =>
        trade.stockSymbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTrades(filtered);
  }, [trades, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate summary statistics
  const totalTrades = filteredTrades.length;
  const buyTrades = filteredTrades.filter(t => t.tradeType === 'BUY').length;
  const sellTrades = filteredTrades.filter(t => t.tradeType === 'SELL').length;
  const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade History</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Complete record of all executed trades</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by stock symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTrades}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Buy Orders</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{buyTrades}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sell Orders</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{sellTrades}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Trade Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trade Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filteredTrades.length} trades
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrades.map((trade) => {
                const dateTime = new Date(trade.executedAt);
                const total = trade.quantity * trade.price;
                
                const getTriggerIcon = (triggerType: string) => {
                  switch (triggerType) {
                    case 'PRICE_DROP':
                      return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
                    case 'PRICE_RISE':
                      return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
                    case 'PROFIT_TARGET':
                      return <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                    default:
                      return null;
                  }
                };

                const getTriggerLabel = (triggerType: string) => {
                  switch (triggerType) {
                    case 'PRICE_DROP':
                      return 'Price Drop';
                    case 'PRICE_RISE':
                      return 'Price Rise';
                    case 'PROFIT_TARGET':
                      return 'Profit Target';
                    default:
                      return triggerType;
                  }
                };
                
                return (
                  <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {dateTime.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {dateTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{trade.stockSymbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.tradeType === 'BUY' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {trade.tradeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(trade.triggerType)}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getTriggerLabel(trade.triggerType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {trade.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;