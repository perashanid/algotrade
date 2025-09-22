import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { StockGroup, CreateStockGroupRequest } from '../../types';
import { stockGroupsService } from '../../services/stockGroups';
import toast from 'react-hot-toast';

interface StockGroupManagerProps {
  stockGroups: StockGroup[];
  onUpdate: () => void;
}

const StockGroupManager: React.FC<StockGroupManagerProps> = ({ stockGroups, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StockGroup | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateStockGroupRequest>({
    name: '',
    description: '',
    color: '#3B82F6',
    stocks: []
  });
  
  const [stockInput, setStockInput] = useState('');

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
    setStockInput('');
    setShowCreateForm(false);
    setEditingGroup(null);
  };

  const startEdit = (group: StockGroup) => {
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color,
      stocks: [...group.stocks]
    });
    setEditingGroup(group);
    setShowCreateForm(true);
  };

  const addStock = () => {
    const stock = stockInput.toUpperCase().trim();
    if (stock && /^[A-Z]{1,5}$/.test(stock) && !formData.stocks.includes(stock)) {
      setFormData(prev => ({
        ...prev,
        stocks: [...prev.stocks, stock]
      }));
      setStockInput('');
    }
  };

  const removeStock = (stock: string) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== stock)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.stocks.length === 0) {
      toast.error('Name and at least one stock are required');
      return;
    }

    try {
      setLoading(true);
      
      if (editingGroup) {
        await stockGroupsService.updateStockGroup(editingGroup.id, formData);
        toast.success('Stock group updated successfully!');
      } else {
        await stockGroupsService.createStockGroup(formData);
        toast.success('Stock group created successfully!');
      }
      
      resetForm();
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save stock group');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (group: StockGroup) => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return;
    }

    try {
      await stockGroupsService.deleteStockGroup(group.id);
      toast.success('Stock group deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete stock group');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Stock Groups</h3>
          <p className="text-gray-600 text-sm">Create custom groups of stocks for easier constraint management</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Group
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">
                {editingGroup ? 'Edit Stock Group' : 'Create Stock Group'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

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
                        formData.color === color ? 'border-gray-400' : 'border-gray-200'
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

            <div>
              <label className="label">Stocks *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStock())}
                  className="input flex-1"
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  maxLength={5}
                />
                <button
                  type="button"
                  onClick={addStock}
                  disabled={!stockInput.trim() || !/^[A-Z]{1,5}$/.test(stockInput.trim())}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.stocks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.stocks.map((stock) => (
                    <div
                      key={stock}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>{stock}</span>
                      <button
                        type="button"
                        onClick={() => removeStock(stock)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || formData.stocks.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockGroups.map((group) => (
          <div key={group.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h4 className="font-medium text-gray-900">{group.name}</h4>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(group)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(group)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}

            <div className="flex flex-wrap gap-1">
              {group.stocks.map((stock) => (
                <span
                  key={stock}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {stock}
                </span>
              ))}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              {group.stocks.length} stocks • Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {stockGroups.length === 0 && !showCreateForm && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No custom stock groups yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Group
          </button>
        </div>
      )}
    </div>
  );
};

export default StockGroupManager;