import { Request, Response } from 'express';
import { ConstraintEvaluatorService } from '../services/ConstraintEvaluatorService';
import { PriceMonitorJob } from '../jobs/priceMonitor';

export class SystemController {
  static async getSystemStatus(_req: Request, res: Response): Promise<void> {
    try {
      const evaluationStatus = await ConstraintEvaluatorService.getEvaluationStatus();
      const jobStatus = PriceMonitorJob.getStatus();

      res.json({
        success: true,
        data: {
          constraintEvaluation: evaluationStatus,
          backgroundJobs: jobStatus,
          timestamp: new Date()
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get system status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_STATUS_ERROR',
          message: 'Failed to get system status'
        },
        timestamp: new Date()
      });
    }
  }

  static async triggerConstraintEvaluation(_req: Request, res: Response): Promise<void> {
    try {
      await PriceMonitorJob.triggerConstraintEvaluation();

      res.json({
        success: true,
        data: { message: 'Constraint evaluation triggered successfully' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Trigger constraint evaluation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_EVALUATION_ERROR',
          message: 'Failed to trigger constraint evaluation'
        },
        timestamp: new Date()
      });
    }
  }

  static async triggerPriceUpdate(_req: Request, res: Response): Promise<void> {
    try {
      await PriceMonitorJob.triggerPriceUpdate();

      res.json({
        success: true,
        data: { message: 'Price update triggered successfully' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Trigger price update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PRICE_UPDATE_ERROR',
          message: 'Failed to trigger price update'
        },
        timestamp: new Date()
      });
    }
  }

  static async getHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Basic health check
      res.json({
        success: true,
        data: {
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date(),
          version: process.env.npm_package_version || '1.0.0'
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Health check failed'
        },
        timestamp: new Date()
      });
    }
  }
}