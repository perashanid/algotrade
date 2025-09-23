import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DarkModeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dark Mode Test
            </h1>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  Switch to Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Switch to Light
                </>
              )}
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Current theme: <span className="font-semibold">{theme}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Form Elements
              </h2>
              
              <div>
                <label className="label">Email</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="label">Message</label>
                <textarea 
                  className="input" 
                  rows={3}
                  placeholder="Enter your message"
                />
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-success">Success</button>
                <button className="btn btn-danger">Danger</button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Color Examples
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">Blue</div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm">Accent color</div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-green-600 dark:text-green-400 font-semibold">Green</div>
                  <div className="text-green-700 dark:text-green-300 text-sm">Success color</div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-red-600 dark:text-red-400 font-semibold">Red</div>
                  <div className="text-red-700 dark:text-red-300 text-sm">Error color</div>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">Yellow</div>
                  <div className="text-yellow-700 dark:text-yellow-300 text-sm">Warning color</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Trading Platform Elements
          </h2>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">$12,345</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Portfolio Value</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">+5.2%</div>
              <div className="text-sm text-green-700 dark:text-green-300">Daily P&L</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">-2.1%</div>
              <div className="text-sm text-red-700 dark:text-red-300">Drawdown</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">15</div>
              <div className="text-sm text-gray-700 dark:text-gray-400">Active Positions</div>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900 dark:text-white">AAPL</span>
              <span className="text-green-600 dark:text-green-400">+2.5%</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Apple Inc. - Technology stock with strong fundamentals
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkModeTest;