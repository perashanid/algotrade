import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ timeRange }) => {
  // Mock data - in a real app, this would come from an API
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
        pnl: Math.round(value - 10000)
      });
    }
    
    return data;
  };

  const data = generateMockData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-medium text-gray-900">
            Value: {formatCurrency(data.value)}
          </p>
          <p className={`text-sm font-medium ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            P&L: {formatCurrency(data.pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

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