import { constraintsService } from '../../../services/constraints';
import { constraintGroupsService } from '../../../services/constraintGroups';
import { TradingConstraint, ConstraintGroup } from '../../../types';
import toast from 'react-hot-toast';

interface UseConstraintActionsProps {
  constraints: TradingConstraint[];
  constraintGroups: ConstraintGroup[];
  setConstraints: React.Dispatch<React.SetStateAction<TradingConstraint[]>>;
  setConstraintGroups: React.Dispatch<React.SetStateAction<ConstraintGroup[]>>;
  invalidateConstraintData: () => Promise<void>;
}

export const useConstraintActions = ({
  constraints,
  constraintGroups,
  setConstraints,
  setConstraintGroups,
  invalidateConstraintData
}: UseConstraintActionsProps) => {

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await constraintsService.toggleConstraint(id, !isActive);
      setConstraints(prev =>
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      await invalidateConstraintData();
      toast.success(`Constraint ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint');
    }
  };

  const handleDelete = async (id: string, stockSymbol: string) => {
    console.log('handleDelete called with:', { id, stockSymbol });
    
    if (!window.confirm(`Are you sure you want to delete the constraint for ${stockSymbol}?`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Starting delete operation for constraint:', { id, stockSymbol });
      console.log('Current constraints before delete:', constraints.length);
      
      await constraintsService.deleteConstraint(id);
      console.log('Delete API call successful');
      
      setConstraints(prev => {
        const filtered = prev.filter(c => c.id !== id);
        console.log('Constraints after filter:', filtered.length);
        return filtered;
      });
      
      await invalidateConstraintData();
      console.log('Cache invalidated');
      
      toast.success('Constraint deleted successfully');
    } catch (error) {
      console.error('Delete constraint error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint');
    }
  };

  const handleToggleConstraintGroup = async (id: string, isActive: boolean) => {
    try {
      await constraintGroupsService.toggleConstraintGroup(id, !isActive);
      setConstraintGroups(prev =>
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      await invalidateConstraintData();
      toast.success(`Constraint group ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint group');
    }
  };

  const handleDeleteConstraintGroup = async (id: string, name: string) => {
    console.log('handleDeleteConstraintGroup called with:', { id, name });
    
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Starting delete operation for constraint group:', { id, name });
      console.log('Current constraint groups before delete:', constraintGroups.length);
      
      await constraintGroupsService.deleteConstraintGroup(id);
      console.log('Delete API call successful');
      
      setConstraintGroups(prev => {
        const filtered = prev.filter(c => c.id !== id);
        console.log('Constraint groups after filter:', filtered.length);
        return filtered;
      });
      
      await invalidateConstraintData();
      console.log('Cache invalidated');
      
      toast.success('Constraint group deleted successfully');
    } catch (error) {
      console.error('Delete constraint group error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint group');
    }
  };

  return {
    handleToggleActive,
    handleDelete,
    handleToggleConstraintGroup,
    handleDeleteConstraintGroup
  };
};