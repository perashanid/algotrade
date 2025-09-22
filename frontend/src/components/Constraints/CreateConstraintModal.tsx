import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, TrendingDown, TrendingUp, Target, DollarSign, Percent, AlertCircle, Search, Tag, Users } from 'lucide-react';
import { CreateConstraintGroupRequest, StockGroup } from '../../types';
import toast from 'react-hot-toast';

interface CreateConstraintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (constraint: CreateConstraintGroupRequest) => Promise<void>;
  stockGroups: StockGroup[];
}

const CreateConstraintModal: React.FC<CreateConstraintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stockGroups
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateConstraintGroupRequest>({
    name: '',
    description: '',
    buyTriggerPercent: -5,
    sellTriggerPercent: 10,
    profitTriggerPercent: undefined,
    buyAmount: 1000,
    sellAmount: 500,
    stocks: [],
    stockGroups: []
  });

  const [stockSearch, setStockSearch] = useState('');
  const [customStock, setCustomStock] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Popular stocks for quick selection
  const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'JPM', 'BAC', 'WFC', 'GS', 'JNJ', 'PFE', 'UNH', 'WMT', 'HD', 'NKE'
  ];

  const filteredStocks = popularStocks.filter(stock => 
    stock.toLowerCase().includes(stockSearch.toLowerCase()) &&
    !formData.stocks.includes(stock)
  );

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep(1);
      setFormData({
        name: '',
        description: '',
        buyTriggerPercent: -5,
        sellTriggerPercent: 10,
        profitTriggerPercent: undefined,
        buyAmount: 1000,
        sellAmount: 500,
        stocks: [],
        stockGroups: []
      });
      setStockSearch('');
      setCustomStock('');
      setErrors({});
    }
  }, [isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Constraint name is required';
      }
      if (formData.stocks.length === 0 && formData.stockGroups.length === 0) {
        newErrors.stocks = 'Select at least one stock or stock group';
      }
    }

    if (step === 2) {
      if (formData.buyTriggerPercent >= 0) {
        newErrors.buyTriggerPercent = 'Buy trigger must be negative (price drop)';
      }
      if (formData.sellTriggerPercent <= 0) {
        newErrors.sellTriggerPercent = 'Sell trigger must be positive (price rise)';
      }
      if (formData.buyAmount <= 0) {
        newErrors.buyAmount = 'Buy amount must be positive';
      }
      if (formData.sellAmount <= 0) {
        newErrors.sellAmount = 'Sell amount must be positive';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
      toast.success('Constraint group created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create constraint group');
    } finally {
      setLoading(false);
    }
  };

  const addStock = (stock: string) => {
    if (!formData.stocks.includes(stock)) {
      setFormData(prev => ({
        ...prev,
        stocks: [...prev.stocks, stock]
      }));
    }
  };

  const removeStock = (stock: string) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== stock)
    }));
  };

  const addCustomStock = () => {
    const stock = customStock.toUpperCase().trim();
    if (stock && /^[A-Z]{1,5}$/.test(stock) && !formData.stocks.includes(stock)) {
      addStock(stock);
      setCustomStock('');
    }
  };

  const toggleStockGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      stockGroups: prev.stockGroups.includes(groupId)
        ? prev.stockGroups.filter(id => id !== groupId)
        : [...prev.stockGroups, groupId]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getTotalStocks = () => {
    const individualStocks = formData.stocks.length;
    const groupStocks = formData.stockGroups.reduce((total, groupId) => {
      const group = stockGroups.find(g => g.id === groupId);
      return total + (group?.stocks.length || 0);
    }, 0);
    return individualStocks + groupStocks;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Constraint Group</h2>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of 2: {currentStep === 1 ? 'Select Stocks' : 'Configure Rules'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-4 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="label">Constraint Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Tech Stock Dip Buying"
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input h-20 resize-none"
                    placeholder="Describe your trading strategy..."
                  />
                </div>

                {/* Stock Groups */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Stock Groups
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stockGroups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => toggleStockGroup(group.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.stockGroups.includes(group.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{group.name}</h4>
                              <p className="text-sm text-gray-600">{group.stocks.length} stocks</p>
                            </div>
                          </div>
                          {formData.stockGroups.includes(group.id) && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-500 mt-2">{group.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.stocks.slice(0, 6).map((stock) => (
                            <span key={stock} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {stock}
                            </span>
                          ))}
                          {group.stocks.length > 6 && (
                            <span className="text-xs text-gray-500">+{group.stocks.length - 6} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Stocks */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Individual Stocks
                  </h3>
                  
                  {/* Search and Add Custom */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={(e) => setStockSearch(e.target.value)}
                        className="input pl-10"
                        placeholder="Search stocks..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customStock}
                        onChange={(e) => setCustomStock(e.target.value.toUpperCase())}
                        className="input w-24"
                        placeholder="SYMBOL"
                        maxLength={5}
                      />
                      <button
                        onClick={addCustomStock}
                        disabled={!customStock.trim() || !/^[A-Z]{1,5}$/.test(customStock.trim())}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Popular Stocks */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filteredStocks.slice(0, 12).map((stock) => (
                      <button
                        key={stock}
                        onClick={() => addStock(stock)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                      >
                        {stock}
                      </button>
                    ))}
                  </div>

                  {/* Selected Stocks */}
                  {formData.stocks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Selected Stocks ({formData.stocks.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.stocks.map((stock) => (
                          <div
                            key={stock}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                          >
                            <span className="text-sm font-medium">{stock}</span>
                            <button
                              onClick={() => removeStock(stock)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.stocks && <p className="error-text">{errors.stocks}</p>}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                  <p className="text-blue-800 text-sm">
                    Total stocks: <strong>{getTotalStocks()}</strong>
                    {formData.stockGroups.length > 0 && (
                      <span> ({formData.stockGroups.length} groups, {formData.stocks.length} individual)</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
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
                      <label className="label">Trigger Percentage *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.buyTriggerPercent}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                          className={`input pr-8 ${errors.buyTriggerPercent ? 'border-red-500' : ''}`}
                          step="0.1"
                          min="-50"
                          max="-0.1"
                        />
                        <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.buyTriggerPercent && <p className="error-text">{errors.buyTriggerPercent}</p>}
                    </div>

                    <div>
                      <label className="label">Buy Amount per Stock *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.buyAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                          className={`input pl-8 ${errors.buyAmount ? 'border-red-500' : ''}`}
                          step="100"
                          min="100"
                          max="100000"
                        />
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.buyAmount && <p className="error-text">{errors.buyAmount}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        Total potential: {formatCurrency(formData.buyAmount * getTotalStocks())}
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
                      <label className="label">Trigger Percentage *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.sellTriggerPercent}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                          className={`input pr-8 ${errors.sellTriggerPercent ? 'border-red-500' : ''}`}
                          step="0.1"
                          min="0.1"
                          max="100"
                        />
                        <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.sellTriggerPercent && <p className="error-text">{errors.sellTriggerPercent}</p>}
                    </div>

                    <div>
                      <label className="label">Sell Amount per Stock *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.sellAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                          className={`input pl-8 ${errors.sellAmount ? 'border-red-500' : ''}`}
                          step="100"
                          min="100"
                          max="100000"
                        />
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.sellAmount && <p className="error-text">{errors.sellAmount}</p>}
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
                    <label className="label">Profit Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.profitTriggerPercent || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="input pr-8"
                        step="0.1"
                        min="0.1"
                        max="500"
                        placeholder="e.g., 15"
                      />
                      <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This constraint will apply to {getTotalStocks()} stocks. 
                        Maximum potential investment: {formatCurrency(formData.buyAmount * getTotalStocks())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 2 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Constraint'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConstraintModal;