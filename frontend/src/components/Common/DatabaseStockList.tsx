import React, { useState, useEffect } from 'react';
import { Loader, Plus, Edit, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import DeleteButton from './DeleteButton';
import StockSearchInput from './StockSearchInput';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface DatabaseStockListProps {
  groupId: string;
  groupName: string;
  onUpdate: () => void;
}

const DatabaseStockList: React.FC<DatabaseStockListProps> = ({
  groupId,
  groupName,
  onUpdate
}) => {
  const [stocks, setStocks] = useState<string[]>([]);
  const [stockDetails, setStockDetails] = useState<Record<string, Stock>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingStock, setAddingStock] = useState(false);

  useEffect(() => {
    loadGroupStocks();
  }, [groupId]);

  const loadGroupStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading stocks for group:', groupId);
      
      // Get the constraint group data
      const response = await api.get('/constraint-groups');
      
      if (response.data.success) {
        const group = response.data.data.find((g: any) => g.id === groupId);
        if (group) {
          const groupStocks = Array.isArray(group.stocks) ? group.stocks : [];
          setStocks(groupStocks);
          console.log('Group stocks loaded:', groupStocks);
          
          // Load stock details for each stock
          await loadStockDetails(groupStocks);
        } else {
          setError('Group not found');
        }
      } else {
        setError('Failed to load group data');
      }
    } catch (error) {
      console.error('Error loading group stocks:', error);
      setError('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const loadStockDetails = async (stockSymbols: string[]) => {
    try {
      const details: Record<string, Stock> = {};
      
      // For now, we'll use the stock search API to get details
      // In a real app, you'd have a dedicated endpoint for stock details
      for (const symbol of stockSymbols) {
        try {
          const response = await api.get(`/stocks?search=${symbol}`);
          if (response.data.success) {
            const stock = response.data.data.find((s: Stock) => s.symbol === symbol);
            if (stock) {
              details[symbol] = stock;
            }
          }
        } catch (error) {
          console.warn(`Failed to load details for ${symbol}:`, error);
          // Fallback details
          details[symbol] = {
            symbol,
            name: `${symbol} Inc.`,
            sector: 'Unknown'
          };
        }
      }
      
      setStockDetails(details);
      console.log('Stock details loaded:', details);
    } catch (error) {
      console.error('Error loading stock details:', error);
    }
  };

  const handleAddStock = async (stockSymbol: string) => {
    try {
      console.log('Adding stock to group:', { groupId, stockSymbol });
      
      const response = await api.post(`/constraint-groups/${groupId}/stocks`, {
        stockSymbol: stockSymbol.toUpperCase()
      });
      
      if (response.data.success) {
        console.log('Stock added successfully');
        setAddingStock(false);
        await loadGroupStocks(); // Reload the stocks
        onUpdate(); // Notify parent component
      } else {
        throw new Error(response.data.error?.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error; // Let the dropdown handle the error display
    }
  };

  const handleRemoveStock = (stockSymbol: string) => {
    return async () => {
      try {
        console.log('Removing stock from group:', { groupId, stockSymbol });
        
        const response = await api.delete(`/constraint-groups/${groupId}/stocks/${stockSymbol}/remove`);
        
        if (response.data.success) {
          console.log('Stock removed successfully');
          await loadGroupStocks(); // Reload the stocks
          onUpdate(); // Notify parent component
        } else {
          throw new Error(response.data.error?.message || 'Failed to remove stock');
        }
      } catch (error) {
        console.error('Error removing stock:', error);
        throw error;
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading stocks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Stocks in {groupName} ({stocks.length})
        </h4>
        <button
          onClick={() => setAddingStock(true)}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Stock
        </button>
      </div>

      {/* Add Stock Form */}
      {addingStock && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <StockSearchInput
                onStockSelect={handleAddStock}
                placeholder="Search and select a stock to add..."
              />
            </div>
            <button
              onClick={() => setAddingStock(false)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stock List */}
      <div className="space-y-2">
        {stocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No stocks in this group yet.</p>
            <p className="text-sm">Click "Add Stock" to add some.</p>
          </div>
        ) : (
          stocks.map((stockSymbol) => {
            const stockInfo = stockDetails[stockSymbol];
            
            return (
              <div
                key={stockSymbol}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{stockSymbol}</h5>
                    </div>
                    {stockInfo && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{stockInfo.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stockInfo.sector}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <DeleteButton
                      onDelete={handleRemoveStock(stockSymbol)}
                      itemName={stockSymbol}
                      itemType="stock"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DatabaseStockList;