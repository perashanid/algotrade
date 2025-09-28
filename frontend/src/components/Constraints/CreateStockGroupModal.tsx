import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { CreateStockGroupRequest } from '../../types';
import StockSearchInput from '../Common/StockSearchInput';
import { getStockInfo } from '../../data/stockDatabase';
import toast from 'react-hot-toast';

interface CreateStockGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stockGroup: CreateStockGroupRequest) => Promise<void>;
}

const CreateStockGroupModal: React.FC<CreateStockGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStockGroupRequest>({
    name: '',
    description: '',
    color: '#3B82F6',
    stocks: []
  });

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      stocks: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Stock group name is required');
      return;
    }

    if (formData.stocks.length === 0) {
      toast.error('Please add at least one stock to the group');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      resetForm();
      onClose();
      toast.success('Stock group created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create stock group');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Stock Group</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Group stocks together for easier constraint management
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Group Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., My Tech Stocks"
                  required
                />
              </div>

              <div>
                <label className="label">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400 dark:border-gray-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input h-20 resize-none"
                placeholder="Optional description..."
              />
            </div>

            {/* Stock Search */}
            <div>
              <label className="label">Add Stocks *</label>
              <StockSearchInput 
                onStockSelect={addStock}
                placeholder="Search by company name or symbol (e.g., Apple, AAPL)..."
              />
            </div>

            {/* Selected Stocks */}
            {formData.stocks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Selected Stocks ({formData.stocks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.stocks.map((stock) => {
                    const stockInfo = getStockInfo(stock);
                    return (
                      <div
                        key={stock}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">{stock}</span>
                          {stockInfo && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {stockInfo.name}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStock(stock)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || formData.stocks.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Stock Group'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStockGroupModal;