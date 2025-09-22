import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BacktestService } from '../services/BacktestService';
// import { APIResponse, BacktestResult, BacktestRequest } from '../types';

export class BacktestController {
  static async runBacktest(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { constraintId, startDate, endDate } = req.body;
      const { initialCapital } = req.query;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATES',
            message: 'Invalid date format'
          },
          timestamp: new Date()
        });
        return;
      }

      if (start >= end) {
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

      if (end > new Date()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FUTURE_END_DATE',
            message: 'End date cannot be in the future'
          },
          timestamp: new Date()
        });
        return;
      }

      const capital = initialCapital ? parseFloat(initialCapital as string) : 10000;
      
      if (capital <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CAPITAL',
            message: 'Initial capital must be positive'
          },
          timestamp: new Date()
        });
        return;
      }

      const result = await BacktestService.runBacktest(constraintId, userId, start, end, capital);

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Run backtest error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Constraint not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'CONSTRAINT_NOT_FOUND',
              message: 'Constraint not found'
            },
            timestamp: new Date()
          });
          return;
        }
        
        if (error.message.includes('Insufficient historical data')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_DATA',
              message: 'Insufficient historical data for the specified period'
            },
            timestamp: new Date()
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'BACKTEST_ERROR',
          message: 'Failed to run backtest'
        },
        timestamp: new Date()
      });
    }
  }

  static async compareToMarket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { backtestResult } = req.body;
      const { benchmarkSymbol } = req.query;

      if (!backtestResult) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BACKTEST_RESULT',
            message: 'Backtest result is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const comparison = await BacktestService.compareToMarket(
        backtestResult,
        benchmarkSymbol as string || 'SPY'
      );

      res.json({
        success: true,
        data: comparison,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Compare to market error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MARKET_COMPARISON_ERROR',
          message: 'Failed to compare backtest to market'
        },
        timestamp: new Date()
      });
    }
  }

  static async runMultipleBacktests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.body;
      const { initialCapital } = req.query;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATES',
            message: 'Invalid date format'
          },
          timestamp: new Date()
        });
        return;
      }

      if (start >= end) {
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

      const capital = initialCapital ? parseFloat(initialCapital as string) : 10000;

      const results = await BacktestService.runMultipleBacktests(userId, start, end, capital);

      res.json({
        success: true,
        data: {
          results,
          summary: {
            totalConstraints: results.length,
            avgReturn: results.reduce((sum, r) => sum + r.totalReturnPercent, 0) / results.length || 0,
            bestPerforming: results.reduce((best, current) => 
              current.totalReturnPercent > best.totalReturnPercent ? current : best, 
              results[0] || null
            ),
            worstPerforming: results.reduce((worst, current) => 
              current.totalReturnPercent < worst.totalReturnPercent ? current : worst, 
              results[0] || null
            )
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Run multiple backtests error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MULTIPLE_BACKTESTS_ERROR',
          message: 'Failed to run multiple backtests'
        },
        timestamp: new Date()
      });
    }
  }

  static async getBacktestHistory(_req: AuthRequest, res: Response): Promise<void> {
    try {
      // This would typically fetch stored backtest results from database
      // For now, we'll return a placeholder response
      res.json({
        success: true,
        data: {
          message: 'Backtest history feature coming soon',
          backtests: []
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get backtest history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BACKTEST_HISTORY_ERROR',
          message: 'Failed to fetch backtest history'
        },
        timestamp: new Date()
      });
    }
  }

  static async validateBacktestParameters(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { constraintId, startDate, endDate } = req.body;
      const userId = req.user!.id;

      // Validate constraint exists
      await BacktestService.runBacktest(constraintId, userId, new Date(startDate), new Date(endDate), 1000);
      
      res.json({
        success: true,
        data: {
          valid: true,
          message: 'Backtest parameters are valid'
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Validate backtest parameters error:', error);
      
      let errorCode = 'VALIDATION_ERROR';
      let errorMessage = 'Invalid backtest parameters';
      
      if (error instanceof Error) {
        if (error.message.includes('Constraint not found')) {
          errorCode = 'CONSTRAINT_NOT_FOUND';
          errorMessage = 'Constraint not found';
        } else if (error.message.includes('Insufficient historical data')) {
          errorCode = 'INSUFFICIENT_DATA';
          errorMessage = 'Insufficient historical data for the specified period';
        }
      }

      res.status(400).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }
}