import { PositionModel } from '../models/Position';
import { MarketDataService } from './MarketDataService';
import { Portfolio, Position, PerformanceMetrics } from '../types';
import { CacheService, CacheKeys, CacheTTL, CacheInvalidationStrategy } from './CacheService';
import { executeQueryWithRetry } from '../config/database';

export class PortfolioService {
  static async getPortfolio(userId: string): Promise<Portfolio> {
    return await CacheService.getOrSet(
      CacheKeys.portfolio(userId),
      () => this.getPortfolioFromDatabase(userId),
      CacheTTL.PORTFOLIO
    );
  }

  // Optimized portfolio query with database-level calculations
  private static async getPortfolioFromDatabase(userId: string): Promise<Portfolio> {
    try {
      // Single optimized query with calculations at database level
      const query = `
        WITH portfolio_positions AS (
          SELECT 
            p.id,
            p.user_id,
            p.stock_symbol,
            p.quantity,
            p.average_cost,
            p.current_price,
            p.last_updated,
            p.quantity * COALESCE(p.current_price, p.average_cost) as market_value,
            (p.quantity * COALESCE(p.current_price, p.average_cost)) - (p.quantity * p.average_cost) as unrealized_pnl,
            p.quantity * p.average_cost as cost_basis
          FROM positions p
          WHERE p.user_id = $1 AND p.quantity > 0
        ),
        portfolio_summary AS (
          SELECT 
            user_id,
            SUM(market_value) as total_value,
            SUM(unrealized_pnl) as total_gain_loss,
            SUM(cost_basis) as total_cost,
            COUNT(*) as position_count
          FROM portfolio_positions
          GROUP BY user_id
        )
        SELECT 
          pp.*,
          ps.total_value,
          ps.total_gain_loss,
          ps.total_cost,
          ps.position_count
        FROM portfolio_positions pp
        CROSS JOIN portfolio_summary ps
        ORDER BY pp.stock_symbol;
      `;

      const result = await executeQueryWithRetry(query, [userId]);
      
      if (result.rows.length === 0) {
        return {
          userId,
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          positions: [],
          lastUpdated: new Date()
        };
      }

      // Extract portfolio summary from first row
      const firstRow = result.rows[0];
      const totalValue = parseFloat(firstRow.total_value) || 0;
      const totalGainLoss = parseFloat(firstRow.total_gain_loss) || 0;
      const totalCost = parseFloat(firstRow.total_cost) || 0;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      // Map positions
      const positions: Position[] = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        stockSymbol: row.stock_symbol,
        quantity: parseFloat(row.quantity),
        averageCost: parseFloat(row.average_cost),
        currentPrice: row.current_price ? parseFloat(row.current_price) : undefined,
        lastUpdated: row.last_updated
      }));

      // Check if we need to update prices
      const symbolsNeedingUpdate = positions
        .filter(p => !p.currentPrice || this.isPriceStale(p.lastUpdated))
        .map(p => p.stockSymbol);

      if (symbolsNeedingUpdate.length > 0) {
        // Update prices in background and refresh cache
        this.updatePositionPricesBackground(userId, symbolsNeedingUpdate);
      }

      return {
        userId,
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        positions,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting portfolio from database:', error);
      throw error;
    }
  }

  static async getPositions(userId: string): Promise<Position[]> {
    return await CacheService.getOrSet(
      CacheKeys.positions(userId),
      () => PositionModel.findByUserId(userId),
      CacheTTL.PORTFOLIO
    );
  }

  static async updatePosition(userId: string, stockSymbol: string, quantity: number, price: number): Promise<Position> {
    try {
      const position = await PositionModel.upsert(userId, stockSymbol, quantity, price);
      
      // Invalidate related cache entries
      await CacheInvalidationStrategy.onPortfolioUpdate(userId);
      
      return position;
    } catch (error) {
      console.error('Error updating position:', error);
      throw error;
    }
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
    try {
      const result = await PositionModel.delete(userId, stockSymbol);
      
      if (result) {
        // Invalidate related cache entries
        await CacheInvalidationStrategy.onPortfolioUpdate(userId);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting position:', error);
      throw error;
    }
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
    return await CacheService.getOrSet(
      CacheKeys.portfolioSummary(userId),
      () => this.getPortfolioSummaryFromDatabase(userId),
      CacheTTL.PORTFOLIO
    );
  }

  // Optimized portfolio summary with database-level calculations
  private static async getPortfolioSummaryFromDatabase(userId: string): Promise<{
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    positionCount: number;
    topPerformers: Array<{ symbol: string; gainLossPercent: number }>;
    worstPerformers: Array<{ symbol: string; gainLossPercent: number }>;
  }> {
    try {
      const query = `
        WITH position_performance AS (
          SELECT 
            stock_symbol,
            quantity,
            average_cost,
            COALESCE(current_price, average_cost) as effective_price,
            quantity * COALESCE(current_price, average_cost) as market_value,
            (quantity * COALESCE(current_price, average_cost)) - (quantity * average_cost) as unrealized_pnl,
            quantity * average_cost as cost_basis,
            CASE 
              WHEN average_cost > 0 THEN 
                ((COALESCE(current_price, average_cost) - average_cost) / average_cost) * 100
              ELSE 0 
            END as gain_loss_percent
          FROM positions
          WHERE user_id = $1 AND quantity > 0
        ),
        summary_stats AS (
          SELECT 
            SUM(market_value) as total_value,
            SUM(unrealized_pnl) as total_gain_loss,
            SUM(cost_basis) as total_cost,
            COUNT(*) as position_count
          FROM position_performance
        )
        SELECT 
          pp.stock_symbol,
          pp.gain_loss_percent,
          ss.total_value,
          ss.total_gain_loss,
          ss.total_cost,
          ss.position_count
        FROM position_performance pp
        CROSS JOIN summary_stats ss
        ORDER BY pp.gain_loss_percent DESC;
      `;

      const result = await executeQueryWithRetry(query, [userId]);
      
      if (result.rows.length === 0) {
        return {
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          positionCount: 0,
          topPerformers: [],
          worstPerformers: []
        };
      }

      const firstRow = result.rows[0];
      const totalValue = parseFloat(firstRow.total_value) || 0;
      const totalGainLoss = parseFloat(firstRow.total_gain_loss) || 0;
      const totalCost = parseFloat(firstRow.total_cost) || 0;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
      const positionCount = parseInt(firstRow.position_count) || 0;

      // Extract performance data
      const performanceData = result.rows.map((row: any) => ({
        symbol: row.stock_symbol,
        gainLossPercent: parseFloat(row.gain_loss_percent) || 0
      }));

      return {
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        positionCount,
        topPerformers: performanceData.slice(0, 3),
        worstPerformers: performanceData.slice(-3).reverse()
      };
    } catch (error) {
      console.error('Error getting portfolio summary from database:', error);
      throw error;
    }
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

      // Update all positions with current prices using batch operation
      await this.batchUpdatePositionPrices(priceUpdates);
      
      // Invalidate price-related cache entries
      await CacheInvalidationStrategy.onPriceUpdate(symbols);
      
      console.log(`Updated prices for ${priceUpdates.length} symbols`);
    } catch (error) {
      console.error('Error updating all position prices:', error);
      throw error;
    }
  }

  // Optimized batch price update with single transaction
  private static async batchUpdatePositionPrices(priceUpdates: { symbol: string; price: number }[]): Promise<void> {
    if (priceUpdates.length === 0) return;

    try {
      // Use a single query with VALUES clause for batch update
      const values = priceUpdates.map((_update, index) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');

      const params = priceUpdates.flatMap(update => [update.symbol.toUpperCase(), update.price]);

      const query = `
        UPDATE positions 
        SET 
          current_price = updates.price,
          last_updated = CURRENT_TIMESTAMP
        FROM (VALUES ${values}) AS updates(symbol, price)
        WHERE positions.stock_symbol = updates.symbol;
      `;

      await executeQueryWithRetry(query, params);
    } catch (error) {
      console.error('Error in batch price update:', error);
      throw error;
    }
  }

  // Background price update for specific symbols
  private static async updatePositionPricesBackground(userId: string, symbols: string[]): Promise<void> {
    try {
      // Don't await - run in background
      MarketDataService.getMultiplePrices(symbols).then(async (prices) => {
        const priceUpdates = Array.from(prices.entries()).map(([symbol, price]) => ({
          symbol,
          price
        }));

        if (priceUpdates.length > 0) {
          await this.batchUpdatePositionPrices(priceUpdates);
          
          // Refresh portfolio cache with updated prices
          await CacheService.backgroundRefresh(
            CacheKeys.portfolio(userId),
            () => this.getPortfolioFromDatabase(userId),
            CacheTTL.PORTFOLIO
          );
        }
      }).catch(error => {
        console.error('Background price update failed:', error);
      });
    } catch (error) {
      console.error('Error starting background price update:', error);
    }
  }

  // Check if price data is stale (older than 5 minutes)
  private static isPriceStale(lastUpdated: Date): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastUpdated) < fiveMinutesAgo;
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