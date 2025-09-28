import { Request, Response } from 'express';
import { StockGroupModel } from '../models/StockGroup';
import { CreateStockGroupRequest, APIResponse, StockGroup } from '../types';

export class StockGroupController {
  static async getStockGroups(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stockGroups = await StockGroupModel.findByUserId(userId);

      res.json({
        success: true,
        data: stockGroups,
        timestamp: new Date()
      } as APIResponse<StockGroup[]>);
    } catch (error) {
      console.error('Get stock groups error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STOCK_GROUPS_ERROR',
          message: 'Failed to fetch stock groups'
        },
        timestamp: new Date()
      });
    }
  }

  static async createStockGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const groupData: CreateStockGroupRequest = req.body;

      // Validate input
      if (!groupData.name || !groupData.stocks || groupData.stocks.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Name and stocks are required'
          },
          timestamp: new Date()
        });
        return;
      }

      // Validate stock symbols
      const invalidStocks = groupData.stocks.filter(stock => !/^[A-Z]{1,5}$/.test(stock));
      if (invalidStocks.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STOCKS',
            message: `Invalid stock symbols: ${invalidStocks.join(', ')}`
          },
          timestamp: new Date()
        });
        return;
      }

      const stockGroup = await StockGroupModel.create(userId, groupData);

      res.status(201).json({
        success: true,
        data: stockGroup,
        timestamp: new Date()
      } as APIResponse<StockGroup>);
    } catch (error) {
      console.error('Create stock group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_STOCK_GROUP_ERROR',
          message: 'Failed to create stock group'
        },
        timestamp: new Date()
      });
    }
  }

  static async updateStockGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const groupId = req.params.id;
      const updates: Partial<CreateStockGroupRequest> = req.body;

      const stockGroup = await StockGroupModel.update(groupId, userId, updates);

      if (!stockGroup) {
        res.status(404).json({
          success: false,
          error: {
            code: 'STOCK_GROUP_NOT_FOUND',
            message: 'Stock group not found'
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: stockGroup,
        timestamp: new Date()
      } as APIResponse<StockGroup>);
    } catch (error) {
      console.error('Update stock group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STOCK_GROUP_ERROR',
          message: 'Failed to update stock group'
        },
        timestamp: new Date()
      });
    }
  }

  static async deleteStockGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const groupId = req.params.id;

      const deleted = await StockGroupModel.delete(groupId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'STOCK_GROUP_NOT_FOUND',
            message: 'Stock group not found'
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
      console.error('Delete stock group error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_STOCK_GROUP_ERROR',
          message: 'Failed to delete stock group'
        },
        timestamp: new Date()
      });
    }
  }
}