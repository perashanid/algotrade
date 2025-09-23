import React, { useState, useEffect } from 'react';
import { Play, Settings, Calendar, DollarSign, Target, Plus, User, Users, Search } from 'lucide-react';
import { ConstraintGroup, TradingConstraint } from '../../types';
import StockSearchInput from '../Common/StockSearchInput';

interface BacktestFormProps {
  constraintGroups: ConstraintGroup[];
  onRunBacktest: (params: {
    constraintId?: string;
    constraintType: 'group' | 'individual' | 'custom';
    customConstraint?: {
      stocks: string[];
      buyTriggerPercent: number;
      sellTriggerPercent: number;
      profitTriggerPercent?: number;
      buyAmount: number;
      sellAmount: number;
    };
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
  const [constraintType, setConstraintType] = useState<'group' | 'individual' | 'custom'>('group');
  const [selectedConstraint, setSelectedConstraint] = useState('');
  const [individualConstraints, setIndividualConstraints] = useState<TradingConstraint[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom constraint state
  const [customStocks, setCustomStocks] = useState<string[]>([]);
  const [customBuyTrigger, setCustomBuyTrigger] = useState(-5);
  const [customSellTrigger, setCustomSellTrigger] = useState(10);
  const [customProfitTrigger, setCustomProfitTrigger] = useState(15);
  const [customBuyAmount, setCustomBuyAmount] = useState(1000);
  const [customSellAmount, setCustomSellAmount] = useState(1000);
  const [newStockSymbol, setNewStockSymbol] = useState('');

  // Set default dates (1 year ago to today)
  useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
  }, []);

  // Load individual constraints
  useEffect(() => {
    const loadIndividualConstraints = async () => {
      try {
        const { constraintsService } = await import('../../services/constraints');
        const constraints = await constraintsService.getConstraints();
        setIndividualConstraints(constraints);
      } catch (error) {
        console.error('Failed to load individual constraints:', error);
      }
    };

    if (constraintType === 'individual') {
      loadIndividualConstraints();
    }
  }, [constraintType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate constraint selection based on type
    if (constraintType === 'group' && !selectedConstraint) {
      newErrors.constraint = 'Please select a constraint group to backtest';
    } else if (constraintType === 'individual' && !selectedConstraint) {
      newErrors.constraint = 'Please select an individual constraint to backtest';
    } else if (constraintType === 'custom') {
      if (customStocks.length === 0) {
        newErrors.customStocks = 'Please add at least one stock to your custom constraint';
      }
      if (customBuyAmount <= 0) {
        newErrors.customBuyAmount = 'Buy amount must be greater than 0';
      }
      if (customSellAmount <= 0) {
        newErrors.customSellAmount = 'Sell amount must be greater than 0';
      }
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
      const params: any = {
        constraintType,
        startDate,
        endDate,
        initialCapital
      };

      if (constraintType === 'custom') {
        params.customConstraint = {
          stocks: customStocks,
          buyTriggerPercent: customBuyTrigger,
          sellTriggerPercent: customSellTrigger,
          profitTriggerPercent: customProfitTrigger,
          buyAmount: customBuyAmount,
          sellAmount: customSellAmount
        };
      } else {
        params.constraintId = selectedConstraint;
      }

      onRunBacktest(params);
    }
  };

  const handleAddStock = (stock: string) => {
    if (stock && !customStocks.includes(stock.toUpperCase())) {
      setCustomStocks([...customStocks, stock.toUpperCase()]);
      setNewStockSymbol('');
    }
  };

  const handleRemoveStock = (stock: string) => {
    setCustomStocks(customStocks.filter(s => s !== stock));
  };

  const selectedGroup = constraintGroups.find(g => g.id === selectedConstraint);
  const selectedIndividual = individualConstraints.find(c => c.id === selectedConstraint);

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
        {/* Constraint Type Selection */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Strategy</h3>
          </div>
          
          {/* Strategy Type Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setConstraintType('group');
                setSelectedConstraint('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                constraintType === 'group'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Constraint Groups
            </button>
            <button
              type="button"
              onClick={() => {
                setConstraintType('individual');
                setSelectedConstraint('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                constraintType === 'individual'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Individual Stocks
            </button>
            <button
              type="button"
              onClick={() => {
                setConstraintType('custom');
                setSelectedConstraint('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                constraintType === 'custom'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Plus className="h-4 w-4" />
              Create Custom
            </button>
          </div>

          {/* Constraint Groups */}
          {constraintType === 'group' && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Select from your existing constraint groups:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {constraintGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedConstraint(group.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedConstraint === group.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {group.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Buy Trigger:</span>
                        <span className="ml-1 text-red-600 dark:text-red-400 font-medium">
                          {formatPercent(group.buyTriggerPercent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sell Trigger:</span>
                        <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                          {formatPercent(group.sellTriggerPercent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Buy Amount:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(group.buyAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Stocks:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {group.stocks.length + group.stockGroups.length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Constraints */}
          {constraintType === 'individual' && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Select from your individual stock constraints:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {individualConstraints.map((constraint) => (
                  <div
                    key={constraint.id}
                    onClick={() => setSelectedConstraint(constraint.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedConstraint === constraint.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{constraint.stockSymbol}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        constraint.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {constraint.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Buy Trigger:</span>
                        <span className="ml-1 text-red-600 dark:text-red-400 font-medium">
                          {formatPercent(constraint.buyTriggerPercent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sell Trigger:</span>
                        <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                          {formatPercent(constraint.sellTriggerPercent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Buy Amount:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(constraint.buyAmount)}
                        </span>
                      </div>
                      {constraint.profitTriggerPercent && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Profit Target:</span>
                          <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">
                            {formatPercent(constraint.profitTriggerPercent)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {individualConstraints.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No individual constraints found. Create some constraints first to use this option.</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Constraint Builder */}
          {constraintType === 'custom' && (
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Create a custom constraint for backtesting:</h4>
              
              {/* Stock Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Select Stocks
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <StockSearchInput
                      onStockSelect={handleAddStock}
                      placeholder="Search and select stocks..."
                    />
                  </div>
                  <input
                    type="text"
                    value={newStockSymbol}
                    onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                    placeholder="Or type symbol"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStock(newStockSymbol);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddStock(newStockSymbol)}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Selected Stocks */}
                {customStocks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {customStocks.map((stock) => (
                      <span
                        key={stock}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        {stock}
                        <button
                          type="button"
                          onClick={() => handleRemoveStock(stock)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {errors.customStocks && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.customStocks}</p>
                )}
              </div>

              {/* Custom Constraint Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buy Trigger (%)
                  </label>
                  <input
                    type="number"
                    value={customBuyTrigger}
                    onChange={(e) => setCustomBuyTrigger(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sell Trigger (%)
                  </label>
                  <input
                    type="number"
                    value={customSellTrigger}
                    onChange={(e) => setCustomSellTrigger(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profit Target (%)
                  </label>
                  <input
                    type="number"
                    value={customProfitTrigger}
                    onChange={(e) => setCustomProfitTrigger(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buy Amount ($)
                  </label>
                  <input
                    type="number"
                    value={customBuyAmount}
                    onChange={(e) => setCustomBuyAmount(parseFloat(e.target.value) || 0)}
                    min="100"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.customBuyAmount && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.customBuyAmount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sell Amount ($)
                  </label>
                  <input
                    type="number"
                    value={customSellAmount}
                    onChange={(e) => setCustomSellAmount(parseFloat(e.target.value) || 0)}
                    min="100"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.customSellAmount && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.customSellAmount}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {errors.constraint && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-4">{errors.constraint}</p>
          )}
        </div>

        {/* Backtest Parameters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backtest Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${
                  errors.startDate ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${
                  errors.endDate ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Initial Capital
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                min="1000"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${
                  errors.initialCapital ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.initialCapital && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.initialCapital}</p>
              )}
            </div>
          </div>

          {errors.dateRange && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.dateRange}</p>
          )}
        </div>

        {/* Selected Constraint Summary */}
        {(selectedGroup || selectedIndividual || (constraintType === 'custom' && customStocks.length > 0)) && (
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Backtest Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Strategy:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-200">
                  {constraintType === 'group' && selectedGroup && selectedGroup.name}
                  {constraintType === 'individual' && selectedIndividual && `${selectedIndividual.stockSymbol} Individual`}
                  {constraintType === 'custom' && 'Custom Strategy'}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Period:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-200">
                  {startDate && endDate && 
                    `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  }
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Initial Capital:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-200">{formatCurrency(initialCapital)}</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Stocks to Trade:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-200">
                  {constraintType === 'group' && selectedGroup && `${selectedGroup.stocks.length + selectedGroup.stockGroups.length} stocks`}
                  {constraintType === 'individual' && selectedIndividual && '1 stock'}
                  {constraintType === 'custom' && `${customStocks.length} stocks`}
                </span>
              </div>
              {constraintType === 'custom' && customStocks.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-blue-700 dark:text-blue-300">Selected Stocks:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-200">
                    {customStocks.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Run Backtest Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isRunning}
            className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-lg font-medium"
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