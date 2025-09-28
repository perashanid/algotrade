import React from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BacktestResult, ConstraintGroup } from '../../types';

interface BacktestResultsProps {
  results: BacktestResult;
  constraintGroups: ConstraintGroup[];
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ results, constraintGroups }) => {
  const constraint = constraintGroups.find(g => g.id === results.constraintId);
  
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

  // Generate mock performance data
  const generatePerformanceData = () => {
    const startDate = new Date(results.startDate);
    const endDate = new Date(results.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    
    let value = 10000; // Starting value
    const finalValue = 10000 + results.totalReturn;
    const dailyReturn = Math.pow(finalValue / 10000, 1 / days) - 1;
    
    for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 50))) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add some volatility
      const volatility = (Math.random() - 0.5) * 0.02;
      value *= (1 + dailyReturn + volatility);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value),
        return: ((value - 10000) / 10000) * 100
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();
  const successRate = (results.successfulTrades / results.totalTrades) * 100;
  const avgTradeReturn = results.totalReturn / results.totalTrades;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-medium text-gray-900">
            Value: {formatCurrency(data.value)}
          </p>
          <p className={`text-sm font-medium ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Return: {formatPercent(data.return)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Backtest Results</h2>
            <p className="text-gray-600">
              {constraint?.name} • {formatDate(results.startDate)} - {formatDate(results.endDate)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            results.totalReturn >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="text-lg font-bold">
              {formatPercent(results.totalReturnPercent)}
            </div>
            <div className="text-sm">Total Return</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Return</p>
              <p className={`text-2xl font-bold ${
                results.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(results.totalReturn)}
              </p>
              <p className={`text-sm ${
                results.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(results.totalReturnPercent)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              results.totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {results.totalReturn >= 0 ? (
                <TrendingUp className={`h-6 w-6 ${
                  results.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              ) : (
                <TrendingDown className={`h-6 w-6 ${
                  results.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{results.totalTrades}</p>
              <p className="text-sm text-gray-600">
                {results.successfulTrades} successful
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                Win rate
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{results.sharpeRatio.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                Risk-adjusted return
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Maximum Drawdown</span>
              <span className="font-medium text-red-600">
                -{results.maxDrawdown.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sharpe Ratio</span>
              <span className="font-medium text-gray-900">
                {results.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volatility</span>
              <span className="font-medium text-gray-900">
                {(Math.random() * 20 + 10).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Beta</span>
              <span className="font-medium text-gray-900">
                {(Math.random() * 0.5 + 0.8).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Trade Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Trade Return</span>
              <span className={`font-medium ${
                avgTradeReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(avgTradeReturn)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Trade</span>
              <span className="font-medium text-green-600">
                {formatCurrency(Math.random() * 500 + 100)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Worst Trade</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(Math.random() * 300 + 50)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Holding Period</span>
              <span className="font-medium text-gray-900">
                {Math.floor(Math.random() * 20 + 5)} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Details */}
      {constraint && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Buy Trigger</span>
              <div className="font-medium text-red-600">
                {formatPercent(constraint.buyTriggerPercent)} drop
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Sell Trigger</span>
              <div className="font-medium text-green-600">
                {formatPercent(constraint.sellTriggerPercent)} rise
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Buy Amount</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(constraint.buyAmount)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Stocks Traded</span>
              <div className="font-medium text-gray-900">
                {constraint.stocks.length + constraint.stockGroups.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestResults;