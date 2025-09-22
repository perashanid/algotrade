import React, { useState } from 'react';
import { Play, Settings, Calendar, DollarSign, Target } from 'lucide-react';
import { ConstraintGroup } from '../../types';

interface BacktestFormProps {
  constraintGroups: ConstraintGroup[];
  onRunBacktest: (params: {
    constraintId: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }) => void;
  isRunning: boolean;
}

const BacktestForm: React.FC<BacktestFormProps> = ({ 
  constraintGroups, 
  onRunBacktest, 
  isRunning 
}) => {
  const [selectedConstraint, setSelectedConstraint] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default dates (1 year ago to today)
  React.useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedConstraint) {
      newErrors.constraint = 'Please select a constraint group to backtest';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.dateRange = 'Start date must be before end date';
    }

    if (initialCapital <= 0) {
      newErrors.initialCapital = 'Initial capital must be greater than 0';
    }

    // Check if date range is too short
    if (startDate && endDate) {
      const daysDiff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) {
        newErrors.dateRange = 'Date range must be at least 30 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onRunBacktest({
        constraintId: selectedConstraint,
        startDate,
        endDate,
        initialCapital
      });
    }
  };

  const selectedGroup = constraintGroups.find(g => g.id === selectedConstraint);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Constraint Selection */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Constraint Group</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {constraintGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedConstraint(group.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedConstraint === group.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {group.description && (
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buy Trigger:</span>
                    <span className="ml-1 text-red-600 font-medium">
                      {formatPercent(group.buyTriggerPercent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sell Trigger:</span>
                    <span className="ml-1 text-green-600 font-medium">
                      {formatPercent(group.sellTriggerPercent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Buy Amount:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(group.buyAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stocks:</span>
                    <span className="ml-1 font-medium">
                      {group.stocks.length + group.stockGroups.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.constraint && (
            <p className="text-red-600 text-sm mt-2">{errors.constraint}</p>
          )}
        </div>

        {/* Backtest Parameters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backtest Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Initial Capital
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                min="1000"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.initialCapital ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.initialCapital && (
                <p className="text-red-600 text-sm mt-1">{errors.initialCapital}</p>
              )}
            </div>
          </div>

          {errors.dateRange && (
            <p className="text-red-600 text-sm mt-2">{errors.dateRange}</p>
          )}
        </div>

        {/* Selected Constraint Summary */}
        {selectedGroup && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Backtest Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Strategy:</span>
                <span className="ml-2 font-medium text-blue-900">{selectedGroup.name}</span>
              </div>
              <div>
                <span className="text-blue-700">Period:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {startDate && endDate && 
                    `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  }
                </span>
              </div>
              <div>
                <span className="text-blue-700">Initial Capital:</span>
                <span className="ml-2 font-medium text-blue-900">{formatCurrency(initialCapital)}</span>
              </div>
              <div>
                <span className="text-blue-700">Stocks to Trade:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {selectedGroup.stocks.length + selectedGroup.stockGroups.length} stocks
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Run Backtest Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isRunning}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-lg font-medium"
          >
            <Play className="h-5 w-5" />
            {isRunning ? 'Running Backtest...' : 'Run Backtest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BacktestForm;