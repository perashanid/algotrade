import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface CreateButtonsProps {
  viewMode: 'individual' | 'groups' | 'stock-groups';
  setShowCreateModal: (show: boolean) => void;
  setShowCreateStockGroupModal: (show: boolean) => void;
}

const CreateButtons: React.FC<CreateButtonsProps> = ({
  viewMode,
  setShowCreateModal,
  setShowCreateStockGroupModal
}) => {
  if (viewMode === 'groups') {
    return (
      <button
        onClick={() => setShowCreateModal(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Constraint Group
      </button>
    );
  }

  if (viewMode === 'stock-groups') {
    return (
      <button
        onClick={() => setShowCreateStockGroupModal(true)}
        className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Stock Group
      </button>
    );
  }

  if (viewMode === 'individual') {
    return (
      <Link
        to="/constraints/create"
        className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Individual Constraint
      </Link>
    );
  }

  return null;
};

export default CreateButtons;