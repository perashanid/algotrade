import React, { useState, useEffect } from 'react';
import { Play, Settings, BarChart3, Calendar, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
import { constraintGroupsService } from '../../services/constraintGroups';
import { ConstraintGroup, BacktestResult } from '../../types';
import BacktestForm from './BacktestForm';
import BacktestResults from './BacktestResults';
import BacktestHistory from './BacktestHistory';
import toast from 'react-hot-toast';

const Backtest: React.FC = () => {
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [backtesting, setBacktesting] = useState(false);
  const [currentResults, setCurrentResults] = useState<BacktestResult | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'results' | 'history'>('new');

  useEffect(() => {
    loadConstraintGroups();
  }, []);

  const loadConstraintGroups = async () => {
    try {
      setLoading(true);
      const groups = await constraintGroupsService.getConstraintGroups();
      setConstraintGroups(groups);
    } catch (error) {
      console.error('Failed to load constraint groups:', error);
      toast.error('Failed to load constraint groups');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBacktest = async (params: {
    constraintId?: string;
    constraintType: 'group' | 'individual' | 'custom';
    customConstraint?: {
      stocks: string[];
      buyTriggerPercent: number;
      sellTriggerPercent: number;
      profitTriggerPercent?: number;
      buyAmount: number;
      sellAmount: number;
    };
    startDate: string;
    endDate: string;
    initialCapital: number;
  }) => {
    try {
      setBacktesting(true);
      
      // Simulate backtest API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock backtest results
      const mockResult: BacktestResult = {
        constraintId: params.constraintId || 'custom',
        startDate: params.startDate,
        endDate: params.endDate,
        totalTrades: Math.floor(Math.random() * 50) + 10,
        successfulTrades: Math.floor(Math.random() * 30) + 20,
        totalReturn: (Math.random() - 0.3) * 10000,
        totalReturnPercent: (Math.random() - 0.3) * 50,
        maxDrawdown: Math.random() * 20,
        sharpeRatio: Math.random() * 3,
        trades: []
      };

      setCurrentResults(mockResult);
      setActiveTab('results');
      toast.success('Backtest completed successfully!');
    } catch (error) {
      toast.error('Backtest failed. Please try again.');
    } finally {
      setBacktesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Backtest</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Test your trading strategies against historical data</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              New Backtest
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!currentResults}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results' && currentResults
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 disabled:text-gray-300 dark:disabled:text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Results
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'new' && (
        <div>
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">About Backtesting</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Backtesting simulates how your trading constraints would have performed using historical market data. 
                  This helps you evaluate strategy effectiveness before risking real capital.
                </p>
              </div>
            </div>
          </div>

          <BacktestForm
            constraintGroups={constraintGroups}
            onRunBacktest={handleRunBacktest}
            isRunning={backtesting}
          />
        </div>
      )}

      {activeTab === 'results' && currentResults && (
        <BacktestResults results={currentResults} constraintGroups={constraintGroups} />
      )}

      {activeTab === 'history' && (
        <BacktestHistory />
      )}

      {/* Running Backtest Overlay */}
      {backtesting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Running Backtest</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyzing historical data and simulating trades. This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backtest;