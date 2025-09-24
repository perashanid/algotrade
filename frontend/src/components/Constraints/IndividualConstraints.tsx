import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Target, Edit, Power, PowerOff, DollarSign, Activity } from 'lucide-react';
import { useQuery } from 'react-query';
import { TradingConstraint } from '../../types';
import DeleteButton from '../Common/DeleteButton';
import EditTriggersModal from '../Common/EditTriggersModal';
import { constraintPositionsService } from '../../services/constraintPositions';

interface IndividualConstraintsProps {
  constraints: TradingConstraint[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string, stockSymbol: string) => void;
  onSaveEdit: (id: string, values: any) => Promise<void>;
}

const IndividualConstraints: React.FC<IndividualConstraintsProps> = ({
  constraints,
  onToggleActive,
  onDelete,
  onSaveEdit
}) => {
  const [expandedIndividual, setExpandedIndividual] = useState<Set<string>>(new Set());
  const [editingConstraint, setEditingConstraint] = useState<TradingConstraint | null>(null);

  // Get enhanced position data
  const {
    data: enhancedPositions = [],
    isLoading: positionsLoading
  } = useQuery(
    'enhanced-constraint-positions',
    constraintPositionsService.getEnhancedConstraintPositions,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

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

  const handleEditConstraint = (constraint: TradingConstraint) => {
    setEditingConstraint(constraint);
  };

  const handleSaveConstraintEdit = async (values: any) => {
    if (!editingConstraint) return;
    
    try {
      await onSaveEdit(editingConstraint.id, values);
      setEditingConstraint(null);
    } catch (error) {
      throw error; // Re-throw to let modal handle the error state
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

  // Get position data for individual constraints
  const getPositionData = (stockSymbol: string) => {
    return enhancedPositions.find(pos => 
      pos.stockSymbol === stockSymbol && pos.constraintType === 'individual'
    );
  };

  if (constraints.length === 0) {
    return null;
  }

  if (positionsLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Individual Constraints</h3>
        <div className="grid gap-4">
          {constraints.map((constraint) => (
            <div key={constraint.id} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Individual Constraints</h3>
      <div className="grid gap-4">
        {constraints.map((constraint) => {
          const positionData = getPositionData(constraint.stockSymbol);
          const hasPosition = positionData && positionData.quantity > 0;
          
          return (
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
                  {hasPosition && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      <Activity className="h-3 w-3 mr-1" />
                      Position
                    </span>
                  )}
                </div>

                {/* Position Summary Bar */}
                {positionData && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">Current Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {positionData.currentPrice > 0 ? formatCurrency(positionData.currentPrice) : 'N/A'}
                        </p>
                      </div>
                      {hasPosition && (
                        <>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Quantity</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {positionData.quantity.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Market Value</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(positionData.marketValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">P&L</p>
                            <p className={`font-medium ${positionData.unrealizedPnl >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatCurrency(positionData.unrealizedPnl)} ({formatPercent(positionData.unrealizedPnlPercent)})
                            </p>
                          </div>
                        </>
                      )}
                      {!hasPosition && (
                        <div className="col-span-3">
                          <p className="text-gray-600 dark:text-gray-300 italic">
                            Watching for triggers - no position held
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                  <div className="space-y-4 mb-4">
                    {/* Trigger Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {positionData && positionData.currentPrice > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Trigger at: {formatCurrency(positionData.currentPrice * (1 + constraint.buyTriggerPercent / 100))}
                            </p>
                          )}
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
                          {positionData && positionData.currentPrice > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Trigger at: {formatCurrency(positionData.currentPrice * (1 + constraint.sellTriggerPercent / 100))}
                            </p>
                          )}
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
                            {positionData && positionData.averageCost && positionData.averageCost > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Target: {formatCurrency(positionData.averageCost * (1 + constraint.profitTriggerPercent / 100))}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Position Details (if expanded and has position) */}
                    {hasPosition && positionData && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Position Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Average Cost</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(positionData.averageCost || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Total Cost</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency((positionData.averageCost || 0) * positionData.quantity)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Current Value</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(positionData.marketValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Status</p>
                            <p className={`font-medium capitalize ${
                              positionData.status === 'position' ? 'text-blue-600 dark:text-blue-400' :
                              positionData.status === 'triggered' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {positionData.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEditConstraint(constraint)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Edit constraint"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToggleActive(constraint.id, !constraint.isActive)}
                  className={`p-2 rounded-lg transition-colors ${constraint.isActive
                    ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  title={constraint.isActive ? 'Deactivate constraint' : 'Activate constraint'}
                >
                  {constraint.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                </button>
                <DeleteButton
                  onDelete={async () => onDelete(constraint.id, constraint.stockSymbol)}
                  itemName={constraint.stockSymbol}
                  itemType="constraint"
                  size="md"
                />
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Edit Modal */}
      {editingConstraint && (
        <EditTriggersModal
          isOpen={true}
          onClose={() => setEditingConstraint(null)}
          onSave={handleSaveConstraintEdit}
          initialValues={{
            buyTriggerPercent: editingConstraint.buyTriggerPercent,
            sellTriggerPercent: editingConstraint.sellTriggerPercent,
            profitTriggerPercent: editingConstraint.profitTriggerPercent || undefined,
            buyAmount: editingConstraint.buyAmount,
            sellAmount: editingConstraint.sellAmount
          }}
          title={`Edit ${editingConstraint.stockSymbol} Constraint`}
          itemName={editingConstraint.stockSymbol}
          itemType="constraint"
        />
      )}
    </div>
  );
};

export default IndividualConstraints;