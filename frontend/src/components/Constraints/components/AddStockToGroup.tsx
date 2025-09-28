import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import StockSearchInput from '../../Common/StockSearchInput';
import { constraintGroupsService } from '../../../services/constraintGroups';
import toast from 'react-hot-toast';

interface AddStockToGroupProps {
  groupId: string;
  groupName: string;
  onUpdate: () => void;
}

const AddStockToGroup: React.FC<AddStockToGroupProps> = ({
  groupId,
  groupName,
  onUpdate
}) => {
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStock = async () => {
    if (!selectedStock.trim()) {
      toast.error('Please select a stock');
      return;
    }

    setIsAdding(true);
    try {
      await constraintGroupsService.addStockToGroup(groupId, selectedStock.toUpperCase());
      toast.success(`Added ${selectedStock.toUpperCase()} to ${groupName}`);
      setSelectedStock('');
      setShowAddStock(false);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add stock');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setSelectedStock('');
    setShowAddStock(false);
  };

  if (!showAddStock) {
    return (
      <button
        onClick={() => setShowAddStock(true)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Stock
      </button>
    );
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
          Add Stock to {groupName}
        </h5>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <StockSearchInput
            onStockSelect={setSelectedStock}
            placeholder="Search for a stock..."
            className="text-sm"
          />
        </div>
        <button
          onClick={handleAddStock}
          disabled={isAdding || !selectedStock.trim()}
          className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default AddStockToGroup;