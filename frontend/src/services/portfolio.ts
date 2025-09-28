import api from './api';
import { Portfolio, Position, PerformanceMetrics, APIResponse } from '../types';

export const portfolioService = {
  async getPortfolio(): Promise<Portfolio> {
    const response = await api.get<APIResponse<Portfolio>>('/portfolio');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch portfolio');
  },

  async getPositions(): Promise<Position[]> {
    const response = await api.get<APIResponse<Position[]>>('/portfolio/positions');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch positions');
  },

  async getPosition(symbol: string): Promise<Position> {
    const response = await api.get<APIResponse<Position>>(`/portfolio/positions/${symbol}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch position');
  },

  async updatePosition(stockSymbol: string, quantity: number, price: number): Promise<Position> {
    const response = await api.post<APIResponse<Position>>('/portfolio/positions', {
      stockSymbol,
      quantity,
      price
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to update position');
  },

  async deletePosition(symbol: string): Promise<void> {
    const response = await api.delete<APIResponse<any>>(`/portfolio/positions/${symbol}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete position');
    }
  },

  async getPerformance(timeRange: string = '1M'): Promise<PerformanceMetrics> {
    const response = await api.get<APIResponse<PerformanceMetrics>>('/portfolio/performance', {
      params: { timeRange }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch performance');
  },

  async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    positionCount: number;
    topPerformers: Array<{ symbol: string; gainLossPercent: number }>;
    worstPerformers: Array<{ symbol: string; gainLossPercent: number }>;
  }> {
    const response = await api.get<APIResponse<any>>('/portfolio/summary');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch portfolio summary');
  },

  async refreshPrices(): Promise<void> {
    const response = await api.post<APIResponse<any>>('/portfolio/refresh-prices');
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to refresh prices');
    }
  }
};