import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PerformanceAnalyticsService } from '../services/PerformanceAnalyticsService';
import { TradeHistoryModel } from '../models/TradeHistory';
// import { APIResponse } from '../types';

export class AnalyticsController {
  static async getPerformanceMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { timeRange } = req.query;

      const performance = await PerformanceAnalyticsService.calculateDetailedPerformance(
        userId,
        timeRange as string || '1Y'
      );

      res.json({
        success: true,
        data: performance,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: 'Failed to fetch performance metrics'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPortfolioVsBenchmark(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { timeRange } = req.query;

      const comparison = await PerformanceAnalyticsService.getPortfolioVsBenchmark(
        userId,
        timeRange as string || '1M'
      );

      res.json({
        success: true,
        data: comparison,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get portfolio vs benchmark error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BENCHMARK_COMPARISON_ERROR',
          message: 'Failed to fetch benchmark comparison'
        },
        timestamp: new Date()
      });
    }
  }

  static async getPerformanceHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { days } = req.query;

      const history = await PerformanceAnalyticsService.getPerformanceHistory(
        userId,
        parseInt(days as string) || 30
      );

      res.json({
        success: true,
        data: history,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get performance history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_HISTORY_ERROR',
          message: 'Failed to fetch performance history'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTopPerformers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit } = req.query;

      const topPerformers = await PerformanceAnalyticsService.getTopPerformingPositions(
        userId,
        parseInt(limit as string) || 5
      );

      res.json({
        success: true,
        data: topPerformers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get top performers error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TOP_PERFORMERS_ERROR',
          message: 'Failed to fetch top performers'
        },
        timestamp: new Date()
      });
    }
  }

  static async getWorstPerformers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit } = req.query;

      const worstPerformers = await PerformanceAnalyticsService.getWorstPerformingPositions(
        userId,
        parseInt(limit as string) || 5
      );

      res.json({
        success: true,
        data: worstPerformers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get worst performers error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'WORST_PERFORMERS_ERROR',
          message: 'Failed to fetch worst performers'
        },
        timestamp: new Date()
      });
    }
  }

  static async getConstraintAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const analysis = await PerformanceAnalyticsService.getConstraintPerformanceAnalysis(userId);

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get constraint analysis error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_ANALYSIS_ERROR',
          message: 'Failed to fetch constraint analysis'
        },
        timestamp: new Date()
      });
    }
  }

  static async getTradeStatistics(req: AuthRequest, res: Response): Promise<void> {
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

  static async exportTradeHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
      }

      if (endDate) {
        end = new Date(endDate as string);
      }

      const csvData = await TradeHistoryModel.exportToCSV(userId, start, end);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=trade_history.csv');
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

  static async getAnalyticsDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Fetch multiple analytics in parallel
      const [
        performance,
        benchmarkComparison,
        topPerformers,
        worstPerformers,
        tradeStats,
        constraintAnalysis
      ] = await Promise.all([
        PerformanceAnalyticsService.calculateDetailedPerformance(userId, '1M'),
        PerformanceAnalyticsService.getPortfolioVsBenchmark(userId, '1M'),
        PerformanceAnalyticsService.getTopPerformingPositions(userId, 3),
        PerformanceAnalyticsService.getWorstPerformingPositions(userId, 3),
        TradeHistoryModel.getTradeStatistics(userId),
        PerformanceAnalyticsService.getConstraintPerformanceAnalysis(userId)
      ]);

      const dashboard = {
        performance,
        benchmarkComparison,
        topPerformers,
        worstPerformers,
        tradeStatistics: tradeStats,
        constraintAnalysis: constraintAnalysis.slice(0, 5) // Top 5 constraints
      };

      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get analytics dashboard error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: 'Failed to fetch analytics dashboard'
        },
        timestamp: new Date()
      });
    }
  }
}