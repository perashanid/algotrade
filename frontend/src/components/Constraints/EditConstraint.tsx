import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Target, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { constraintsService } from '../../services/constraints';
import { TradingConstraint, UpdateConstraintRequest } from '../../types';
import toast from 'react-hot-toast';

const EditConstraint: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [constraint, setConstraint] = useState<TradingConstraint | null>(null);
  const [formData, setFormData] = useState<UpdateConstraintRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadConstraint();
    }
  }, [id]);

  const loadConstraint = async () => {
    try {
      setInitialLoading(true);
      const constraints = await constraintsService.getConstraints();
      const foundConstraint = constraints.find(c => c.id === id);
      
      if (!foundConstraint) {
        toast.error('Constraint not found');
        navigate('/constraints');
        return;
      }

      setConstraint(foundConstraint);
      setFormData({
        buyTriggerPercent: foundConstraint.buyTriggerPercent,
        sellTriggerPercent: foundConstraint.sellTriggerPercent,
        profitTriggerPercent: foundConstraint.profitTriggerPercent,
        buyAmount: foundConstraint.buyAmount,
        sellAmount: foundConstraint.sellAmount,
        isActive: foundConstraint.isActive
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load constraint');
      navigate('/constraints');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Buy trigger validation
    if (formData.buyTriggerPercent !== undefined) {
      if (formData.buyTriggerPercent >= 0) {
        newErrors.buyTriggerPercent = 'Buy trigger must be negative (price drop)';
      } else if (formData.buyTriggerPercent < -50) {
        newErrors.buyTriggerPercent = 'Buy trigger cannot be less than -50%';
      }
    }

    // Sell trigger validation
    if (formData.sellTriggerPercent !== undefined) {
      if (formData.sellTriggerPercent <= 0) {
        newErrors.sellTriggerPercent = 'Sell trigger must be positive (price rise)';
      } else if (formData.sellTriggerPercent > 100) {
        newErrors.sellTriggerPercent = 'Sell trigger cannot be more than 100%';
      }
    }

    // Profit trigger validation
    if (formData.profitTriggerPercent !== undefined && formData.profitTriggerPercent !== null) {
      if (formData.profitTriggerPercent <= 0) {
        newErrors.profitTriggerPercent = 'Profit trigger must be positive';
      } else if (formData.profitTriggerPercent > 500) {
        newErrors.profitTriggerPercent = 'Profit trigger cannot be more than 500%';
      }
    }

    // Amount validations
    if (formData.buyAmount !== undefined) {
      if (formData.buyAmount <= 0) {
        newErrors.buyAmount = 'Buy amount must be positive';
      } else if (formData.buyAmount > 100000) {
        newErrors.buyAmount = 'Buy amount cannot exceed $100,000';
      }
    }

    if (formData.sellAmount !== undefined) {
      if (formData.sellAmount <= 0) {
        newErrors.sellAmount = 'Sell amount must be positive';
      } else if (formData.sellAmount > 100000) {
        newErrors.sellAmount = 'Sell amount cannot exceed $100,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await constraintsService.updateConstraint(id, formData);
      toast.success('Constraint updated successfully!');
      navigate('/constraints');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateConstraintRequest, value: string | number | boolean | undefined) => {
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

  if (initialLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!constraint) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Constraint not found</p>
          <Link to="/constraints" className="text-blue-600 hover:text-blue-700">
            Back to Constraints
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Constraint</h1>
        <p className="text-gray-600 mt-1">Modify trading rules for {constraint.stockSymbol}</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Toggle */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive ?? constraint.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active constraint
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              When active, this constraint will be evaluated during market hours
            </p>
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
                  Trigger Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.buyTriggerPercent ?? constraint.buyTriggerPercent}
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
              </div>

              <div>
                <label className="label">
                  Buy Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.buyAmount ?? constraint.buyAmount}
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
                  {formatCurrency(formData.buyAmount ?? constraint.buyAmount)}
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
                  Trigger Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.sellTriggerPercent ?? constraint.sellTriggerPercent}
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
              </div>

              <div>
                <label className="label">
                  Sell Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.sellAmount ?? constraint.sellAmount}
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
                  {formatCurrency(formData.sellAmount ?? constraint.sellAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Profit Target */}
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
                  value={formData.profitTriggerPercent ?? constraint.profitTriggerPercent ?? ''}
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
                Leave empty to disable profit target
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Constraint'}
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

export default EditConstraint;