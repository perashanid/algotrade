import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchStocks } from '../../data/stockDatabase';

interface StockSearchInputProps {
  onStockSelect: (stock: string) => void;
  placeholder?: string;
  className?: string;
}

const StockSearchInput: React.FC<StockSearchInputProps> = ({ 
  onStockSelect, 
  placeholder = "Search stocks...", 
  className = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchStocks(searchTerm, 12);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const handleStockSelect = (stock: string) => {
    onStockSelect(stock);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
      
      {showDropdown && searchResults.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[60] max-h-96 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking dropdown
        >
          {searchResults.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => handleStockSelect(stock.symbol)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stock.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stock.sector}</div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Click to add
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearchInput;