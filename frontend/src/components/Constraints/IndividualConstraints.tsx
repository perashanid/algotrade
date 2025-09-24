import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Target, Edit, Trash2, Power, PowerOff, Save, X } from 'lucide-react';
import { TradingConstraint } from '../../types';

interface IndividualConstraintsProps {
  constraints: TradingConstraint[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string, stockSymbol: string) => void;
  onEdit: (constraint: TradingConstraint) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  editingIndividual: string | null;
  editValues: {
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
    buyAmount: number;
    sellAmount: number;
  };
  setEditValues: React.Dispatch<React.SetStateAction<{
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
    buyAmount: number;
    sellAmount: number;
  }>>;
}

const IndividualConstraints: React.FC<IndividualConstraintsProps> = ({
  constraints,
  onToggleActive,
  onDelete,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  editingIndividual,
  editValues,
  setEditValues
}) => {
  const [expandedIndividual, setExpandedIndividual] = useState<Set<string>>(new Set());

  const toggleIndividualExpansion = (constraintId: string) => {
    setExpandedIndividual(prev => {
      const newSet = new Set(prev);
      if (newSet.has(constraintId)) {
        newSet.delete(constraintId);
      } else {
        newSet.add(constraintId);
      }
      return newSet;
    });
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

  if (constraints.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Individual Constraints</h3>
      <div className="grid gap-4">
        {constraints.map((constraint) => (
          <div key={constraint.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleIndividualExpansion(constraint.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={expandedIndividual.has(constraint.id) ? "Collapse details" : "Expand details"}
                  >
                    {expandedIndividual.has(constraint.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {constraint.stockSymbol}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${constraint.isActive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                    {constraint.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Summary when collapsed */}
                {!expandedIndividual.has(constraint.id) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      Buy: {formatPercent(constraint.buyTriggerPercent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Sell: {formatPercent(constraint.sellTriggerPercent)}
                    </span>
                    {constraint.profitTriggerPercent && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-blue-500" />
                        Profit: {formatPercent(constraint.profitTriggerPercent)}
                      </span>
                    )}
                  </div>
                )}

                {/* Detailed view when expanded */}
                {expandedIndividual.has(constraint.id) && (
                  <>
                    {editingIndividual === constraint.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        {/* Editable fields */}
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
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Buy Trigger</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatPercent(constraint.buyTriggerPercent)} drop
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Amount: {formatCurrency(constraint.buyAmount)}
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
                              {formatPercent(constraint.sellTriggerPercent)} gain
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Amount: {formatCurrency(constraint.sellAmount)}
                            </p>
                          </div>
                        </div>

                        {constraint.profitTriggerPercent && (
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Profit Target</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatPercent(constraint.profitTriggerPercent)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 ml-4">
                {editingIndividual === constraint.id ? (
                  <>
                    <button
                      onClick={onSaveEdit}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(constraint)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit constraint"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleActive(constraint.id, constraint.isActive)}
                      className={`p-2 rounded-lg transition-colors ${constraint.isActive
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      title={constraint.isActive ? 'Deactivate constraint' : 'Activate constraint'}
                    >
                      {constraint.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onDelete(constraint.id, constraint.stockSymbol)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete constraint"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndividualConstraints;