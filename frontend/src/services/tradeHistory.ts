import api from './api';
import { APIResponse, ClosedPosition, TradeHistory } from '../types';

// Mock data for demonstration
const generateMockTrades = (): TradeHistory[] => {
  const stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'JPM', 'BAC'];
  const tradeTypes: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
  const triggerTypes: ('PRICE_DROP' | 'PRICE_RISE' | 'PROFIT_TARGET')[] = ['PRICE_DROP', 'PRICE_RISE', 'PROFIT_TARGET'];
  
  const trades: TradeHistory[] = [];
  
  for (let i = 0; i < 50; i++) {
    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const tradeType = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
    const triggerType = triggerTypes[Math.floor(Math.random() * triggerTypes.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = Math.random() * 300 + 50;
    const triggerPrice = price * (0.95 + Math.random() * 0.1);
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    trades.push({
      id: `trade-${i + 1}`,
      userId: 'user-1',
      constraintId: `constraint-${Math.floor(Math.random() * 5) + 1}`,
      stockSymbol: stock,
      tradeType,
      triggerType,
      quantity,
      price,
      triggerPrice,
      executedAt: date.toISOString()
    });
  }
  
  return trades.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
};

export const tradeHistoryService = {
  async getTradeHistory(): Promise<TradeHistory[]> {
    try {
      const response = await api.get<APIResponse<TradeHistory[]>>('/trades');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch trade history');
    } catch (error) {
      // Return mock data if API fails
      return new Promise(resolve => {
        setTimeout(() => resolve(generateMockTrades()), 500);
      });
    }
  },

  async getClosedPositions(): Promise<ClosedPosition[]> {
    try {
      const response = await api.get<APIResponse<ClosedPosition[]>>('/trades?type=closed-positions');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch closed positions');
    } catch (error) {
      // Return empty array if API fails
      return [];
    }
  }
};