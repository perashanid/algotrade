import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TradeHistory } from '../../types';

interface TradeSummaryProps {
  trades: TradeHistory[];
}

const TradeSummary: React.FC<TradeSummaryProps> = ({ trades }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Group trades by month for the chart
  const monthlyData = trades.reduce((acc, trade) => {
    const date = new Date(trade.executedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        buyVolume: 0,
        sellVolume: 0,
        buyCount: 0,
        sellCount: 0
      };
    }
    
    const volume = trade.quantity * trade.price;
    if (trade.tradeType === 'BUY') {
      acc[monthKey].buyVolume += volume;
      acc[monthKey].buyCount += 1;
    } else {
      acc[monthKey].sellVolume += volume;
      acc[monthKey].sellCount += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(monthlyData).slice(-6); // Last 6 months

  // Trigger type distribution
  const triggerData = trades.reduce((acc, trade) => {
    const trigger = trade.triggerType;
    if (!acc[trigger]) {
      acc[trigger] = { name: trigger, value: 0, color: '' };
    }
    acc[trigger].value += 1;
    return acc;
  }, {} as Record<string, any>);

  const triggerChartData = Object.values(triggerData).map((item: any) => ({
    ...item,
    name: item.name === 'PRICE_DROP' ? 'Price Drop' : 
          item.name === 'PRICE_RISE' ? 'Price Rise' : 
          item.name === 'PROFIT_TARGET' ? 'Profit Target' : item.name,
    color: item.name === 'PRICE_DROP' ? '#ef4444' : 
           item.name === 'PRICE_RISE' ? '#10b981' : 
           item.name === 'PROFIT_TARGET' ? '#3b82f6' : '#6b7280'
  }));

  // Top traded stocks
  const stockData = trades.reduce((acc, trade) => {
    if (!acc[trade.stockSymbol]) {
      acc[trade.stockSymbol] = {
        symbol: trade.stockSymbol,
        volume: 0,
        trades: 0
      };
    }
    acc[trade.stockSymbol].volume += trade.quantity * trade.price;
    acc[trade.stockSymbol].trades += 1;
    return acc;
  }, {} as Record<string, any>);

  const topStocks = Object.values(stockData)
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No trades to summarize</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Volume Chart */}
      <div className="lg:col-span-2 card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trading Volume</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="buyVolume" fill="#10b981" name="Buy Volume" />
              <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trigger Type Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trigger Types</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={triggerChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {triggerChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {triggerChartData.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700">{entry.name}</span>
              </div>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Traded Stocks */}
      <div className="lg:col-span-3 card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Traded Stocks</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topStocks.map((stock: any, index) => (
            <div key={stock.symbol} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{stock.trades} trades</div>
              <div className="text-sm font-medium text-blue-600">
                {formatCurrency(stock.volume)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;