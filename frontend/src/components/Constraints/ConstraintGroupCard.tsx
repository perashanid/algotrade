import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Target, Edit, Trash2, Power, PowerOff, Save, X } from 'lucide-react';
import { ConstraintGroup } from '../../types';
import ConstraintGroupStocks from './ConstraintGroupStocks';
import { constraintGroupsService } from '../../services/constraintGroups';
import toast from 'react-hot-toast';

interface ConstraintGroupCardProps {
  group: ConstraintGroup;
  onUpdate: () => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

const ConstraintGroupCard: React.FC<ConstraintGroupCardProps> = ({
  group,
  onUpdate,
  onToggle,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    buyTriggerPercent: group.buyTriggerPercent,
    sellTriggerPercent: group.sellTriggerPercent,
    profitTriggerPercent: group.profitTriggerPercent,
    buyAmount: group.buyAmount,
    sellAmount: group.sellAmount
  });

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const handleEdit = () => {
    setEditing(true);
    setEditValues({
      buyTriggerPercent: group.buyTriggerPercent,
      sellTriggerPercent: group.sellTriggerPercent,
      profitTriggerPercent: group.profitTriggerPercent,
      buyAmount: group.buyAmount,
      sellAmount: group.sellAmount
    });
  };

  const handleSave = async () => {
    try {
      await constraintGroupsService.updateConstraintGroup(group.id, editValues);
      toast.success('Constraint group updated successfully!');
      setEditing(false);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint group');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditValues({
      buyTriggerPercent: group.buyTriggerPercent,
      sellTriggerPercent: group.sellTriggerPercent,
      profitTriggerPercent: group.profitTriggerPercent,
      buyAmount: group.buyAmount,
      sellAmount: group.sellAmount
    });
  };

  const totalStocks = group.stocks.length + 
    group.stockGroups.reduce((sum, sg) => sum + (sg.stocks?.length || 0), 0);

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={expanded ? "Collapse details" : "Expand details"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {group.name}
            </h3>

            {/* For single stock, show the stock name directly */}
            {group.stocks.length === 1 && group.stockGroups.length === 0 && (
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                {group.stocks[0]}
              </span>
            )}

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isActive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
              {group.isActive ? 'Active' : 'Inactive'}
            </span>

            {/* Show stock count badge */}
            {totalStocks > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                {totalStocks} stock{totalStocks !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {group.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>
          )}

          {/* Show summary when collapsed */}
          {!expanded && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                Buy: {formatPercent(group.buyTriggerPercent)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Sell: {formatPercent(group.sellTriggerPercent)}
              </span>
              {group.profitTriggerPercent && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-500" />
                  Profit: {formatPercent(group.profitTriggerPercent)}
                </span>
              )}
            </div>
          )}

          {/* Group-level constraints with edit functionality - only show when expanded */}
          {expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {editing ? (
                  <>
                    {/* Editable Buy Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValues.buyTriggerPercent}
                            onChange={(e) => setEditValues(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="0.1"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">%</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                          <input
                            type="number"
                            value={editValues.buyAmount}
                            onChange={(e) => setEditValues(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                            className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Editable Sell Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValues.sellTriggerPercent}
                            onChange={(e) => setEditValues(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="0.1"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">%</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                          <input
                            type="number"
                            value={editValues.sellAmount}
                            onChange={(e) => setEditValues(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                            className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Editable Profit Target */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValues.profitTriggerPercent || ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                            step="0.1"
                            placeholder="15"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">%</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Display-only triggers */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPercent(group.buyTriggerPercent)} drop
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Amount: {formatCurrency(group.buyAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Sell Trigger</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPercent(group.sellTriggerPercent)} rise
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Amount: {formatCurrency(group.sellAmount)}
                        </p>
                      </div>
                    </div>

                    {group.profitTriggerPercent && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatPercent(group.profitTriggerPercent)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Amount: {formatCurrency(group.sellAmount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Stocks Section */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Applies to {totalStocks} stock{totalStocks !== 1 ? 's' : ''}
                  {group.stockGroups.length > 0 && 
                    ` (${group.stocks.length} individual + ${group.stockGroups.length} group${group.stockGroups.length !== 1 ? 's' : ''})`
                  }
                </p>

                <ConstraintGroupStocks
                  group={group}
                  onUpdate={onUpdate}
                />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Save changes"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Edit group constraints"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={() => onToggle(group.id, group.isActive)}
                className={`p-2 rounded-lg transition-colors ${group.isActive
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                title={group.isActive ? 'Deactivate' : 'Activate'}
              >
                {group.isActive ? (
                  <Power className="h-4 w-4" />
                ) : (
                  <PowerOff className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => onDelete(group.id, group.name)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstraintGroupCard;