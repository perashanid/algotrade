import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, Activity, Calendar, RefreshCw } from 'lucide-react';
import { constraintPositionsService } from '../../services/constraintPositions';
import { constraintGroupsService } from '../../services/constraintGroups';
import { ConstraintPosition, ConstraintGroup } from '../../types';
import PerformanceChart from './PerformanceChart';
import ProfitLossChart from './ProfitLossChart';
import StockPerformanceTable from './StockPerformanceTable';
import TradingPanel from './TradingPanel';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RealTimeData {
  portfolio: {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    positionCount: number;
  };
  positions: Array<{
    stockSymbol: string;
    currentPrice: number;
    quantity: number;
    averageCost: number;
    marketValue: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    isPriceStale: boolean;
    constraintName?: string;
  }>;
  summary: {
    activePositions: number;
    profitablePositions: number;
    losingPositions: number;
    breakEvenPositions: number;
  };
  topPerformers: Array<{
    stockSymbol: string;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    isPriceStale: boolean;
    constraintName?: string;
  }>;
  bottomPerformers: Array<{
    stockSymbol: string;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    isPriceStale: boolean;
    constraintName?: string;
  }>;
}

const Analytics: React.FC = () => {
  const [positions, setPositions] = useState<ConstraintPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [quickTradeSymbol, setQuickTradeSymbol] = useState<string>('');
  const [quickTradeType, setQuickTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    loadData();
    
    // Set up smart auto-refresh based on market hours
    const setupAutoRefresh = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Market hours: Monday-Friday 9:30 AM - 4:00 PM ET (approximate)
      const isMarketHours = day >= 1 && day <= 5 && hour >= 9 && hour <= 16;
      
      // Refresh more frequently during market hours
      const refreshInterval = isMarketHours ? 2 * 60 * 1000 : 10 * 60 * 1000; // 2 min vs 10 min
      
      return setInterval(() => {
        loadData(true);
      }, refreshInterval);
    };
    
    const interval = setupAutoRefresh();
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async (refreshPrices: boolean = false) => {
    try {
      setLoading(true);
      
      // Load real-time analytics data
      const realTimeResponse = await api.get('/analytics/real-time');
      
      if (realTimeResponse.data.success && realTimeResponse.data.data) {
        const data: RealTimeData = realTimeResponse.data.data;
        setRealTimeData(data);
        
        // Convert positions to ConstraintPosition format for compatibility
        const constraintPositions: ConstraintPosition[] = data.positions.map((pos) => ({
          stockSymbol: pos.stockSymbol,
          constraintType: 'individual' as const,
          isActive: true,
          buyTriggerPercent: 0,
          sellTriggerPercent: 0,
          profitTriggerPercent: 0,
          buyAmount: 0,
          sellAmount: 0,
          currentPrice: pos.currentPrice,
          quantity: pos.quantity,
          averageCost: pos.averageCost,
          marketValue: pos.marketValue,
          unrealizedPnl: pos.unrealizedPnl,
          unrealizedPnlPercent: pos.unrealizedPnlPercent,
          status: pos.quantity > 0 ? 'position' as const : 'watching' as const,
          isPriceStale: pos.isPriceStale,
          constraintName: pos.constraintName
        }));
        
        setPositions(constraintPositions);
      }
      
      setLastUpdated(new Date());
      
      if (refreshPrices) {
        toast.success('Analytics data refreshed with latest prices');
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to refresh analytics data');
      
      // Fallback to original method
      try {
        const dashboardData = await constraintPositionsService.getDashboardData();
        setPositions(dashboardData.constraintPositions);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
  };

  const handleQuickTrade = (symbol: string, type: 'buy' | 'sell') => {
    setQuickTradeSymbol(symbol);
    setQuickTradeType(type);
    toast.success(`Quick ${type} setup for ${symbol} - Check the trading panel`);
    
    // Scroll to trading panel
    const tradingPanel = document.querySelector('[data-trading-panel]');
    if (tradingPanel) {
      tradingPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  // Calculate analytics metrics from real-time data or fallback to positions
  const totalValue = realTimeData?.portfolio?.totalValue || positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalPnL = realTimeData?.portfolio?.totalGainLoss || positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalPnLPercent = realTimeData?.portfolio?.totalGainLossPercent || (totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0);
  const activePositions = realTimeData?.summary?.activePositions || positions.filter(p => p.status === 'position').length;
  const watchingStocks = positions.filter(p => p.status === 'watching').length;
  const triggeredStocks = positions.filter(p => p.status === 'triggered').length;
  
  // Check for stale data
  const stalePositions = positions.filter(p => p.isPriceStale && p.status === 'position').length;
  const hasStaleData = stalePositions > 0;

  const topPerformers = realTimeData?.topPerformers || positions
    .filter(p => p.status === 'position')
    .sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent)
    .slice(0, 5);

  const bottomPerformers = realTimeData?.bottomPerformers || positions
    .filter(p => p.status === 'position')
    .sort((a, b) => a.unrealizedPnlPercent - b.unrealizedPnlPercent)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lightest via-brand-light to-brand-medium dark:from-brand-950 dark:via-brand-900 dark:to-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600 dark:text-gray-300 text-lg">Performance insights and trading analytics</p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              {hasStaleData && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  {stalePositions} position{stalePositions !== 1 ? 's' : ''} with stale prices
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-darker hover:to-brand-dark disabled:opacity-50 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Prices'}
          </button>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-3 border-2 border-brand-300 dark:border-brand-800 bg-white dark:bg-brand-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-darkest dark:focus:ring-brand-light focus:border-transparent shadow-md transition-all"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-brand-light to-brand-medium dark:from-brand-800 dark:to-brand-700 rounded-xl">
                <DollarSign className="h-6 w-6 text-brand-700 dark:text-brand-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Total P&L</p>
                  {hasStaleData && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Some prices are stale"></div>
                  )}
                </div>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(totalPnL)}
                </p>
                <p className={`text-sm ${totalPnLPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPercent(totalPnLPercent)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className={`h-6 w-6 ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                ) : (
                  <TrendingDown className={`h-6 w-6 ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePositions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">{watchingStocks} watching</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Triggered Actions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{triggeredStocks}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">Recent triggers</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Trading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Performance</h3>
            </div>
            <PerformanceChart timeRange={timeRange} />
          </div>

          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">P&L Distribution</h3>
            </div>
            <ProfitLossChart positions={positions} />
          </div>

          <div data-trading-panel>
            <TradingPanel 
              onTradeComplete={() => {
                loadData(true);
                setQuickTradeSymbol(''); // Clear quick trade after completion
              }}
              quickTradeSymbol={quickTradeSymbol}
              quickTradeType={quickTradeType}
              onQuickTradeClear={() => {
                setQuickTradeSymbol('');
                setQuickTradeType('buy');
              }}
            />
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performers */}
          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Top Performers
            </h3>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((position) => (
                <div key={position.stockSymbol} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{position.stockSymbol}</p>
                      {position.isPriceStale && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Price data is stale"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{position.constraintName || 'Individual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(position.unrealizedPnl)}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{formatPercent(position.unrealizedPnlPercent)}</p>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-gray-500 dark:text-gray-300 text-center py-4">No active positions</p>
              )}
            </div>
          </div>

          {/* Bottom Performers */}
          <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              Bottom Performers
            </h3>
          <div className="space-y-3">
            {bottomPerformers.length > 0 ? (
              bottomPerformers.map((position) => (
                <div key={position.stockSymbol} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{position.stockSymbol}</p>
                      {position.isPriceStale && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Price data is stale"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{position.constraintName || 'Individual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600 dark:text-red-400">{formatCurrency(position.unrealizedPnl)}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{formatPercent(position.unrealizedPnlPercent)}</p>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-gray-500 dark:text-gray-300 text-center py-4">No active positions</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Stock Performance */}
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Performance Details</h3>
          <StockPerformanceTable positions={positions} onQuickTrade={handleQuickTrade} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;