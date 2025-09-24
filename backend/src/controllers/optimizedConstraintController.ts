import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OptimizedConstraintPositionService } from '../services/OptimizedConstraintPositionService';

export class OptimizedConstraintController {
  // Get optimized constraint positions
  static async getConstraintPositions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const constraintPositions = await OptimizedConstraintPositionService.getConstraintPositions(userId);

      res.json({
        success: true,
        data: constraintPositions,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting constraint positions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get constraint positions'
      });
    }
  }

  // Get optimized group summary
  static async getGroupSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const groupSummary = await OptimizedConstraintPositionService.getGroupSummary(userId);

      res.json({
        success: true,
        data: groupSummary,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting group summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get group summary'
      });
    }
  }

  // Get combined dashboard data
  static async getDashboardData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const dashboardData = await OptimizedConstraintPositionService.getDashboardData(userId);

      res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data'
      });
    }
  }

  // Refresh constraint position cache (cache removed for deployment reliability)
  static async refreshCache(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Cache functionality removed - data is fetched directly from database
      // This endpoint now just returns success for compatibility
      res.json({
        success: true,
        message: 'Data is fetched directly from database (cache removed for deployment reliability)',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in refresh cache endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process refresh request'
      });
    }
  }
}