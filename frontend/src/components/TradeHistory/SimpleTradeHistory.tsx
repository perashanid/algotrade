import React from 'react';

const SimpleTradeHistory: React.FC = () => {
  console.log('SimpleTradeHistory rendering...');
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trade History - Simple Test</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-300">This is a simple test component to verify the page loads.</p>
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">25</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Buy Orders</p>
              <p className="text-2xl font-bold text-green-600">15</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Sell Orders</p>
              <p className="text-2xl font-bold text-red-600">10</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">$125,000</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">AAPL</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      BUY
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$150.50</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">GOOGL</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      SELL
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,800.75</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTradeHistory;