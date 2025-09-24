import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PortfolioService } from '../services/PortfolioService';
import { PortfolioHistoryModel } from '../models/PortfolioHistory';
import { MarketDataService } from '../services/MarketDataService';
import { PositionModel } from '../models/Position';

export class AnalyticsController {
  static async getPortfolioHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const timeRange = (req.query.timeRange as '7d' | '30d' | '90d' | '1y') || '30d';
      const historicalData = await PortfolioHistoryModel.getHistoricalData(userId, timeRange);

      // If no historical data, create initial snapshot
      if (historicalData.length === 0) {
        const portfolio = await PortfolioService.getPortfolio(userId);
        await PortfolioHistoryModel.createSnapshot(
          userId,
          portfolio.totalValue,
          portfolio.totalGainLoss,
          portfolio.totalGainLossPercent,
          portfolio.positions.length
        );
        
        // Return the current portfolio as single data point
        res.json({
          success: true,
          data: [{
            timestamp: new Date(),
            totalValue: portfolio.totalValue,
            totalGainLoss: portfolio.totalGainLoss,
            totalGainLossPercent: portfolio.totalGainLossPercent,
            positionCount: portfolio.positions.length
          }]
        });
        return;
      }

      // Format data for frontend
      const formattedData = historicalData.map(snapshot => ({
        timestamp: snapshot.timestamp,
        totalValue: snapshot.totalValue,
        totalGainLoss: snapshot.totalGainLoss,
        totalGainLossPercent: snapshot.totalGainLossPercent,
        positionCount: snapshot.positionCount
      }));

      res.json({
        success: true,
        data: formattedData
      });

    } catch (error) {
      console.error('Error getting portfolio history:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get portfolio history',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  static async getRealTimeAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      // Get current portfolio with fresh prices (with error handling)
      try {
        await PortfolioService.updateAllPositionPrices();
      } catch (priceError) {
        console.warn('Failed to update all position prices, continuing with cached prices:', priceError);
      }
      
      const portfolio = await PortfolioService.getPortfolio(userId);
      const positions = await PositionModel.findByUserId(userId);

      // Calculate additional analytics
      const activePositions = positions.filter(p => p.quantity > 0);
      const profitablePositions = activePositions.filter(p => {
        const currentPrice = p.currentPrice || p.averageCost;
        return currentPrice > p.averageCost;
      });
      const losingPositions = activePositions.filter(p => {
        const currentPrice = p.currentPrice || p.averageCost;
        return currentPrice < p.averageCost;
      });

      // Top and bottom performers
      const performanceData = activePositions.map(p => {
        const currentPrice = p.currentPrice || p.averageCost;
        const gainLossPercent = p.averageCost > 0 ? ((currentPrice - p.averageCost) / p.averageCost) * 100 : 0;
        const unrealizedPnl = p.quantity * (currentPrice - p.averageCost);
        
        return {
          stockSymbol: p.stockSymbol,
          currentPrice,
          quantity: p.quantity,
          averageCost: p.averageCost,
          marketValue: p.quantity * currentPrice,
          unrealizedPnl,
          unrealizedPnlPercent: gainLossPercent,
          isPriceStale: p.lastUpdated ? (Date.now() - new Date(p.lastUpdated).getTime()) > 5 * 60 * 1000 : true
        };
      }).sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent);

      const topPerformers = performanceData.slice(0, 5);
      const bottomPerformers = performanceData.slice(-5).reverse();

      // Sector allocation (simplified - would need sector data)
      const sectorAllocation = AnalyticsController.calculateSectorAllocation(activePositions);

      res.json({
        success: true,
        data: {
          portfolio: {
            totalValue: portfolio.totalValue,
            totalGainLoss: portfolio.totalGainLoss,
            totalGainLossPercent: portfolio.totalGainLossPercent,
            positionCount: activePositions.length
          },
          positions: performanceData,
          summary: {
            activePositions: activePositions.length,
            profitablePositions: profitablePositions.length,
            losingPositions: losingPositions.length,
            breakEvenPositions: activePositions.length - profitablePositions.length - losingPositions.length
          },
          topPerformers,
          bottomPerformers,
          sectorAllocation,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get real-time analytics',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  static async buyStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const { stockSymbol, quantity, price } = req.body;

      if (!stockSymbol || !quantity || !price) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stock symbol, quantity, and price are required'
          }
        });
        return;
      }

      if (quantity <= 0 || price <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Quantity and price must be positive numbers'
          }
        });
        return;
      }

      // Get current market price to validate
      const currentPrice = await MarketDataService.getCurrentPrice(stockSymbol);
      
      // Allow some tolerance for price differences (5%)
      const priceTolerance = 0.05;
      if (Math.abs(price - currentPrice) / currentPrice > priceTolerance) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PRICE_MISMATCH',
            message: `Price ${price} is too different from current market price ${currentPrice}`,
            data: { currentPrice }
          }
        });
        return;
      }

      // Update position
      const position = await PortfolioService.updatePosition(userId, stockSymbol, quantity, price);

      res.json({
        success: true,
        data: {
          position,
          message: `Successfully bought ${quantity} shares of ${stockSymbol} at $${price}`
        }
      });

    } catch (error) {
      console.error('Error buying stock:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to buy stock',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  static async sellStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      const { stockSymbol, quantity, price } = req.body;

      if (!stockSymbol || !quantity || !price) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stock symbol, quantity, and price are required'
          }
        });
        return;
      }

      if (quantity <= 0 || price <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Quantity and price must be positive numbers'
          }
        });
        return;
      }

      // Check if user has enough shares
      const existingPosition = await PositionModel.findByUserIdAndSymbol(userId, stockSymbol);
      if (!existingPosition || existingPosition.quantity < quantity) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_SHARES',
            message: `You only have ${existingPosition?.quantity || 0} shares of ${stockSymbol}`
          }
        });
        return;
      }

      // Get current market price to validate
      const currentPrice = await MarketDataService.getCurrentPrice(stockSymbol);
      
      // Allow some tolerance for price differences (5%)
      const priceTolerance = 0.05;
      if (Math.abs(price - currentPrice) / currentPrice > priceTolerance) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PRICE_MISMATCH',
            message: `Price ${price} is too different from current market price ${currentPrice}`,
            data: { currentPrice }
          }
        });
        return;
      }

      // Update position (negative quantity for selling)
      const position = await PortfolioService.updatePosition(userId, stockSymbol, -quantity, price);

      res.json({
        success: true,
        data: {
          position,
          message: `Successfully sold ${quantity} shares of ${stockSymbol} at $${price}`
        }
      });

    } catch (error) {
      console.error('Error selling stock:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to sell stock',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  static async getCurrentPrice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stock symbol is required'
          }
        });
        return;
      }

      const price = await MarketDataService.getCurrentPrice(symbol);
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          price,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error getting current price:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get current price',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  static async getPosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { symbol } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
        return;
      }

      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stock symbol is required'
          }
        });
        return;
      }

      const position = await PositionModel.findByUserIdAndSymbol(userId, symbol.toUpperCase());
      
      if (!position) {
        res.json({
          success: true,
          data: null
        });
        return;
      }

      // Get current price for the position
      const currentPrice = await MarketDataService.getCurrentPrice(symbol);
      const unrealizedPnL = position.quantity * (currentPrice - position.averageCost);
      const unrealizedPnLPercent = position.averageCost > 0 ? ((currentPrice - position.averageCost) / position.averageCost) * 100 : 0;

      res.json({
        success: true,
        data: {
          stockSymbol: position.stockSymbol,
          quantity: position.quantity,
          averageCost: position.averageCost,
          currentPrice,
          marketValue: position.quantity * currentPrice,
          unrealizedPnL,
          unrealizedPnLPercent,
          lastUpdated: position.lastUpdated
        }
      });

    } catch (error) {
      console.error('Error getting position:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get position',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      });
    }
  }

  private static calculateSectorAllocation(positions: any[]): { sector: string; value: number; percentage: number }[] {
    // Simplified sector allocation - in reality, you'd need sector data for each stock
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Industrial', 'Other'];
    const totalValue = positions.reduce((sum, p) => sum + (p.quantity * (p.currentPrice || p.averageCost)), 0);
    
    // Mock sector distribution
    return sectors.map((sector) => {
      const value = totalValue * (0.1 + Math.random() * 0.3); // Random distribution for demo
      return {
        sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      };
    }).filter(s => s.value > 0);
  }
}