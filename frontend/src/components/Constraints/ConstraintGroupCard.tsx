import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ConstraintGroup } from '../../types';
import { constraintGroupsService } from '../../services/constraintGroups';
import { constraintPositionsService } from '../../services/constraintPositions';
import GroupHeader from './components/GroupHeader';
import GroupSummary from './components/GroupSummary';
import GroupActions from './components/GroupActions';
import StockList from './components/StockList';
import AddStockToGroup from './components/AddStockToGroup';
import EditTriggersModal from '../Common/EditTriggersModal';
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

  // Get group display data with position information
  const {
    data: groupDisplayData = [],
    isLoading: positionsLoading
  } = useQuery(
    'group-display-data',
    constraintPositionsService.getGroupDisplayData,
    {
      refetchInterval: 30000,
      staleTime: 10000,
    }
  );

  // Find this group's data
  const currentGroupData = groupDisplayData.find(gd => gd.group.id === group.id);

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

  const handleEditGroup = (group: ConstraintGroup) => {
    setShowEditModal(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    onToggle(id, isActive);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    onDelete(id, name);
  };

  // Calculate totals
  const totalStocks = currentGroupData?.stocks.length || 0;
  const activePositions = currentGroupData?.activePositions || 0;
  const totalValue = currentGroupData?.totalValue || 0;

  if (positionsLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <GroupHeader
            group={group}
            isExpanded={expanded}
            activePositions={activePositions}
            totalStocks={totalStocks}
            onToggleExpansion={() => setExpanded(!expanded)}
          />

          {group.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>
          )}

          {/* Show summary when collapsed */}
          {!expanded && (
            <GroupSummary group={group} totalValue={totalValue} />
          )}

          {/* Detailed view when expanded */}
          {expanded && (
            <>
              <GroupSummary group={group} totalValue={totalValue} />
              
              {/* Stocks Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stocks in Group ({totalStocks})
                  </h4>
                  <AddStockToGroup
                    groupId={group.id}
                    groupName={group.name}
                    onUpdate={onUpdate}
                  />
                </div>
                
                {currentGroupData && currentGroupData.stocks.length > 0 ? (
                  <StockList 
                    stocks={currentGroupData.stocks} 
                    groupId={group.id}
                    onUpdate={onUpdate}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No stocks in this group yet. Add some stocks to get started.
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </>
          )}
        </div>

        <GroupActions
          group={group}
          onEdit={handleEditGroup}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteGroup}
        />
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