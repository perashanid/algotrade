import { useQueryClient } from 'react-query';

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateConstraintData = async () => {
    // Invalidate all constraint-related queries
    await Promise.all([
      queryClient.invalidateQueries('constraints'),
      queryClient.invalidateQueries('constraint-groups'),
      queryClient.invalidateQueries('constraint-positions'),
      queryClient.invalidateQueries('stock-groups'),
      queryClient.invalidateQueries('portfolio'),
    ]);
  };

  const invalidatePortfolioData = async () => {
    await queryClient.invalidateQueries('portfolio');
  };

  const invalidateAllData = async () => {
    await queryClient.invalidateQueries();
  };

  return {
    invalidateConstraintData,
    invalidatePortfolioData,
    invalidateAllData,
  };
};