import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ConstraintPosition } from '../../types';

interface ProfitLossChartProps {
  positions: ConstraintPosition[];
}

const ProfitLossChart: React.FC<ProfitLossChartProps> = ({ positions }) => {
  const activePositions = positions.filter(p => p.status === 'position');
  
  const profitablePositions = activePositions.filter(p => p.unrealizedPnl > 0);
  const breakEvenPositions = activePositions.filter(p => p.unrealizedPnl === 0);
  const losingPositions = activePositions.filter(p => p.unrealizedPnl < 0);

  const data = [
    {
      name: 'Profitable',
      value: profitablePositions.length,
      color: '#10b981',
      amount: profitablePositions.reduce((sum, p) => sum + p.unrealizedPnl, 0)
    },
    {
      name: 'Break Even',
      value: breakEvenPositions.length,
      color: '#6b7280',
      amount: 0
    },
    {
      name: 'Losing',
      value: losingPositions.length,
      color: '#ef4444',
      amount: losingPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0)
    }
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Positions: {data.value}</p>
          {data.amount !== 0 && (
            <p className={`text-sm font-medium ${data.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Total: {formatCurrency(data.amount)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.value} ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No active positions to display</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossChart;