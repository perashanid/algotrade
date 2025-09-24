import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Target, Edit, Power, PowerOff } from 'lucide-react';
import { ConstraintGroup } from '../../types';
import DatabaseStockList from '../Common/DatabaseStockList';
import DeleteButton from '../Common/DeleteButton';
import EditTriggersModal from '../Common/EditTriggersModal';
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
  const [showEditModal, setShowEditModal] = useState(false);

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const handleSaveEdit = async (values: any) => {
    try {
      await constraintGroupsService.updateConstraintGroup(group.id, values);
      toast.success('Constraint group updated successfully!');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint group');
      throw error; // Re-throw to let modal handle the error state
    }
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

          {/* Group-level constraints - only show when expanded */}
          {expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              </div>

              {/* Stocks Section */}
              <div className="mb-3">
                <DatabaseStockList
                  groupId={group.id}
                  groupName={group.name}
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
          <button
            onClick={() => setShowEditModal(true)}
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

          <DeleteButton
            onDelete={async () => onDelete(group.id, group.name)}
            itemName={group.name}
            itemType="constraint group"
            size="md"
          />
        </div>
      </div>

      {/* Edit Triggers Modal */}
      <EditTriggersModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        initialValues={{
          buyTriggerPercent: group.buyTriggerPercent,
          sellTriggerPercent: group.sellTriggerPercent,
          profitTriggerPercent: group.profitTriggerPercent,
          buyAmount: group.buyAmount,
          sellAmount: group.sellAmount
        }}
        title="Edit Constraint Group Triggers"
        itemName={group.name}
        itemType="group"
      />
    </div>
  );
};

export default ConstraintGroupCard;