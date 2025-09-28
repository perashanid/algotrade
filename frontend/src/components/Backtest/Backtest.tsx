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
    <div className="min-h-screen bg-gradient-to-br from-brand-lightest via-brand-light to-brand-medium dark:from-brand-950 dark:via-brand-900 dark:to-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Backtest</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Test your trading strategies against historical data</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-2 border-brand-medium dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'new'
                  ? 'border-brand-darkest text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-darker dark:hover:text-brand-lightest hover:border-brand-light dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                New Backtest
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!currentResults}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'results' && currentResults
                  ? 'border-brand-darkest text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-darker dark:hover:text-brand-lightest hover:border-brand-light dark:hover:border-gray-600 disabled:text-gray-300 dark:disabled:text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Results
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'history'
                  ? 'border-brand-darkest text-brand-700 dark:text-brand-300'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-darker dark:hover:text-brand-lightest hover:border-brand-light dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                History
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'new' && (
          <div>
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-brand-lightest to-brand-light dark:from-brand-900 dark:to-brand-850 border-2 border-brand-300 dark:border-brand-800 rounded-2xl p-6 mb-8 shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-brand-700 dark:text-brand-300 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-brand-700 dark:text-brand-300est">About Backtesting</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
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
            <div className="bg-white dark:bg-brand-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-brand-200 dark:border-brand-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-darkest dark:border-brand-light mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Running Backtest</h3>
                <p className="text-gray-600 dark:text-gray-100">
                  Analyzing historical data and simulating trades. This may take a few moments...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backtest;