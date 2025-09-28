import React from 'react';
import { Edit, Power, PowerOff } from 'lucide-react';
import { ConstraintGroup } from '../../../types';
import DeleteButton from '../../Common/DeleteButton';

interface GroupActionsProps {
  group: ConstraintGroup;
  onEdit: (group: ConstraintGroup) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

const GroupActions: React.FC<GroupActionsProps> = ({
  group,
  onEdit,
  onToggleActive,
  onDelete
}) => {
  return (
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={() => onEdit(group)}
        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        title="Edit group"
      >
        <Edit className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => onToggleActive(group.id, !group.isActive)}
        className={`p-2 rounded-lg transition-colors ${
          group.isActive
            ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={group.isActive ? 'Deactivate group' : 'Activate group'}
      >
        {group.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
      </button>
      
      <DeleteButton
        onDelete={async () => onDelete(group.id, group.name)}
        itemName={group.name}
        itemType="constraint group"
        size="md"
      />
    </div>
  );
};

export default GroupActions;