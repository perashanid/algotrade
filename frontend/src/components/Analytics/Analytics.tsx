import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, Activity, Calendar } from 'lucide-react';
import { constraintPositionsService } from '../../services/constraintPositions';
import { constraintGroupsService } from '../../services/constraintGroups';
import { ConstraintPosition, ConstraintGroup } from '../../types';
import PerformanceChart from './PerformanceChart';
import ProfitLossChart from './ProfitLossChart';
import StockPerformanceTable from './StockPerformanceTable';

const Analytics: React.FC = () => {
  const [positions, setPositions] = useState<ConstraintPosition[]>([]);
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [positionsData, groupsData] = await Promise.all([
        constraintPositionsService.getConstraintPositions(),
        constraintGroupsService.getConstraintGroups()
      ]);
      setPositions(positionsData);
      setConstraintGroups(groupsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
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

  // Calculate analytics metrics
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
  const activePositions = positions.filter(p => p.status === 'position').length;
  const watchingStocks = positions.filter(p => p.status === 'watching').length;
  const triggeredStocks = positions.filter(p => p.status === 'triggered').length;

  const topPerformers = positions
    .filter(p => p.status === 'position')
    .sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent)
    .slice(0, 5);

  const bottomPerformers = positions
    .filter(p => p.status === 'position')
    .sort((a, b) => a.unrealizedPnlPercent - b.unrealizedPnlPercent)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Performance insights and trading analytics</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalPnL)}
              </p>
              <p className={`text-sm ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(totalPnLPercent)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalPnL >= 0 ? (
                <TrendingUp className={`h-6 w-6 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              ) : (
                <TrendingDown className={`h-6 w-6 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Positions</p>
              <p className="text-2xl font-bold text-gray-900">{activePositions}</p>
              <p className="text-sm text-gray-500">{watchingStocks} watching</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Triggered Actions</p>
              <p className="text-2xl font-bold text-gray-900">{triggeredStocks}</p>
              <p className="text-sm text-gray-500">Recent triggers</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance</h3>
          </div>
          <PerformanceChart timeRange={timeRange} />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">P&L Distribution</h3>
          </div>
          <ProfitLossChart positions={positions} />
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((position) => (
                <div key={position.stockSymbol} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{position.stockSymbol}</p>
                    <p className="text-sm text-gray-600">{position.constraintName || 'Individual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(position.unrealizedPnl)}</p>
                    <p className="text-sm text-green-600">{formatPercent(position.unrealizedPnlPercent)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active positions</p>
            )}
          </div>
        </div>

        {/* Bottom Performers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Bottom Performers
          </h3>
          <div className="space-y-3">
            {bottomPerformers.length > 0 ? (
              bottomPerformers.map((position) => (
                <div key={position.stockSymbol} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{position.stockSymbol}</p>
                    <p className="text-sm text-gray-600">{position.constraintName || 'Individual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(position.unrealizedPnl)}</p>
                    <p className="text-sm text-red-600">{formatPercent(position.unrealizedPnlPercent)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active positions</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stock Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Performance Details</h3>
        <StockPerformanceTable positions={positions} />
      </div>
    </div>
  );
};

export default Analytics;