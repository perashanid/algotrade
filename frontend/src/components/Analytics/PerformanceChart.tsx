import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

interface PerformanceChartProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
}

interface HistoricalDataPoint {
  timestamp: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positionCount: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ timeRange }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistoricalData();
  }, [timeRange]);

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/analytics/portfolio-history?timeRange=${timeRange}`);
      
      if (response.data.success && response.data.data) {
        const historicalData: HistoricalDataPoint[] = response.data.data;
        
        // Format data for the chart
        const formattedData = historicalData.map(point => {
          const date = new Date(point.timestamp);
          return {
            date: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(timeRange === '1y' && { year: '2-digit' })
            }),
            value: Math.round(point.totalValue),
            pnl: Math.round(point.totalGainLoss),
            pnlPercent: point.totalGainLossPercent,
            positions: point.positionCount,
            timestamp: point.timestamp
          };
        });
        
        setData(formattedData);
      } else {
        throw new Error('Failed to load historical data');
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      setError('Failed to load performance data');
      
      // Fallback to mock data
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data generator
  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = [];
    let value = 10000;
    
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * 200;
      value += change;
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(timeRange === '1y' && { year: '2-digit' })
        }),
        value: Math.round(value),
        pnl: Math.round(value - 10000),
        pnlPercent: ((value - 10000) / 10000) * 100,
        positions: Math.floor(Math.random() * 10) + 5
      });
    }
    
    return data;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Value: {formatCurrency(data.value)}
          </p>
          <p className={`text-sm font-medium ${data.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            P&L: {formatCurrency(data.pnl)} ({data.pnlPercent?.toFixed(2)}%)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Positions: {data.positions}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
          <button 
            onClick={loadHistoricalData}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
  );
};

export default PerformanceChart;