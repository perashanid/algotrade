import React, { useState, useEffect } from 'react';
import { X, Save, TrendingDown, TrendingUp, Target, DollarSign } from 'lucide-react';

interface TriggerValues {
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}

interface EditTriggersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: TriggerValues) => Promise<void>;
  initialValues: TriggerValues;
  title: string;
  itemName: string; // e.g., "AAPL" or "Tech Stocks Group"
  itemType: 'constraint' | 'group' | 'stock'; // for different styling/labels
}

const EditTriggersModal: React.FC<EditTriggersModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  title,
  itemName,
  itemType
}) => {
  const [values, setValues] = useState<TriggerValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TriggerValues, string>>>({});

  // Update values when initialValues change
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues, isOpen]);

  const validateValues = (): boolean => {
    const newErrors: Partial<Record<keyof TriggerValues, string>> = {};

    if (values.buyTriggerPercent >= 0) {
      newErrors.buyTriggerPercent = 'Buy trigger should be negative (price drop)';
    }
    if (values.sellTriggerPercent <= 0) {
      newErrors.sellTriggerPercent = 'Sell trigger should be positive (price rise)';
    }
    if (values.buyAmount <= 0) {
      newErrors.buyAmount = 'Buy amount must be greater than 0';
    }
    if (values.sellAmount <= 0) {
      newErrors.sellAmount = 'Sell amount must be greater than 0';
    }
    if (values.profitTriggerPercent !== undefined && values.profitTriggerPercent <= 0) {
      newErrors.profitTriggerPercent = 'Profit target should be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateValues()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Error saving triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TriggerValues, value: number | undefined) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Editing triggers for <strong>{itemName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Values Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Buy: {formatPercent(values.buyTriggerPercent)} ({formatCurrency(values.buyAmount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Sell: {formatPercent(values.sellTriggerPercent)} ({formatCurrency(values.sellAmount)})</span>
              </div>
              {values.profitTriggerPercent && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Profit: {formatPercent(values.profitTriggerPercent)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Trigger */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">Buy Trigger</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Drop Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={values.buyTriggerPercent}
                    onChange={(e) => handleInputChange('buyTriggerPercent', parseFloat(e.target.value))}
                    className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.buyTriggerPercent ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    step="0.1"
                    placeholder="-5.0"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                </div>
                {errors.buyTriggerPercent && (
                  <p className="text-red-500 text-xs mt-1">{errors.buyTriggerPercent}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buy Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={values.buyAmount}
                    onChange={(e) => handleInputChange('buyAmount', parseFloat(e.target.value))}
                    className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.buyAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    step="100"
                    placeholder="1000"
                  />
                </div>
                {errors.buyAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.buyAmount}</p>
                )}
              </div>
            </div>

            {/* Sell Trigger */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">Sell Trigger</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Rise Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={values.sellTriggerPercent}
                    onChange={(e) => handleInputChange('sellTriggerPercent', parseFloat(e.target.value))}
                    className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.sellTriggerPercent ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    step="0.1"
                    placeholder="10.0"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                </div>
                {errors.sellTriggerPercent && (
                  <p className="text-red-500 text-xs mt-1">{errors.sellTriggerPercent}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sell Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={values.sellAmount}
                    onChange={(e) => handleInputChange('sellAmount', parseFloat(e.target.value))}
                    className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.sellAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    step="100"
                    placeholder="1000"
                  />
                </div>
                {errors.sellAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.sellAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profit Target */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Profit Target (Optional)</h4>
            </div>
            
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profit Target Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={values.profitTriggerPercent || ''}
                  onChange={(e) => handleInputChange('profitTriggerPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.profitTriggerPercent ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  step="0.1"
                  placeholder="15.0"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
              {errors.profitTriggerPercent && (
                <p className="text-red-500 text-xs mt-1">{errors.profitTriggerPercent}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to disable profit target
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTriggersModal;