import { Response } from 'express';
import { ConstraintGroupModel } from '../models/ConstraintGroup';
import { CreateConstraintGroupRequest, APIResponse, ConstraintGroup } from '../types';
import { AuthRequest } from '../middleware/auth';

export class ConstraintGroupController {
  static async getConstraintGroups(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintGroups = await ConstraintGroupModel.findByUserId(userId);

      res.json({
        success: true,
        data: constraintGroups,
        timestamp: new Date()
      } as APIResponse<ConstraintGroup[]>);
    } catch (error) {
      console.error('Get constraint groups error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONSTRAINT_GROUPS_ERROR',
          message: 'Failed to fetch constraint groups'
        },
        timestamp: new Date()
      });
    }
  }

  static async createConstraintGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintData: CreateConstraintGroupRequest = req.body;

      // Validate input
      if (!constraintData.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Constraint name is required'
          },
          timestamp: new Date()
        });
        return;
      }

      if (constraintData.stocks.length === 0 && constraintData.stockGroups.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'At least one stock or stock group must be selected'
          },
          timestamp: new Date()
        });
        return;
      }

      // Validate triggers
      if (constraintData.buyTriggerPercent >= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Buy trigger must be negative (price drop)'
          },
          timestamp: new Date()
        });
        return;
      }

      if (constraintData.sellTriggerPercent <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Sell trigger must be positive (price rise)'
          },
          timestamp: new Date()
        });
        return;
      }

      const constraintGroup = await ConstraintGroupModel.create(userId, constraintData);

      res.status(201).json({
        success: true,
        data: constraintGroup,
        timestamp: new Date()
      } as APIResponse<ConstraintGroup>);
    } catch (error) {
      console.error('Create constraint group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_CONSTRAINT_GROUP_ERROR',
          message: 'Failed to create constraint group'
        },
        timestamp: new Date()
      });
    }
  }

  static async updateConstraintGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      const updates = req.body;

      // Validate triggers if provided
      if (updates.buyTriggerPercent !== undefined && updates.buyTriggerPercent >= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Buy trigger must be negative (price drop)'
          },
          timestamp: new Date()
        });
        return;
      }

      if (updates.sellTriggerPercent !== undefined && updates.sellTriggerPercent <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Sell trigger must be positive (price rise)'
          },
          timestamp: new Date()
        });
        return;
      }

      const constraintGroup = await ConstraintGroupModel.update(constraintId, userId, updates);

      if (!constraintGroup) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CONSTRAINT_GROUP_NOT_FOUND',
            message: 'Constraint group not found'
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: constraintGroup,
        timestamp: new Date()
      } as APIResponse<ConstraintGroup>);
    } catch (error) {
      console.error('Update constraint group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_CONSTRAINT_GROUP_ERROR',
          message: 'Failed to update constraint group'
        },
        timestamp: new Date()
      });
    }
  }

  static async toggleConstraintGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;
      const { isActive } = req.body;

      const constraintGroup = await ConstraintGroupModel.toggleActive(constraintId, userId, isActive);

      if (!constraintGroup) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CONSTRAINT_GROUP_NOT_FOUND',
            message: 'Constraint group not found'
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: constraintGroup,
        timestamp: new Date()
      } as APIResponse<ConstraintGroup>);
    } catch (error) {
      console.error('Toggle constraint group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TOGGLE_CONSTRAINT_GROUP_ERROR',
          message: 'Failed to toggle constraint group'
        },
        timestamp: new Date()
      });
    }
  }

  static async deleteConstraintGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const constraintId = req.params.id;

      const deleted = await ConstraintGroupModel.delete(constraintId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CONSTRAINT_GROUP_NOT_FOUND',
            message: 'Constraint group not found'
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: null,
        timestamp: new Date()
      } as APIResponse<null>);
    } catch (error) {
      console.error('Delete constraint group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_CONSTRAINT_GROUP_ERROR',
          message: 'Failed to delete constraint group'
        },
        timestamp: new Date()
      });
    }
  }
}