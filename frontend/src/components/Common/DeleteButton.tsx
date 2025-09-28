import React, { useState } from 'react';
import { Trash2, Loader } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  itemName: string;
  itemType: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  itemName,
  itemType,
  className = '',
  size = 'md'
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`Deleting ${itemType}:`, itemName);
      await onDelete();
      console.log(`Successfully deleted ${itemType}:`, itemName);
    } catch (error) {
      console.error(`Failed to delete ${itemType}:`, error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`${sizeClasses[size]} bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors ${className}`}
          title={`Confirm delete ${itemName}`}
        >
          {isDeleting ? (
            <Loader className={`${iconSizes[size]} animate-spin`} />
          ) : (
            <span className="text-xs font-medium">✓</span>
          )}
        </button>
        <button
          onClick={handleCancel}
          className={`${sizeClasses[size]} bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors`}
          title="Cancel delete"
        >
          <span className="text-xs font-medium">✕</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className={`${sizeClasses[size]} text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ${className}`}
      title={`Delete ${itemName}`}
    >
      <Trash2 className={iconSizes[size]} />
    </button>
  );
};

export default DeleteButton;