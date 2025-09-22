import React, { useState } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ConstraintPosition } from '../../types';

interface StockPerformanceTableProps {
  positions: ConstraintPosition[];
}

type SortField = 'stockSymbol' | 'marketValue' | 'unrealizedPnl' | 'unrealizedPnlPercent' | 'quantity';
type SortDirection = 'asc' | 'desc';

const StockPerformanceTable: React.FC<StockPerformanceTableProps> = ({ positions }) => {
  const [sortField, setSortField] = useState<SortField>('unrealizedPnlPercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const activePositions = positions.filter(p => p.status === 'position');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPositions = [...activePositions].sort((a, b) => {
    let aValue: number | string = a[sortField];
    let bValue: number | string = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

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

  const formatNumber = (value: number, decimals: number = 4) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  if (activePositions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active positions to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('stockSymbol')}
            >
              <div className="flex items-center gap-1">
                Stock
                <SortIcon field="stockSymbol" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity')}
            >
              <div className="flex items-center gap-1">
                Quantity
                <SortIcon field="quantity" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('marketValue')}
            >
              <div className="flex items-center gap-1">
                Market Value
                <SortIcon field="marketValue" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('unrealizedPnl')}
            >
              <div className="flex items-center gap-1">
                Unrealized P&L
                <SortIcon field="unrealizedPnl" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('unrealizedPnlPercent')}
            >
              <div className="flex items-center gap-1">
                P&L %
                <SortIcon field="unrealizedPnlPercent" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Constraint
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPositions.map((position) => (
            <tr key={position.stockSymbol} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="font-medium text-gray-900">{position.stockSymbol}</div>
                  {position.currentPrice && (
                    <div className="ml-2 text-sm text-gray-500">
                      ${position.currentPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatNumber(position.quantity)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(position.marketValue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  {position.unrealizedPnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(position.unrealizedPnl)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${
                  position.unrealizedPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(position.unrealizedPnlPercent)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {position.constraintName || 'Individual'}
                </div>
                <div className="text-xs text-gray-500">
                  {position.constraintType === 'group' ? 'Group' : 'Individual'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockPerformanceTable;