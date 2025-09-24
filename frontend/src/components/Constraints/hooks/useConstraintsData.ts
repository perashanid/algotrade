import { useState, useEffect } from 'react';
import { constraintsService } from '../../../services/constraints';
import { constraintGroupsService } from '../../../services/constraintGroups';
import { stockGroupsService } from '../../../services/stockGroups';
import { TradingConstraint, ConstraintGroup, StockGroup } from '../../../types';
import { useInvalidateQueries } from '../../../hooks/useInvalidateQueries';
import toast from 'react-hot-toast';

export const useConstraintsData = () => {
  const { invalidateConstraintData } = useInvalidateQueries();
  const [constraints, setConstraints] = useState<TradingConstraint[]>([]);
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load data...');

      // Load data one by one to identify which one fails
      console.log('📊 Loading constraints...');
      const constraintsData = await constraintsService.getConstraints();
      console.log('✅ Constraints loaded:', constraintsData.length);
      setConstraints(constraintsData);

      console.log('👥 Loading constraint groups...');
      const constraintGroupsData = await constraintGroupsService.getConstraintGroups();
      console.log('✅ Constraint groups loaded:', constraintGroupsData.length);
      setConstraintGroups(constraintGroupsData);

      console.log('📈 Loading stock groups...');
      const stockGroupsData = await stockGroupsService.getStockGroups();
      console.log('✅ Stock groups loaded:', stockGroupsData.length);
      setStockGroups(stockGroupsData);

      console.log('🎉 All data loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    constraints,
    constraintGroups,
    stockGroups,
    loading,
    loadData,
    setConstraints,
    setConstraintGroups,
    setStockGroups,
    invalidateConstraintData
  };
};