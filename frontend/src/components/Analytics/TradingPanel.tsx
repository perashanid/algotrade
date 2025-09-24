import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StockSearchInput from '../Common/StockSearchInput';

interface TradingPanelProps {
  onTradeComplete?: () => void;
  quickTradeSymbol?: string;
  quickTradeType?: 'buy' | 'sell';
  onQuickTradeClear?: () => void;
}

interface StockPrice {
  symbol: string;
  price: number;
  timestamp: string;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ onTradeComplete, quickTradeSymbol, quickTradeType, onQuickTradeClear }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentPrice, setCurrentPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [useStockSearch, setUseStockSearch] = useState(true);

  // Handle quick trade props
  useEffect(() => {
    if (quickTradeSymbol) {
      setSymbol(quickTradeSymbol.toUpperCase());
      setUseStockSearch(true); // Keep search mode for better UX
      if (quickTradeType) {
        setTradeType(quickTradeType);
      }
      // Auto-fetch price for quick trades
      fetchCurrentPrice(quickTradeSymbol);
      
      // Suggest a default quantity for quick trades
      if (!quantity) {
        setQuantity('10'); // Default to 10 shares for quick trades
      }
    }
  }, [quickTradeSymbol, quickTradeType]);

  const fetchCurrentPrice = async (stockSymbol: string) => {
    if (!stockSymbol.trim()) return;
    
    try {
      setPriceLoading(true);
      const response = await api.get(`/analytics/price/${stockSymbol.toUpperCase()}`);
      
      if (response.data.success && response.data.data) {
        setCurrentPrice(response.data.data);
      } else {
        throw new Error('Failed to fetch price');
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      toast.error(`Failed to fetch price for ${stockSymbol}`);
      setCurrentPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSymbolChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setSymbol(upperValue);
    setCurrentPrice(null);
  };

  // Auto-fetch price when symbol changes (debounced)
  useEffect(() => {
    if (symbol.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchCurrentPrice(symbol);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [symbol]);

  const handleStockSelect = (selectedSymbol: string) => {
    setSymbol(selectedSymbol.toUpperCase());
    setCurrentPrice(null);
    // Keep search mode active for better UX
    // setUseStockSearch(false);
    // Auto-fetch price when stock is selected
    fetchCurrentPrice(selectedSymbol);
  };

  const handleGetPrice = () => {
    if (symbol.trim()) {
      fetchCurrentPrice(symbol.trim());
    }
  };

  const handleTrade = async () => {
    if (!symbol.trim() || !quantity.trim() || !currentPrice) {
      toast.error('Please enter symbol, quantity, and get current price');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (quantityNum <= 0) {
      toast.error('Quantity must be a positive number');
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = tradeType === 'buy' ? '/analytics/buy' : '/analytics/sell';
      const response = await api.post(endpoint, {
        stockSymbol: symbol.trim(),
        quantity: quantityNum,
        price: currentPrice.price
      });

      if (response.data.success) {
        toast.success(response.data.data.message);
        
        // Reset form
        setSymbol('');
        setQuantity('');
        setCurrentPrice(null);
        
        // Notify parent component
        if (onTradeComplete) {
          onTradeComplete();
        }
      } else {
        throw new Error(response.data.error?.message || 'Trade failed');
      }
    } catch (error: any) {
      console.error('Error executing trade:', error);
      
      if (error.response?.data?.error?.code === 'PRICE_MISMATCH') {
        const newPrice = error.response.data.error.data?.currentPrice;
        if (newPrice) {
          setCurrentPrice({
            symbol: symbol,
            price: newPrice,
            timestamp: new Date().toISOString()
          });
          toast.error(`Price changed to $${newPrice.toFixed(2)}. Please confirm the trade.`);
        } else {
          toast.error('Price has changed. Please get the latest price.');
        }
      } else if (error.response?.data?.error?.code === 'INSUFFICIENT_SHARES') {
        toast.error(error.response.data.error.message);
      } else {
        toast.error(error.response?.data?.error?.message || 'Trade failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTradeValue = () => {
    if (!currentPrice || !quantity) return 0;
    return parseFloat(quantity) * currentPrice.price;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // P&L Estimation Component
  const PnLEstimation: React.FC<{
    symbol: string;
    tradeType: 'buy' | 'sell';
    quantity: number;
    price: number;
  }> = ({ symbol, tradeType, quantity, price }) => {
    const [existingPosition, setExistingPosition] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchExistingPosition = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/analytics/position/${symbol}`);
          if (response.data.success && response.data.data) {
            setExistingPosition(response.data.data);
          } else {
            setExistingPosition(null);
          }
        } catch (error) {
          setExistingPosition(null);
        } finally {
          setLoading(false);
        }
      };

      if (symbol.trim()) {
        fetchExistingPosition();
      }
    }, [symbol]);

    if (loading) {
      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-300">Loading position data...</div>
        </div>
      );
    }

    if (!existingPosition || existingPosition.quantity === 0) {
      return tradeType === 'buy' ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-200">
            New position: {quantity} shares at ${price.toFixed(2)}
          </div>
        </div>
      ) : null;
    }

    const currentQuantity = existingPosition.quantity;
    const averageCost = existingPosition.averageCost;

    if (tradeType === 'buy') {
      const newQuantity = currentQuantity + quantity;
      const newAverageCost = ((currentQuantity * averageCost) + (quantity * price)) / newQuantity;
      const costBasisChange = newAverageCost - averageCost;

      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm space-y-1">
            <div className="font-medium text-gray-900 dark:text-white">Position Update</div>
            <div className="text-gray-600 dark:text-gray-300">
              Current: {currentQuantity} shares @ ${averageCost.toFixed(2)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              New: {newQuantity} shares @ ${newAverageCost.toFixed(2)}
            </div>
            <div className={`${costBasisChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              Avg cost {costBasisChange > 0 ? 'increase' : 'decrease'}: ${Math.abs(costBasisChange).toFixed(2)}
            </div>
          </div>
        </div>
      );
    } else {
      // Selling
      if (quantity > currentQuantity) {
        return (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-200">
              ⚠️ Insufficient shares: You have {currentQuantity}, trying to sell {quantity}
            </div>
          </div>
        );
      }

      const realizedPnL = quantity * (price - averageCost);
      const remainingQuantity = currentQuantity - quantity;

      return (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm space-y-1">
            <div className="font-medium text-gray-900 dark:text-white">Sell Impact</div>
            <div className="text-gray-600 dark:text-gray-300">
              Selling {quantity} of {currentQuantity} shares
            </div>
            <div className={`${realizedPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Realized P&L: {formatCurrency(realizedPnL)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Remaining: {remainingQuantity} shares
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Trade</h3>
        </div>
        {quickTradeSymbol && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Quick {quickTradeType} for {quickTradeSymbol}
            </div>
            <button
              onClick={() => {
                setSymbol('');
                setQuantity('');
                setCurrentPrice(null);
                if (onQuickTradeClear) {
                  onQuickTradeClear();
                }
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Trade Type Toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tradeType === 'buy'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tradeType === 'sell'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="h-4 w-4 inline mr-1" />
            Sell
          </button>
        </div>

        {/* Stock Symbol Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Stock Symbol
            </label>
            <button
              onClick={() => setUseStockSearch(!useStockSearch)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {useStockSearch ? 'Manual Entry' : 'Search Stocks'}
            </button>
          </div>
          
          {useStockSearch ? (
            <StockSearchInput
              onStockSelect={handleStockSelect}
              placeholder="Search for stocks..."
              className="mb-2"
              value={symbol}
              onValueChange={handleSymbolChange}
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                placeholder="e.g., AAPL"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleGetPrice}
                disabled={!symbol.trim() || priceLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${priceLoading ? 'animate-spin' : ''}`} />
                Price
              </button>
            </div>
          )}
        </div>

        {/* Current Price Display */}
        {currentPrice && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Current Price</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${currentPrice.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated: {formatTime(currentPrice.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            {currentPrice && (
              <div className="flex gap-1">
                {[5, 10, 25, 50].map((suggestedQty) => (
                  <button
                    key={suggestedQty}
                    onClick={() => setQuantity(suggestedQty.toString())}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    {suggestedQty}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Number of shares"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Trade Value Display */}
        {currentPrice && quantity && parseFloat(quantity) > 0 && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {tradeType === 'buy' ? 'Total Cost' : 'Total Proceeds'}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculateTradeValue())}
                </span>
              </div>
            </div>
            
            {/* P&L Estimation for existing positions */}
            <PnLEstimation 
              symbol={symbol}
              tradeType={tradeType}
              quantity={parseFloat(quantity)}
              price={currentPrice.price}
            />
          </div>
        )}

        {/* Warning for Sell Orders */}
        {tradeType === 'sell' && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Make sure you have sufficient shares in your portfolio before selling.
            </p>
          </div>
        )}

        {/* Trade Button */}
        <button
          onClick={handleTrade}
          disabled={!symbol.trim() || !quantity.trim() || !currentPrice || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            tradeType === 'buy'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {tradeType === 'buy' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {tradeType === 'buy' ? 'Buy Shares' : 'Sell Shares'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TradingPanel;