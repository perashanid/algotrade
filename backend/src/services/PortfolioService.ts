import { PositionModel } from '../models/Position';
import { MarketDataService } from './MarketDataService';
import { Portfolio, Position, PerformanceMetrics } from '../types';

export class PortfolioService {
  static async getPortfolio(userId: string): Promise<Portfolio> {
    try {
      const positions = await PositionModel.findByUserId(userId);
      
      // Update current prices for all positions
      if (positions.length > 0) {
        const symbols = positions.map(p => p.stockSymbol);
        const currentPrices = await MarketDataService.getMultiplePrices(symbols);
        
        // Update positions with current prices
        for (const position of positions) {
          const currentPrice = currentPrices.get(position.stockSymbol);
          if (currentPrice && currentPrice !== position.currentPrice) {
            await PositionModel.updateCurrentPrice(userId, position.stockSymbol, currentPrice);
            position.currentPrice = currentPrice;
          }
        }
      }

      // Calculate portfolio totals
      let totalValue = 0;
      let totalCost = 0;

      for (const position of positions) {
        const currentPrice = position.currentPrice || position.averageCost;
        const positionValue = position.quantity * currentPrice;
        const positionCost = position.quantity * position.averageCost;
        
        totalValue += positionValue;
        totalCost += positionCost;
      }

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      return {
        userId,
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        positions,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      throw error;
    }
  }

  static async getPositions(userId: string): Promise<Position[]> {
    return await PositionModel.findByUserId(userId);
  }

  static async updatePosition(userId: string, stockSymbol: string, quantity: number, price: number): Promise<Position> {
    return await PositionModel.upsert(userId, stockSymbol, quantity, price);
  }

  static async calculatePerformance(userId: string, timeRange: string = '1D'): Promise<PerformanceMetrics> {
    try {
      const portfolio = await this.getPortfolio(userId);
      const benchmarkData = await MarketDataService.getBenchmarkData(timeRange);
      
      // For now, we'll calculate basic performance metrics
      // In a real implementation, you'd need historical portfolio values
      const totalReturn = portfolio.totalGainLoss;
      const totalReturnPercent = portfolio.totalGainLossPercent;
      
      // Calculate benchmark comparison (simplified)
      const benchmarkComparison = totalReturnPercent - benchmarkData.changePercent;
      
      // Mock values for other metrics (would need historical data)
      const dayReturn = totalReturn * 0.1; // Simplified calculation
      const dayReturnPercent = totalReturnPercent * 0.1;
      const weekReturn = totalReturn * 0.3;
      const weekReturnPercent = totalReturnPercent * 0.3;
      const monthReturn = totalReturn * 0.7;
      const monthReturnPercent = totalReturnPercent * 0.7;
      const yearReturn = totalReturn;
      const yearReturnPercent = totalReturnPercent;

      return {
        totalReturn,
        totalReturnPercent,
        dayReturn,
        dayReturnPercent,
        weekReturn,
        weekReturnPercent,
        monthReturn,
        monthReturnPercent,
        yearReturn,
        yearReturnPercent,
        benchmarkComparison,
        sharpeRatio: this.calculateSharpeRatio(totalReturnPercent),
        maxDrawdown: this.calculateMaxDrawdown(totalReturnPercent)
      };
    } catch (error) {
      console.error('Error calculating performance:', error);
      throw error;
    }
  }

  static async getPositionBySymbol(userId: string, stockSymbol: string): Promise<Position | null> {
    return await PositionModel.findByUserIdAndSymbol(userId, stockSymbol);
  }

  static async deletePosition(userId: string, stockSymbol: string): Promise<boolean> {
    return await PositionModel.delete(userId, stockSymbol);
  }

  static async getPortfolioValue(userId: string): Promise<number> {
    const portfolio = await this.getPortfolio(userId);
    return portfolio.totalValue;
  }

  static async getPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    positionCount: number;
    topPerformers: Array<{ symbol: string; gainLossPercent: number }>;
    worstPerformers: Array<{ symbol: string; gainLossPercent: number }>;
  }> {
    const portfolio = await this.getPortfolio(userId);
    
    // Calculate individual position performance
    const positionPerformance = portfolio.positions.map(position => {
      const currentPrice = position.currentPrice || position.averageCost;
      const gainLossPercent = ((currentPrice - position.averageCost) / position.averageCost) * 100;
      
      return {
        symbol: position.stockSymbol,
        gainLossPercent
      };
    });

    // Sort by performance
    const sortedByPerformance = [...positionPerformance].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    
    return {
      totalValue: portfolio.totalValue,
      totalGainLoss: portfolio.totalGainLoss,
      totalGainLossPercent: portfolio.totalGainLossPercent,
      positionCount: portfolio.positions.length,
      topPerformers: sortedByPerformance.slice(0, 3),
      worstPerformers: sortedByPerformance.slice(-3).reverse()
    };
  }

  static async updateAllPositionPrices(): Promise<void> {
    try {
      // Get all unique symbols from positions
      const symbols = await PositionModel.getAllUniqueSymbols();
      
      if (symbols.length === 0) {
        return;
      }

      // Fetch current prices for all symbols
      const currentPrices = await MarketDataService.getMultiplePrices(symbols);
      
      // Prepare price updates
      const priceUpdates = Array.from(currentPrices.entries()).map(([symbol, price]) => ({
        symbol,
        price
      }));

      // Update all positions with current prices
      await PositionModel.updateAllCurrentPrices(priceUpdates);
      
      console.log(`Updated prices for ${priceUpdates.length} symbols`);
    } catch (error) {
      console.error('Error updating all position prices:', error);
      throw error;
    }
  }

  private static calculateSharpeRatio(returnPercent: number): number {
    // Simplified Sharpe ratio calculation
    // In reality, you'd need risk-free rate and standard deviation
    const riskFreeRate = 2; // Assume 2% risk-free rate
    const volatility = Math.abs(returnPercent) * 0.5; // Simplified volatility estimate
    
    if (volatility === 0) return 0;
    return (returnPercent - riskFreeRate) / volatility;
  }

  private static calculateMaxDrawdown(returnPercent: number): number {
    // Simplified max drawdown calculation
    // In reality, you'd need historical portfolio values
    return Math.min(0, returnPercent * 0.3); // Assume max drawdown is 30% of negative returns
  }
}