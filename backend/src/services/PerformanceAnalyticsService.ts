import { MarketDataService } from './MarketDataService';
import { PortfolioService } from './PortfolioService';
import { TradeHistoryModel } from '../models/TradeHistory';
import { PerformanceMetrics, Portfolio } from '../types';

export class PerformanceAnalyticsService {
  static async calculateDetailedPerformance(userId: string, timeRange: string = '1Y'): Promise<PerformanceMetrics> {
    try {
      const portfolio = await PortfolioService.getPortfolio(userId);
      const benchmarkData = await MarketDataService.getBenchmarkData(timeRange);
      
      // Get trade statistics for the time period
      const { startDate, endDate } = this.getDateRange(timeRange);
      const tradeStats = await TradeHistoryModel.getTradeStatistics(userId, startDate, endDate);
      
      // Calculate time-based returns
      const timeBasedReturns = await this.calculateTimeBasedReturns(portfolio, timeRange);
      
      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(portfolio, tradeStats);
      
      // Calculate benchmark comparison
      const benchmarkComparison = this.calculateBenchmarkComparison(
        portfolio.totalGainLossPercent,
        benchmarkData.changePercent
      );

      return {
        totalReturn: portfolio.totalGainLoss,
        totalReturnPercent: portfolio.totalGainLossPercent,
        dayReturn: timeBasedReturns.dayReturn,
        dayReturnPercent: timeBasedReturns.dayReturnPercent,
        weekReturn: timeBasedReturns.weekReturn,
        weekReturnPercent: timeBasedReturns.weekReturnPercent,
        monthReturn: timeBasedReturns.monthReturn,
        monthReturnPercent: timeBasedReturns.monthReturnPercent,
        yearReturn: timeBasedReturns.yearReturn,
        yearReturnPercent: timeBasedReturns.yearReturnPercent,
        benchmarkComparison,
        sharpeRatio: riskMetrics.sharpeRatio,
        maxDrawdown: riskMetrics.maxDrawdown
      };
    } catch (error) {
      console.error('Error calculating detailed performance:', error);
      throw error;
    }
  }

  static async getPortfolioVsBenchmark(userId: string, timeRange: string = '1M'): Promise<{
    portfolioPerformance: number;
    benchmarkPerformance: number;
    outperformance: number;
    timeRange: string;
  }> {
    try {
      const performance = await this.calculateDetailedPerformance(userId, timeRange);
      const benchmarkData = await MarketDataService.getBenchmarkData(timeRange);
      
      const portfolioPerformance = this.getPerformanceForTimeRange(performance, timeRange);
      const benchmarkPerformance = benchmarkData.changePercent;
      const outperformance = portfolioPerformance - benchmarkPerformance;

      return {
        portfolioPerformance,
        benchmarkPerformance,
        outperformance,
        timeRange
      };
    } catch (error) {
      console.error('Error calculating portfolio vs benchmark:', error);
      throw error;
    }
  }

  static async getPerformanceHistory(userId: string, days: number = 30): Promise<Array<{
    date: Date;
    portfolioValue: number;
    portfolioReturn: number;
    benchmarkReturn: number;
  }>> {
    try {
      // This is a simplified implementation
      // In a real system, you'd store daily portfolio snapshots
      // const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const portfolio = await PortfolioService.getPortfolio(userId);
      const history: Array<{
        date: Date;
        portfolioValue: number;
        portfolioReturn: number;
        benchmarkReturn: number;
      }> = [];

      // Generate mock historical data based on current portfolio
      // In production, this would come from stored daily snapshots
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Mock data - in reality, you'd fetch actual historical portfolio values
        const randomVariation = (Math.random() - 0.5) * 0.04; // ±2% daily variation
        const portfolioReturn = portfolio.totalGainLossPercent * (i / days) + randomVariation;
        const benchmarkReturn = (Math.random() - 0.5) * 0.02; // Mock benchmark data

        history.push({
          date,
          portfolioValue: portfolio.totalValue * (1 + portfolioReturn / 100),
          portfolioReturn,
          benchmarkReturn
        });
      }

      return history;
    } catch (error) {
      console.error('Error getting performance history:', error);
      throw error;
    }
  }

  static async getTopPerformingPositions(userId: string, limit: number = 5): Promise<Array<{
    symbol: string;
    return: number;
    returnPercent: number;
    currentValue: number;
  }>> {
    try {
      const portfolio = await PortfolioService.getPortfolio(userId);
      
      const positionPerformance = portfolio.positions.map(position => {
        const currentPrice = position.currentPrice || position.averageCost;
        const currentValue = position.quantity * currentPrice;
        const costBasis = position.quantity * position.averageCost;
        const returnAmount = currentValue - costBasis;
        const returnPercent = (returnAmount / costBasis) * 100;

        return {
          symbol: position.stockSymbol,
          return: returnAmount,
          returnPercent,
          currentValue
        };
      });

      // Sort by return percentage and take top performers
      return positionPerformance
        .sort((a, b) => b.returnPercent - a.returnPercent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top performing positions:', error);
      throw error;
    }
  }

  static async getWorstPerformingPositions(userId: string, limit: number = 5): Promise<Array<{
    symbol: string;
    return: number;
    returnPercent: number;
    currentValue: number;
  }>> {
    try {
      const topPerformers = await this.getTopPerformingPositions(userId, 100); // Get all positions
      
      // Return worst performers (lowest returns)
      return topPerformers
        .sort((a, b) => a.returnPercent - b.returnPercent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting worst performing positions:', error);
      throw error;
    }
  }

  static async getConstraintPerformanceAnalysis(userId: string): Promise<Array<{
    constraintId: string;
    symbol: string;
    totalTrades: number;
    successfulTrades: number;
    successRate: number;
    totalReturn: number;
    avgReturn: number;
  }>> {
    try {
      // This would require more sophisticated tracking of constraint-specific performance
      // For now, we'll provide a simplified analysis based on trade history
      const trades = await TradeHistoryModel.findByUserId(userId, 1000); // Get recent trades
      
      // Group trades by constraint
      const constraintGroups = new Map<string, any[]>();
      
      for (const trade of trades) {
        if (trade.constraintId) {
          if (!constraintGroups.has(trade.constraintId)) {
            constraintGroups.set(trade.constraintId, []);
          }
          constraintGroups.get(trade.constraintId)!.push(trade);
        }
      }

      const analysis: Array<{
        constraintId: string;
        symbol: string;
        totalTrades: number;
        successfulTrades: number;
        successRate: number;
        totalReturn: number;
        avgReturn: number;
      }> = [];

      for (const [constraintId, constraintTrades] of constraintGroups.entries()) {
        if (constraintTrades.length === 0) continue;

        const symbol = constraintTrades[0].stockSymbol;
        const totalTrades = constraintTrades.length;
        
        // Simplified success calculation (would need more sophisticated logic)
        const successfulTrades = Math.floor(totalTrades * 0.6); // Mock 60% success rate
        const successRate = (successfulTrades / totalTrades) * 100;
        
        // Mock return calculations
        const totalReturn = constraintTrades.reduce((sum, trade) => {
          return sum + (trade.quantity * trade.price * 0.02); // Mock 2% average return
        }, 0);
        
        const avgReturn = totalReturn / totalTrades;

        analysis.push({
          constraintId,
          symbol,
          totalTrades,
          successfulTrades,
          successRate,
          totalReturn,
          avgReturn
        });
      }

      return analysis.sort((a, b) => b.successRate - a.successRate);
    } catch (error) {
      console.error('Error getting constraint performance analysis:', error);
      throw error;
    }
  }

  private static calculateTimeBasedReturns(portfolio: Portfolio, _timeRange: string): {
    dayReturn: number;
    dayReturnPercent: number;
    weekReturn: number;
    weekReturnPercent: number;
    monthReturn: number;
    monthReturnPercent: number;
    yearReturn: number;
    yearReturnPercent: number;
  } {
    // Simplified calculation - in reality, you'd need historical portfolio values
    const totalReturn = portfolio.totalGainLoss;
    const totalReturnPercent = portfolio.totalGainLossPercent;

    // Mock time-based distribution of returns
    return {
      dayReturn: totalReturn * 0.05,
      dayReturnPercent: totalReturnPercent * 0.05,
      weekReturn: totalReturn * 0.15,
      weekReturnPercent: totalReturnPercent * 0.15,
      monthReturn: totalReturn * 0.4,
      monthReturnPercent: totalReturnPercent * 0.4,
      yearReturn: totalReturn,
      yearReturnPercent: totalReturnPercent
    };
  }

  private static calculateRiskMetrics(portfolio: Portfolio, _tradeStats: any): {
    sharpeRatio: number;
    maxDrawdown: number;
  } {
    const returnPercent = portfolio.totalGainLossPercent;
    const riskFreeRate = 2; // Assume 2% risk-free rate
    
    // Simplified volatility calculation
    const volatility = Math.abs(returnPercent) * 0.5 + 10; // Mock volatility
    
    const sharpeRatio = volatility > 0 ? (returnPercent - riskFreeRate) / volatility : 0;
    const maxDrawdown = Math.min(0, returnPercent * 0.3); // Mock max drawdown

    return {
      sharpeRatio,
      maxDrawdown
    };
  }

  private static calculateBenchmarkComparison(portfolioReturn: number, benchmarkReturn: number): number {
    return portfolioReturn - benchmarkReturn;
  }

  private static getPerformanceForTimeRange(performance: PerformanceMetrics, timeRange: string): number {
    switch (timeRange.toUpperCase()) {
      case '1D':
        return performance.dayReturnPercent;
      case '1W':
        return performance.weekReturnPercent;
      case '1M':
        return performance.monthReturnPercent;
      case '1Y':
        return performance.yearReturnPercent;
      default:
        return performance.totalReturnPercent;
    }
  }

  private static getDateRange(timeRange: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange.toUpperCase()) {
      case '1D':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    return { startDate, endDate };
  }
}