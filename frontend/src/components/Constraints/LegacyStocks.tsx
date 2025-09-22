import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Target, Star, Award, Shield } from 'lucide-react';
import { constraintsService } from '../../services/constraints';
import { CreateConstraintRequest } from '../../types';
import toast from 'react-hot-toast';

// Proven legacy stocks with their categories and key metrics
const legacyStocks = [
  // Dividend Aristocrats - 25+ years of dividend increases
  {
    symbol: 'KO',
    name: 'Coca-Cola',
    category: 'Dividend Aristocrat',
    description: '60+ years of dividend increases, global beverage leader',
    dividendYears: 60,
    sector: 'Consumer Staples',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    category: 'Dividend Aristocrat',
    description: '60+ years of dividend increases, healthcare giant',
    dividendYears: 60,
    sector: 'Healthcare',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble',
    category: 'Dividend Aristocrat',
    description: '67+ years of dividend increases, consumer goods',
    dividendYears: 67,
    sector: 'Consumer Staples',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'MMM',
    name: '3M Company',
    category: 'Dividend Aristocrat',
    description: '64+ years of dividend increases, industrial conglomerate',
    dividendYears: 64,
    sector: 'Industrials',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'CAT',
    name: 'Caterpillar',
    category: 'Dividend Aristocrat',
    description: '29+ years of dividend increases, heavy machinery',
    dividendYears: 29,
    sector: 'Industrials',
    icon: <Award className="h-4 w-4" />
  },
  
  // Blue Chip Stalwarts
  {
    symbol: 'IBM',
    name: 'IBM',
    category: 'Blue Chip',
    description: '100+ year history, technology and consulting services',
    dividendYears: 28,
    sector: 'Technology',
    icon: <Shield className="h-4 w-4" />
  },
  {
    symbol: 'GE',
    name: 'General Electric',
    category: 'Blue Chip',
    description: '130+ year history, industrial conglomerate',
    dividendYears: 0,
    sector: 'Industrials',
    icon: <Shield className="h-4 w-4" />
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil',
    category: 'Blue Chip',
    description: '140+ year history, integrated oil & gas',
    dividendYears: 40,
    sector: 'Energy',
    icon: <Shield className="h-4 w-4" />
  },
  {
    symbol: 'CVX',
    name: 'Chevron',
    category: 'Blue Chip',
    description: '140+ year history, integrated oil & gas',
    dividendYears: 36,
    sector: 'Energy',
    icon: <Shield className="h-4 w-4" />
  },
  
  // Utility Stalwarts
  {
    symbol: 'SO',
    name: 'Southern Company',
    category: 'Utility',
    description: '22+ years of dividend increases, electric utility',
    dividendYears: 22,
    sector: 'Utilities',
    icon: <Star className="h-4 w-4" />
  },
  {
    symbol: 'D',
    name: 'Dominion Energy',
    category: 'Utility',
    description: '19+ years of dividend increases, electric & gas utility',
    dividendYears: 19,
    sector: 'Utilities',
    icon: <Star className="h-4 w-4" />
  },
  {
    symbol: 'NEE',
    name: 'NextEra Energy',
    category: 'Utility',
    description: '28+ years of dividend increases, renewable energy leader',
    dividendYears: 28,
    sector: 'Utilities',
    icon: <Star className="h-4 w-4" />
  },
  
  // Financial Stalwarts
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase',
    category: 'Financial',
    description: '12+ years of dividend increases, largest US bank',
    dividendYears: 12,
    sector: 'Financials',
    icon: <Shield className="h-4 w-4" />
  },
  {
    symbol: 'BAC',
    name: 'Bank of America',
    category: 'Financial',
    description: '10+ years of dividend increases, major US bank',
    dividendYears: 10,
    sector: 'Financials',
    icon: <Shield className="h-4 w-4" />
  },
  
  // Consumer Staples
  {
    symbol: 'WMT',
    name: 'Walmart',
    category: 'Consumer Staple',
    description: '49+ years of dividend increases, retail giant',
    dividendYears: 49,
    sector: 'Consumer Staples',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'MCD',
    name: 'McDonald\'s',
    category: 'Consumer Staple',
    description: '46+ years of dividend increases, global fast food',
    dividendYears: 46,
    sector: 'Consumer Discretionary',
    icon: <Award className="h-4 w-4" />
  },
  {
    symbol: 'HD',
    name: 'Home Depot',
    category: 'Consumer Staple',
    description: '14+ years of dividend increases, home improvement',
    dividendYears: 14,
    sector: 'Consumer Discretionary',
    icon: <Award className="h-4 w-4" />
  },
  
  // Telecom Legacy
  {
    symbol: 'T',
    name: 'AT&T',
    category: 'Telecom',
    description: '38+ years of dividend increases, telecom giant',
    dividendYears: 38,
    sector: 'Communication Services',
    icon: <Shield className="h-4 w-4" />
  },
  {
    symbol: 'VZ',
    name: 'Verizon',
    category: 'Telecom',
    description: '17+ years of dividend increases, wireless leader',
    dividendYears: 17,
    sector: 'Communication Services',
    icon: <Shield className="h-4 w-4" />
  }
];

interface LegacyStocksProps {
  onConstraintCreated: () => void;
}

const LegacyStocks: React.FC<LegacyStocksProps> = ({ onConstraintCreated }) => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<CreateConstraintRequest>({
    stockSymbol: '',
    buyTriggerPercent: -5,
    sellTriggerPercent: 10,
    profitTriggerPercent: 15,
    buyAmount: 1000,
    sellAmount: 1000
  });

  const categories = ['all', 'Dividend Aristocrat', 'Blue Chip', 'Utility', 'Financial', 'Consumer Staple', 'Telecom'];
  
  const filteredStocks = legacyStocks.filter(stock => 
    filter === 'all' || stock.category === filter
  );

  const handleStockSelect = (stock: typeof legacyStocks[0]) => {
    setSelectedStock(stock.symbol);
    setFormData(prev => ({ ...prev, stockSymbol: stock.symbol }));
    setShowCreateForm(true);
  };

  const handleCreateConstraint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock) return;
    
    try {
      setLoading(true);
      await constraintsService.createConstraint(formData);
      toast.success(`Constraint created for ${selectedStock}!`);
      setShowCreateForm(false);
      setSelectedStock(null);
      onConstraintCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create constraint');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Dividend Aristocrat': return 'bg-yellow-100 text-yellow-800';
      case 'Blue Chip': return 'bg-blue-100 text-blue-800';
      case 'Utility': return 'bg-green-100 text-green-800';
      case 'Financial': return 'bg-purple-100 text-purple-800';
      case 'Consumer Staple': return 'bg-orange-100 text-orange-800';
      case 'Telecom': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (showCreateForm && selectedStock) {
    const stock = legacyStocks.find(s => s.symbol === selectedStock);
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              {stock?.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Constraint for {stock?.symbol}
              </h2>
              <p className="text-gray-600">{stock?.name} - {stock?.description}</p>
            </div>
          </div>

          <form onSubmit={handleCreateConstraint} className="space-y-6">
            {/* Buy Trigger */}
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Buy Trigger (Price Drop)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Trigger Percentage</label>
                  <input
                    type="number"
                    value={formData.buyTriggerPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                    className="input"
                    step="0.1"
                    min="-50"
                    max="-0.1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Buy Amount</label>
                  <input
                    type="number"
                    value={formData.buyAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                    className="input"
                    step="100"
                    min="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sell Trigger */}
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Sell Trigger (Price Rise)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Trigger Percentage</label>
                  <input
                    type="number"
                    value={formData.sellTriggerPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                    className="input"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Sell Amount</label>
                  <input
                    type="number"
                    value={formData.sellAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                    className="input"
                    step="100"
                    min="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profit Target */}
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Profit Target (Optional)</h3>
              </div>
              
              <div>
                <label className="label">Profit Percentage</label>
                <input
                  type="number"
                  value={formData.profitTriggerPercent || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="input"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Constraint'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Legacy Stocks</h2>
        <p className="text-gray-600">
          Time-tested companies with proven track records and consistent dividend payments
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Legacy Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStocks.map((stock) => (
          <div
            key={stock.symbol}
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStockSelect(stock)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {stock.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
              </div>
              <Plus className="h-4 w-4 text-gray-400" />
            </div>

            <div className="mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(stock.category)}`}>
                {stock.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{stock.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{stock.sector}</span>
              {stock.dividendYears > 0 && (
                <span>{stock.dividendYears}+ yrs dividends</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No stocks found in this category</p>
        </div>
      )}
    </div>
  );
};

export default LegacyStocks;