import React from 'react';
import { TrendingDown, TrendingUp, Target, DollarSign } from 'lucide-react';
import { ConstraintGroup } from '../../../types';

interface GroupSummaryProps {
  group: ConstraintGroup;
  totalValue: number;
}

const GroupSummary: React.FC<GroupSummaryProps> = ({ group, totalValue }) => {
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-gray-600 dark:text-gray-300">Buy Trigger</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatPercent(group.buyTriggerPercent)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-gray-600 dark:text-gray-300">Sell Trigger</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatPercent(group.sellTriggerPercent)}
            </p>
          </div>
        </div>
        
        {group.profitTriggerPercent && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300">Profit Target</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatPercent(group.profitTriggerPercent)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-purple-500" />
          <div>
            <p className="text-gray-600 dark:text-gray-300">Total Value</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSummary;