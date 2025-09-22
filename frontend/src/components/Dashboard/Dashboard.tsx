import React from 'react';
import { useQuery } from 'react-query';
import { portfolioService } from '../../services/portfolio';
import PortfolioSummary from './PortfolioSummary';
import PositionList from './PositionList';
import QuickActions from './QuickActions';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio
  } = useQuery('portfolio', portfolioService.getPortfolio, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRefresh = async () => {
    try {
      await portfolioService.refreshPrices();
      await refetchPortfolio();
      toast.success('Portfolio refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh portfolio');
    }
  };

  if (portfolioLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (portfolioError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {portfolioError instanceof Error ? portfolioError.message : 'An error occurred'}
          </p>
          <button
            onClick={() => refetchPortfolio()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your algorithmic trading performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="mb-8">
          <PortfolioSummary portfolio={portfolio} />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Positions */}
        <div className="lg:col-span-2">
          {portfolio && (
            <PositionList 
              positions={portfolio.positions}
              onRefresh={refetchPortfolio}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;