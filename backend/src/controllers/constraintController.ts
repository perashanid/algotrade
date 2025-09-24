import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ConstraintService } from '../services/ConstraintService';

export class ConstraintController {
  static async createConstraint(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraint = await ConstraintService.createConstraint(userId, req.body);

      res.status(201).json({
        success: true,
        data: constraint,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Create constraint error:', error);
      
      if (error instanceof Error && error.message.includes('trigger percent')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONSTRAINT',
            message: error.message
          },
          timestamp: new Date()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_CREATION_ERROR',
          message: 'Failed to create constraint'
        },
        timestamp: new Date()
      });
    }
  }

  static async getConstraints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraints = await ConstraintService.getUserConstraints(userId);

      res.json({
        success: true,
        data: constraints,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get constraints error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINTS_FETCH_ERROR',
          message: 'Failed to fetch constraints'
        },
        timestamp: new Date()
      });
    }
  }

  static async getConstraint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      
      const constraint = await ConstraintService.getConstraintById(constraintId, userId);
      
      if (!constraint) {
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

      res.json({
        success: true,
        data: constraint,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get constraint error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_FETCH_ERROR',
          message: 'Failed to fetch constraint'
        },
        timestamp: new Date()
      });
    }
  }

  static async updateConstraint(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      
      const constraint = await ConstraintService.updateConstraint(constraintId, userId, req.body);
      
      if (!constraint) {
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

      res.json({
        success: true,
        data: constraint,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Update constraint error:', error);
      
      if (error instanceof Error && error.message.includes('trigger percent')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONSTRAINT',
            message: error.message
          },
          timestamp: new Date()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_UPDATE_ERROR',
          message: 'Failed to update constraint'
        },
        timestamp: new Date()
      });
    }
  }

  static async deleteConstraint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      
      const deleted = await ConstraintService.deleteConstraint(constraintId, userId);
      
      if (!deleted) {
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

      res.json({
        success: true,
        data: { message: 'Constraint deleted successfully' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Delete constraint error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_DELETE_ERROR',
          message: 'Failed to delete constraint'
        },
        timestamp: new Date()
      });
    }
  }

  static async toggleConstraint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      const { isActive } = req.body;
      
      const constraint = await ConstraintService.toggleConstraintStatus(constraintId, userId, isActive);
      
      if (!constraint) {
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

      res.json({
        success: true,
        data: constraint,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Toggle constraint error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_TOGGLE_ERROR',
          message: 'Failed to toggle constraint status'
        },
        timestamp: new Date()
      });
    }
  }
}