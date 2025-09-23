import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingDown, TrendingUp, Target, DollarSign, Percent, AlertCircle, Search, Tag, Users } from 'lucide-react';
import { CreateConstraintGroupRequest, StockGroup } from '../../types';
import { stockGroupsService } from '../../services/stockGroups';
import { getStockInfo } from '../../data/stockDatabase';
import StockSearchInput from '../Common/StockSearchInput';
import toast from 'react-hot-toast';

interface CreateConstraintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (constraint: CreateConstraintGroupRequest) => Promise<void>;
  stockGroups: StockGroup[];
  onStockGroupsUpdate?: () => void;
}

const CreateConstraintModal: React.FC<CreateConstraintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stockGroups,
  onStockGroupsUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateConstraintGroupRequest>({
    name: '',
    description: '',
    buyTriggerPercent: -5,
    sellTriggerPercent: 10,
    profitTriggerPercent: undefined,
    buyAmount: 1000,
    sellAmount: 500,
    stocks: [],
    stockGroups: []
  });


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isNameCustom, setIsNameCustom] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    stocks: [] as string[]
  });
  const [groupStockSearch, setGroupStockSearch] = useState('');

  // Comprehensive stock list for search
  const allStocks = [
    // Technology
    'AAPL', 'GOOGL', 'GOOG', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'CSCO', 'IBM', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'PINS', 'SQ', 'PYPL', 'SHOP', 'ROKU', 'ZM', 'DOCU', 'OKTA', 'CRWD', 'ZS', 'DDOG', 'SNOW', 'PLTR', 'RBLX',
    // Financial
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'SCHW', 'USB', 'PNC', 'TFC', 'COF', 'BK', 'STT', 'NTRS', 'RF', 'CFG', 'KEY', 'FITB', 'HBAN', 'ZION', 'CMA', 'MTB', 'SIVB', 'ALLY', 'V', 'MA', 'SPGI', 'MCO', 'ICE', 'CME', 'NDAQ', 'CBOE',
    // Healthcare
    'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'CVS', 'DHR', 'BMY', 'AMGN', 'GILD', 'MDT', 'CI', 'ANTM', 'HUM', 'CNC', 'WBA', 'BAX', 'BDX', 'SYK', 'BSX', 'EW', 'IDXX', 'REGN', 'VRTX', 'BIIB', 'ILMN', 'MRNA', 'ZTS', 'DXCM', 'ISRG',
    // Consumer Discretionary
    'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'BKNG', 'DIS', 'CMCSA', 'NFLX', 'GM', 'F', 'MAR', 'HLT', 'MGM', 'LVS', 'WYNN', 'CCL', 'RCL', 'NCLH', 'YUM', 'QSR', 'CMG', 'DPZ', 'ORLY', 'AZO', 'AAP', 'GPC',
    // Consumer Staples
    'WMT', 'PG', 'KO', 'PEP', 'COST', 'WBA', 'EL', 'CL', 'KMB', 'GIS', 'K', 'HSY', 'MKC', 'SJM', 'CAG', 'CPB', 'HRL', 'TSN', 'TAP', 'STZ', 'BF.B', 'PM', 'MO', 'BTI',
    // Energy
    'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'VLO', 'PSX', 'HES', 'OXY', 'DVN', 'FANG', 'MRO', 'APA', 'HAL', 'BKR', 'OIH', 'XLE', 'USO', 'UCO',
    // Industrials
    'BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'RTX', 'LMT', 'NOC', 'GD', 'DE', 'EMR', 'ETN', 'ITW', 'PH', 'CMI', 'FDX', 'WM', 'RSG', 'PCAR', 'NSC', 'UNP', 'CSX', 'KSU',
    // Materials
    'LIN', 'APD', 'ECL', 'SHW', 'FCX', 'NEM', 'GOLD', 'AA', 'X', 'CLF', 'NUE', 'STLD', 'RS', 'VMC', 'MLM', 'NTR', 'CF', 'MOS', 'FMC', 'LYB', 'DOW', 'DD', 'PPG', 'RPM',
    // Real Estate
    'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'EXR', 'AVB', 'EQR', 'WELL', 'DLR', 'BXP', 'VTR', 'ESS', 'MAA', 'UDR', 'CPT', 'FRT', 'REG', 'KIM', 'SPG', 'O', 'STOR',
    // Utilities
    'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'XEL', 'SRE', 'PEG', 'ED', 'EIX', 'WEC', 'AWK', 'DTE', 'ES', 'FE', 'AEE', 'CMS', 'NI', 'LNT', 'EVRG', 'PNW', 'ATO', 'NWE',
    // Communication Services
    'GOOGL', 'META', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'CHTR', 'TMUS', 'DISH', 'TWTR', 'SNAP', 'PINS', 'MTCH', 'IAC', 'NWSA', 'NYT', 'FOXA', 'PARA', 'WBD'
  ];

  // Get all stocks from selected stock groups
  const stocksFromGroups = formData.stockGroups.reduce((acc: string[], groupId) => {
    const group = stockGroups.find(g => g.id === groupId);
    return group ? [...acc, ...group.stocks] : acc;
  }, []);

  // Combine all available stocks (predefined + from selected groups)
  const allAvailableStocks = [...new Set([...allStocks, ...stocksFromGroups])].sort();



  // Popular stocks for quick selection (subset of all stocks)
  const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'JPM', 'BAC', 'WFC', 'GS', 'JNJ', 'PFE', 'UNH', 'WMT', 'HD', 'NKE'
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep(1);
      setFormData({
        name: '',
        description: '',
        buyTriggerPercent: -5,
        sellTriggerPercent: 10,
        profitTriggerPercent: undefined,
        buyAmount: 1000,
        sellAmount: 500,
        stocks: [],
        stockGroups: []
      });

      setErrors({});
      setIsNameCustom(false);
    }
  }, [isOpen]);



  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Name is now optional - will be auto-generated if empty
      if (formData.stocks.length === 0 && formData.stockGroups.length === 0) {
        newErrors.stocks = 'Select at least one stock or stock group';
      }
    }

    if (step === 2) {
      if (formData.buyTriggerPercent >= 0) {
        newErrors.buyTriggerPercent = 'Buy trigger must be negative (price drop)';
      }
      if (formData.sellTriggerPercent <= 0) {
        newErrors.sellTriggerPercent = 'Sell trigger must be positive (price rise)';
      }
      if (formData.buyAmount <= 0) {
        newErrors.buyAmount = 'Buy amount must be positive';
      }
      if (formData.sellAmount <= 0) {
        newErrors.sellAmount = 'Sell amount must be positive';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      
      // Use smart name if no custom name provided
      const finalData = {
        ...formData,
        name: formData.name.trim() || generateSmartName()
      };
      
      await onSubmit(finalData);
      onClose();
      toast.success('Constraint group created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create constraint group');
    } finally {
      setLoading(false);
    }
  };

  const addStock = (stock: string) => {
    console.log('Adding stock to constraint:', stock); // Debug log
    if (!formData.stocks.includes(stock)) {
      setFormData(prev => ({
        ...prev,
        stocks: [...prev.stocks, stock]
      }));
      console.log('Stock added successfully'); // Debug log
    } else {
      console.log('Stock already exists in list'); // Debug log
    }
  };

  const removeStock = (stock: string) => {
    setFormData(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== stock)
    }));
  };



  const toggleStockGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      stockGroups: prev.stockGroups.includes(groupId)
        ? prev.stockGroups.filter(id => id !== groupId)
        : [...prev.stockGroups, groupId]
    }));
  };

  // Generate smart name based on selection
  const generateSmartName = (): string => {
    // If only one individual stock selected
    if (formData.stocks.length === 1 && formData.stockGroups.length === 0) {
      return formData.stocks[0];
    }
    
    // If only one premade group selected
    if (formData.stocks.length === 0 && formData.stockGroups.length === 1) {
      const group = stockGroups.find(g => g.id === formData.stockGroups[0]);
      return group?.name || 'Stock Group';
    }
    
    // If multiple individual stocks selected (custom group)
    if (formData.stocks.length > 1 && formData.stockGroups.length === 0) {
      return formData.stocks.join(', ');
    }
    
    // If mix of stocks and groups, combine them
    if (formData.stocks.length > 0 || formData.stockGroups.length > 0) {
      const parts: string[] = [];
      
      // Add individual stocks
      if (formData.stocks.length > 0) {
        parts.push(...formData.stocks);
      }
      
      // Add group names
      formData.stockGroups.forEach(groupId => {
        const group = stockGroups.find(g => g.id === groupId);
        if (group) {
          parts.push(group.name);
        }
      });
      
      return parts.join(', ');
    }
    
    return '';
  };

  // Update name automatically when stocks/groups change (unless user has customized it)
  useEffect(() => {
    if (!isNameCustom) {
      const smartName = generateSmartName();
      if (smartName) {
        setFormData(prev => ({ ...prev, name: smartName }));
      }
    }
  }, [formData.stocks, formData.stockGroups, stockGroups, isNameCustom]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getTotalStocks = () => {
    const individualStocks = formData.stocks.length;
    const groupStocks = formData.stockGroups.reduce((total, groupId) => {
      const group = stockGroups.find(g => g.id === groupId);
      return total + (group?.stocks.length || 0);
    }, 0);
    return individualStocks + groupStocks;
  };

  const handleCreateNewGroup = () => {
    setShowCreateGroup(true);
    setNewGroupData({
      name: '',
      description: '',
      color: '#3B82F6',
      stocks: []
    });
    setGroupStockSearch('');
  };

  const handleCancelCreateGroup = () => {
    setShowCreateGroup(false);
    setNewGroupData({
      name: '',
      description: '',
      color: '#3B82F6',
      stocks: []
    });
    setGroupStockSearch('');
  };

  const handleSaveNewGroup = async () => {
    if (!newGroupData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (newGroupData.stocks.length === 0) {
      toast.error('Please add at least one stock to the group');
      return;
    }

    try {
      await stockGroupsService.createStockGroup({
        name: newGroupData.name,
        description: newGroupData.description,
        color: newGroupData.color,
        stocks: newGroupData.stocks
      });
      toast.success('Stock group created successfully!');
      setShowCreateGroup(false);
      if (onStockGroupsUpdate) {
        onStockGroupsUpdate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create stock group');
    }
  };

  const addStockToNewGroup = (stock: string) => {
    console.log('Adding stock to group:', stock); // Debug log
    if (!newGroupData.stocks.includes(stock)) {
      setNewGroupData(prev => ({
        ...prev,
        stocks: [...prev.stocks, stock]
      }));
      console.log('Stock added to group successfully'); // Debug log
    } else {
      console.log('Stock already exists in group'); // Debug log
    }
    setGroupStockSearch('');
  };

  const removeStockFromNewGroup = (stock: string) => {
    setNewGroupData(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== stock)
    }));
  };

  const filteredGroupStocks = allAvailableStocks.filter(stock => 
    stock.toLowerCase().includes(groupStockSearch.toLowerCase()) &&
    !newGroupData.stocks.includes(stock)
  );



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-visible transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Constraint Group</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Step {currentStep} of 2: {currentStep === 1 ? 'Select Stocks' : 'Configure Rules'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-4 ${
                currentStep >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="label">Constraint Name (Optional)</label>
                    {isNameCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNameCustom(false);
                          setFormData(prev => ({ ...prev, name: generateSmartName() }));
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      setIsNameCustom(true); // Mark as custom when user types
                    }}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Auto-generated based on your selection..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isNameCustom 
                      ? 'Using custom name. Click "Reset to Auto" to use auto-generated name.'
                      : 'Name will be auto-generated from selected stocks/groups'
                    }
                  </p>
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input h-20 resize-none"
                    placeholder="Describe your trading strategy..."
                  />
                </div>

                {/* Individual Stocks */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Individual Stocks
                  </h3>
                  
                  {/* Enhanced Stock Search */}
                  <div className="mb-4">
                    <StockSearchInput 
                      onStockSelect={addStock}
                      placeholder="Search by company name or symbol (e.g., Apple, AAPL)..."
                    />
                  </div>

                  {/* Popular Stocks */}
                  {(
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Stocks</h4>
                      <div className="flex flex-wrap gap-2">
                        {popularStocks.filter(stock => !formData.stocks.includes(stock)).slice(0, 12).map((stock) => (
                          <button
                            key={stock}
                            onClick={() => addStock(stock)}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                          >
                            {stock}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Stocks */}
                  {formData.stocks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Stocks ({formData.stocks.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.stocks.map((stock) => {
                          const stockInfo = getStockInfo(stock);
                          return (
                            <div
                              key={stock}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                              title={stockInfo ? stockInfo.name : stock}
                            >
                              <span className="text-sm font-medium">{stock}</span>
                              <button
                                onClick={() => removeStock(stock)}
                                className="hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {errors.stocks && <p className="error-text">{errors.stocks}</p>}
                </div>

                {/* Stock Groups */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Stock Groups
                    </h3>
                    <button
                      onClick={handleCreateNewGroup}
                      className="px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Group
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stockGroups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => toggleStockGroup(group.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.stockGroups.includes(group.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{group.stocks.length} stocks</p>
                            </div>
                          </div>
                          {formData.stockGroups.includes(group.id) && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{group.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.stocks.slice(0, 6).map((stock) => (
                            <span key={stock} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              {stock}
                            </span>
                          ))}
                          {group.stocks.length > 6 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{group.stocks.length - 6} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Selection Summary</h4>
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    Total stocks: <strong>{getTotalStocks()}</strong>
                    {formData.stockGroups.length > 0 && (
                      <span> ({formData.stockGroups.length} groups, {formData.stocks.length} individual)</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Buy Trigger */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Buy Trigger (Price Drop)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Trigger Percentage *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.buyTriggerPercent}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyTriggerPercent: parseFloat(e.target.value) }))}
                          className={`input pr-8 ${errors.buyTriggerPercent ? 'border-red-500' : ''}`}
                          step="0.1"
                          min="-50"
                          max="-0.1"
                        />
                        <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      {errors.buyTriggerPercent && <p className="error-text">{errors.buyTriggerPercent}</p>}
                    </div>

                    <div>
                      <label className="label">Buy Amount per Stock *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.buyAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyAmount: parseFloat(e.target.value) }))}
                          className={`input pl-8 ${errors.buyAmount ? 'border-red-500' : ''}`}
                          step="100"
                          min="100"
                          max="100000"
                        />
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      {errors.buyAmount && <p className="error-text">{errors.buyAmount}</p>}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Total potential: {formatCurrency(formData.buyAmount * getTotalStocks())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sell Trigger */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sell Trigger (Price Rise)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Trigger Percentage *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.sellTriggerPercent}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellTriggerPercent: parseFloat(e.target.value) }))}
                          className={`input pr-8 ${errors.sellTriggerPercent ? 'border-red-500' : ''}`}
                          step="0.1"
                          min="0.1"
                          max="100"
                        />
                        <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      {errors.sellTriggerPercent && <p className="error-text">{errors.sellTriggerPercent}</p>}
                    </div>

                    <div>
                      <label className="label">Sell Amount per Stock *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.sellAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellAmount: parseFloat(e.target.value) }))}
                          className={`input pl-8 ${errors.sellAmount ? 'border-red-500' : ''}`}
                          step="100"
                          min="100"
                          max="100000"
                        />
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      {errors.sellAmount && <p className="error-text">{errors.sellAmount}</p>}
                    </div>
                  </div>
                </div>

                {/* Profit Target */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profit Target (Optional)</h3>
                  </div>
                  
                  <div>
                    <label className="label">Profit Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.profitTriggerPercent || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, profitTriggerPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="input pr-8"
                        step="0.1"
                        min="0.1"
                        max="500"
                        placeholder="e.g., 15"
                      />
                      <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This constraint will apply to {getTotalStocks()} stocks. 
                        Maximum potential investment: {formatCurrency(formData.buyAmount * getTotalStocks())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 2 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Constraint'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create New Stock Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancelCreateGroup} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden transition-colors duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Stock Group</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Create a custom group of stocks for easy selection</p>
                </div>
                <button
                  onClick={handleCancelCreateGroup}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
                    <input
                      type="text"
                      value={newGroupData.name}
                      onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., My Tech Stocks"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                    <textarea
                      value={newGroupData.description}
                      onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                      placeholder="Describe this stock group..."
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newGroupData.color}
                        onChange={(e) => setNewGroupData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{newGroupData.color}</span>
                    </div>
                  </div>

                  {/* Stock Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Stocks</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={groupStockSearch}
                        onChange={(e) => setGroupStockSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search for stocks to add (e.g., AAPL, Apple)..."
                      />
                      
                      {/* Stock Search Dropdown */}
                      {groupStockSearch && filteredGroupStocks.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {filteredGroupStocks.slice(0, 10).map((stock) => (
                            <button
                              key={stock}
                              type="button"
                              onClick={() => addStockToNewGroup(stock)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{stock}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Click to add to group</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Popular Stocks for Quick Selection */}
                    {!groupStockSearch && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Stocks</h4>
                        <div className="flex flex-wrap gap-2">
                          {popularStocks.filter(stock => !newGroupData.stocks.includes(stock)).slice(0, 12).map((stock) => (
                            <button
                              key={stock}
                              type="button"
                              onClick={() => addStockToNewGroup(stock)}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                              {stock}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Stocks */}
                  {newGroupData.stocks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Stocks ({newGroupData.stocks.length})
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-32 overflow-y-auto">
                        {newGroupData.stocks.map((stock) => (
                          <div
                            key={stock}
                            className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full"
                          >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{stock}</span>
                            <button
                              onClick={() => removeStockFromNewGroup(stock)}
                              className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={handleCancelCreateGroup}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewGroup}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateConstraintModal;