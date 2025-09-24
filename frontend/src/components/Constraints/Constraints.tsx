import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { CreateConstraintGroupRequest } from '../../types';
import CreateConstraintModal from './CreateConstraintModal';
import CreateStockGroupModal from './CreateStockGroupModal';
import StockGroupManager from './StockGroupManager';
import LegacyStocks from './LegacyStocks';
import ConstraintGroupCard from './ConstraintGroupCard';
import IndividualConstraints from './IndividualConstraints';
import ViewModeToggle from './ViewModeToggle';
import CreateButtons from './CreateButtons';

import { useConstraintsData } from './hooks/useConstraintsData';
import { useConstraintActions } from './hooks/useConstraintActions';
import { constraintGroupsService } from '../../services/constraintGroups';
import { stockGroupsService } from '../../services/stockGroups';
import { constraintsService } from '../../services/constraints';
import toast from 'react-hot-toast';

const Constraints: React.FC = () => {
  // Data and loading state
  const {
    constraints,
    constraintGroups,
    stockGroups,
    loading,
    loadData,
    setConstraints,
    setConstraintGroups,
    setStockGroups,
    invalidateConstraintData
  } = useConstraintsData();

  // Actions
  const {
    handleToggleActive,
    handleDelete,
    handleToggleConstraintGroup,
    handleDeleteConstraintGroup
  } = useConstraintActions({
    constraints,
    constraintGroups,
    setConstraints,
    setConstraintGroups,
    invalidateConstraintData
  });

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStockGroupModal, setShowCreateStockGroupModal] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'groups' | 'stock-groups'>('groups');


  // Create handlers
  const handleCreateConstraintGroup = async (constraintData: CreateConstraintGroupRequest) => {
    await constraintGroupsService.createConstraintGroup(constraintData);
    await loadData();
    await invalidateConstraintData();
  };

  const handleCreateStockGroup = async (stockGroupData: any) => {
    await stockGroupsService.createStockGroup(stockGroupData);
    await loadData();
    await invalidateConstraintData();
  };

  // Individual constraints now handle their own editing internally
  const handleSaveEdit = async (id: string, values: any) => {
    try {
      await constraintsService.updateConstraint(id, values);
      toast.success('Constraint updated successfully!');
      await loadData();
      await invalidateConstraintData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update constraint');
      throw error; // Re-throw to let the component handle the error state
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Constraints</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your automated trading rules and triggers</p>
          </div>
          <div className="flex items-center gap-3">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            <CreateButtons
              viewMode={viewMode}
              setShowCreateModal={setShowCreateModal}
              setShowCreateStockGroupModal={setShowCreateStockGroupModal}
            />
          </div>
        </div>

        {viewMode === 'groups' && constraintGroups.length === 0 && constraints.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No constraint groups yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first constraint group to apply trading rules to multiple stocks at once. Use the "New Constraint Group" button above to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {viewMode === 'individual' && (
              <>
                <LegacyStocks onConstraintCreated={loadData} />
                <IndividualConstraints
                  constraints={constraints}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onSaveEdit={handleSaveEdit}
                />
              </>
            )}

            {viewMode === 'groups' && constraintGroups.map((constraintGroup) => (
              <ConstraintGroupCard
                key={constraintGroup.id}
                group={constraintGroup}
                onUpdate={loadData}
                onToggle={handleToggleConstraintGroup}
                onDelete={handleDeleteConstraintGroup}
              />
            ))}

            {viewMode === 'stock-groups' && (
              <StockGroupManager stockGroups={stockGroups} onUpdate={loadData} />
            )}
          </div>
        )}

        {/* Create Constraint Modal */}
        <CreateConstraintModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateConstraintGroup}
          stockGroups={stockGroups}
          onStockGroupsUpdate={loadData}
        />

        {/* Create Stock Group Modal */}
        <CreateStockGroupModal
          isOpen={showCreateStockGroupModal}
          onClose={() => setShowCreateStockGroupModal(false)}
          onSubmit={handleCreateStockGroup}
        />
      </div>
  );
};

export default Constraints;