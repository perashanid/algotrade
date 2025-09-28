import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Target, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { constraintsService } from '../../services/constraints';
import { CreateConstraintRequest } from '../../types';
import { useInvalidateQueries } from '../../hooks/useInvalidateQueries';
import StockSearchInput from '../Common/StockSearchInput';
import toast from 'react-hot-toast';

const CreateConstraint: React.FC = () => {
  const navigate = useNavigate();
  const { invalidateConstraintData } = useInvalidateQueries();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateConstraintRequest>({
    stockSymbol: '',
    buyTriggerPercent: -5,
    sellTriggerPercent: 10,
    profitTriggerPercent: undefined,
    buyAmount: 1000,
    sellAmount: 500
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Stock Symbol validation
    if (!formData.stockSymbol.trim()) {
      newErrors.stockSymbol = 'Stock symbol is required';
    } else if (!/^[A-Z]{1,5}$/.test(formData.stockSymbol.toUpperCase())) {
      newErrors.stockSymbol = 'Enter a valid stock symbol (1-5 letters)';
    }

    // Buy trigger validation
    if (formData.buyTriggerPercent >= 0) {
      newErrors.buyTriggerPercent = 'Buy trigger must be negative (price drop)';
    } else if (formData.buyTriggerPercent < -50) {
      newErrors.buyTriggerPercent = 'Buy trigger cannot be less than -50%';
    }

    // Sell trigger validation
    if (formData.sellTriggerPercent <= 0) {
      newErrors.sellTriggerPercent = 'Sell trigger must be positive (price rise)';
    } else if (formData.sellTriggerPercent > 100) {
      newErrors.sellTriggerPercent = 'Sell trigger cannot be more than 100%';
    }

    // Profit trigger validation
    if (formData.profitTriggerPercent !== undefined) {
      if (formData.profitTriggerPercent <= 0) {
        newErrors.profitTriggerPercent = 'Profit trigger must be positive';
      } else if (formData.profitTriggerPercent > 500) {
        newErrors.profitTriggerPercent = 'Profit trigger cannot be more than 500%';
      }
    }

    // Amount validations
    if (formData.buyAmount <= 0) {
      newErrors.buyAmount = 'Buy amount must be positive';
    } else if (formData.buyAmount > 100000) {
      newErrors.buyAmount = 'Buy amount cannot exceed $100,000';
    }

    if (formData.sellAmount <= 0) {
      newErrors.sellAmount = 'Sell amount must be positive';
    } else if (formData.sellAmount > 100000) {
      newErrors.sellAmount = 'Sell amount cannot exceed $100,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const constraintData = {
        ...formData,
        stockSymbol: formData.stockSymbol.toUpperCase(),
        profitTriggerPercent: formData.profitTriggerPercent || undefined
      };
      
      await constraintsService.createConstraint(constraintData);
      
      // Invalidate React Query cache to refresh all constraint-related data
      await invalidateConstraintData();
      
      toast.success('Constraint created successfully!');
      navigate('/constraints');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create constraint');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateConstraintRequest, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          to="/constraints"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Constraints
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Constraint</h1>
        <p className="text-gray-600 mt-1">Set up automated trading rules for a stock symbol</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Symbol */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
            <div>
              <label className="label">
                Stock Symbol *
              </label>
              <StockSearchInput
                onStockSelect={(stock) => handleInputChange('stockSymbol', stock)}
                placeholder="Search by company name or symbol (e.g., Apple, AAPL)..."
                className={errors.stockSymbol ? 'border-red-500' : ''}
              />
              {formData.stockSymbol && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Selected: <strong>{formData.stockSymbol}</strong>
                  </p>
                </div>
              )}
              {errors.stockSymbol && (
                <p className="error-text">{errors.stockSymbol}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Search and select a stock from the dropdown
              </p>
            </div>
          </div>

          {/* Buy Trigger */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Buy Trigger (Price Drop)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Trigger Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.buyTriggerPercent}
                    onChange={(e) => handleInputChange('buyTriggerPercent', parseFloat(e.target.value))}
                    className={`input pr-8 ${errors.buyTriggerPercent ? 'border-red-500' : ''}`}
                    step="0.1"
                    min="-50"
                    max="-0.1"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.buyTriggerPercent && (
                  <p className="error-text">{errors.buyTriggerPercent}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Buy when price drops by this percentage
                </p>
              </div>

              <div>
                <label className="label">
                  Buy Amount *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.buyAmount}
                    onChange={(e) => handleInputChange('buyAmount', parseFloat(e.target.value))}
                    className={`input pl-8 ${errors.buyAmount ? 'border-red-500' : ''}`}
                    step="100"
                    min="100"
                    max="100000"
                  />
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.buyAmount && (
                  <p className="error-text">{errors.buyAmount}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Dollar amount to invest: {formatCurrency(formData.buyAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Sell Trigger */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Sell Trigger (Price Rise)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Trigger Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.sellTriggerPercent}
                    onChange={(e) => handleInputChange('sellTriggerPercent', parseFloat(e.target.value))}
                    className={`input pr-8 ${errors.sellTriggerPercent ? 'border-red-500' : ''}`}
                    step="0.1"
                    min="0.1"
                    max="100"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.sellTriggerPercent && (
                  <p className="error-text">{errors.sellTriggerPercent}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Sell when price rises by this percentage
                </p>
              </div>

              <div>
                <label className="label">
                  Sell Amount *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.sellAmount}
                    onChange={(e) => handleInputChange('sellAmount', parseFloat(e.target.value))}
                    className={`input pl-8 ${errors.sellAmount ? 'border-red-500' : ''}`}
                    step="100"
                    min="100"
                    max="100000"
                  />
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.sellAmount && (
                  <p className="error-text">{errors.sellAmount}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Dollar amount to sell: {formatCurrency(formData.sellAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Profit Target (Optional) */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Profit Target (Optional)</h3>
            </div>
            
            <div>
              <label className="label">
                Profit Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.profitTriggerPercent || ''}
                  onChange={(e) => handleInputChange('profitTriggerPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`input pr-8 ${errors.profitTriggerPercent ? 'border-red-500' : ''}`}
                  step="0.1"
                  min="0.1"
                  max="500"
                  placeholder="e.g., 15"
                />
                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.profitTriggerPercent && (
                <p className="error-text">{errors.profitTriggerPercent}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Sell when profit reaches this percentage (based on average cost)
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a demo trading platform. No real trades will be executed. 
                  Constraints will be evaluated against real market data for simulation purposes only.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Constraint'}
            </button>
            <Link
              to="/constraints"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateConstraint;