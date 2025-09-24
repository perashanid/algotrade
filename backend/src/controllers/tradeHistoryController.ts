import { Request, Response } from 'express';
import { TradeHistoryModel } from '../models/TradeHistory';
import { TradeHistory } from '../types';

export class TradeHistoryController {
  static async getClosedPositions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const closedPositions = await TradeHistoryModel.getClosedPositions(userId);

      res.json({
        success: true,
        data: closedPositions,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get closed positions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLOSED_POSITIONS_ERROR',
          message: 'Failed to fetch closed positions'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradeHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit, offset, symbol } = req.query;

      const limitNum = limit ? parseInt(limit as string) : 100;
      const offsetNum = offset ? parseInt(offset as string) : 0;

      if (limitNum < 1 || limitNum > 1000) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_LIMIT',
            message: 'Limit must be between 1 and 1000'
          },
          timestamp: new Date()
        });
        return;
      }

      if (offsetNum < 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_OFFSET',
            message: 'Offset must be non-negative'
          },
          timestamp: new Date()
        });
        return;
      }

      let trades: TradeHistory[];

      if (symbol) {
        trades = await TradeHistoryModel.findByUserIdAndSymbol(userId, symbol as string);
      } else {
        trades = await TradeHistoryModel.findByUserId(userId, limitNum, offsetNum);
      }

      res.json({
        success: true,
        data: {
          trades,
          pagination: {
            limit: limitNum,
            offset: offsetNum,
            total: trades.length
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get trade history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TRADE_HISTORY_ERROR',
          message: 'Failed to fetch trade history'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradesByConstraint(req: Request, res: Response): Promise<void> {
    try {
      const { constraintId } = req.params;

      if (!constraintId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CONSTRAINT_ID',
            message: 'Constraint ID is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const trades = await TradeHistoryModel.findByConstraintId(constraintId);

      res.json({
        success: true,
        data: trades,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get trades by constraint error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_TRADES_ERROR',
          message: 'Failed to fetch trades for constraint'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradeStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_START_DATE',
              message: 'Invalid start date format'
            },
            timestamp: new Date()
          });
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_END_DATE',
              message: 'Invalid end date format'
            },
            timestamp: new Date()
          });
          return;
        }
      }

      if (start && end && start >= end) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE_RANGE',
            message: 'Start date must be before end date'
          },
          timestamp: new Date()
        });
        return;
      }

      const statistics = await TradeHistoryModel.getTradeStatistics(userId, start, end);

      res.json({
        success: true,
        data: statistics,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get trade statistics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TRADE_STATISTICS_ERROR',
          message: 'Failed to fetch trade statistics'
        },
        timestamp: new Date()
      });
    }
  }

  static async exportTradeHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, format } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_START_DATE',
              message: 'Invalid start date format'
            },
            timestamp: new Date()
          });
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_END_DATE',
              message: 'Invalid end date format'
            },
            timestamp: new Date()
          });
          return;
        }
      }

      const exportFormat = (format as string) || 'csv';
      
      if (exportFormat !== 'csv') {
        res.status(400).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: 'Only CSV format is currently supported'
          },
          timestamp: new Date()
        });
        return;
      }

      const csvData = await TradeHistoryModel.exportToCSV(userId, start, end);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `trade_history_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error) {
      console.error('Export trade history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: 'Failed to export trade history'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { timeRange } = req.query;

      // Get trade statistics
      const { startDate, endDate } = this.getDateRangeFromTimeRange(timeRange as string || '1M');
      const statistics = await TradeHistoryModel.getTradeStatistics(userId, startDate, endDate);

      // Get recent trades for analysis
      const recentTrades = await TradeHistoryModel.findByUserId(userId, 100);

      // Calculate additional analytics
      const analytics = this.calculateTradeAnalytics(recentTrades, statistics);

      res.json({
        success: true,
        data: {
          statistics,
          analytics,
          timeRange: timeRange || '1M'
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get trade analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TRADE_ANALYTICS_ERROR',
          message: 'Failed to fetch trade analytics'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradingPerformanceBySymbol(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const trades = await TradeHistoryModel.findByUserId(userId, 1000);

      // Group trades by symbol
      const symbolGroups = new Map<string, TradeHistory[]>();
      
      for (const trade of trades) {
        if (!symbolGroups.has(trade.stockSymbol)) {
          symbolGroups.set(trade.stockSymbol, []);
        }
        symbolGroups.get(trade.stockSymbol)!.push(trade);
      }

      // Calculate performance for each symbol
      const symbolPerformance = Array.from(symbolGroups.entries()).map(([symbol, symbolTrades]) => {
        const buyTrades = symbolTrades.filter(t => t.tradeType === 'BUY');
        const sellTrades = symbolTrades.filter(t => t.tradeType === 'SELL');
        
        const totalBuyValue = buyTrades.reduce((sum, t) => sum + (t.quantity * t.price), 0);
        const totalSellValue = sellTrades.reduce((sum, t) => sum + (t.quantity * t.price), 0);
        
        const netReturn = totalSellValue - totalBuyValue;
        const returnPercent = totalBuyValue > 0 ? (netReturn / totalBuyValue) * 100 : 0;

        return {
          symbol,
          totalTrades: symbolTrades.length,
          buyTrades: buyTrades.length,
          sellTrades: sellTrades.length,
          totalBuyValue,
          totalSellValue,
          netReturn,
          returnPercent
        };
      });

      // Sort by return percentage
      symbolPerformance.sort((a, b) => b.returnPercent - a.returnPercent);

      res.json({
        success: true,
        data: symbolPerformance,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get trading performance by symbol error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYMBOL_PERFORMANCE_ERROR',
          message: 'Failed to fetch trading performance by symbol'
        },
        timestamp: new Date()
      });
    }
  }

  private static getDateRangeFromTimeRange(timeRange: string): { startDate: Date; endDate: Date } {
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
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, endDate };
  }

  private static calculateTradeAnalytics(trades: TradeHistory[], statistics: any): any {
    if (trades.length === 0) {
      return {
        avgTradeSize: 0,
        avgHoldingPeriod: 0,
        winRate: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0
      };
    }

    // Calculate average trade size
    const avgTradeSize = statistics.avgTradeSize;

    // Calculate win rate (simplified)
    const winRate = statistics.totalTrades > 0 ? (statistics.buyTrades / statistics.totalTrades) * 100 : 0;

    // Mock additional analytics (would need more sophisticated calculation)
    const profitFactor = 1.2; // Mock profit factor
    const largestWin = statistics.totalVolume * 0.1; // Mock largest win
    const largestLoss = statistics.totalVolume * -0.05; // Mock largest loss
    const avgHoldingPeriod = 5; // Mock average holding period in days

    return {
      avgTradeSize,
      avgHoldingPeriod,
      winRate,
      profitFactor,
      largestWin,
      largestLoss
    };
  }
}