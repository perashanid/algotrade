import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PortfolioService } from '../services/PortfolioService';

export class PortfolioController {
  static async getPortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const portfolio = await PortfolioService.getPortfolio(userId);

      res.json({
        success: true,
        data: portfolio,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PORTFOLIO_FETCH_ERROR',
          message: 'Failed to fetch portfolio'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPositions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const positions = await PortfolioService.getPositions(userId);

      res.json({
        success: true,
        data: positions,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get positions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'POSITIONS_FETCH_ERROR',
          message: 'Failed to fetch positions'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { symbol } = req.params;

      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Stock symbol is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const position = await PortfolioService.getPositionBySymbol(userId, symbol);

      if (!position) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POSITION_NOT_FOUND',
            message: `No position found for symbol: ${symbol}`
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: position,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get position error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'POSITION_FETCH_ERROR',
          message: 'Failed to fetch position'
        },
        timestamp: new Date()
      });
    }
  }

  static async updatePosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { stockSymbol, quantity, price } = req.body;

      if (!stockSymbol || quantity === undefined || price === undefined) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Stock symbol, quantity, and price are required'
          },
          timestamp: new Date()
        });
        return;
      }

      if (typeof quantity !== 'number' || typeof price !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TYPES',
            message: 'Quantity and price must be numbers'
          },
          timestamp: new Date()
        });
        return;
      }

      if (price <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Price must be positive'
          },
          timestamp: new Date()
        });
        return;
      }

      const position = await PortfolioService.updatePosition(userId, stockSymbol, quantity, price);

      res.json({
        success: true,
        data: position,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Update position error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'POSITION_UPDATE_ERROR',
          message: 'Failed to update position'
        },
        timestamp: new Date()
      });
    }
  }

  static async deletePosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { symbol } = req.params;

      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Stock symbol is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const deleted = await PortfolioService.deletePosition(userId, symbol);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POSITION_NOT_FOUND',
            message: `No position found for symbol: ${symbol}`
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Position deleted successfully' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Delete position error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'POSITION_DELETE_ERROR',
          message: 'Failed to delete position'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPerformance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { timeRange } = req.query;

      const performance = await PortfolioService.calculatePerformance(
        userId, 
        timeRange as string || '1D'
      );

      res.json({
        success: true,
        data: performance,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get performance error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_FETCH_ERROR',
          message: 'Failed to fetch performance metrics'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPortfolioSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const summary = await PortfolioService.getPortfolioSummary(userId);

      res.json({
        success: true,
        data: summary,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get portfolio summary error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PORTFOLIO_SUMMARY_ERROR',
          message: 'Failed to fetch portfolio summary'
        },
        timestamp: new Date()
      });
    }
  }

  static async refreshPrices(_req: AuthRequest, res: Response): Promise<void> {
    try {
      await PortfolioService.updateAllPositionPrices();

      res.json({
        success: true,
        data: { message: 'Portfolio prices updated successfully' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Refresh prices error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PRICE_REFRESH_ERROR',
          message: 'Failed to refresh portfolio prices'
        },
        timestamp: new Date()
      });
    }
  }
}