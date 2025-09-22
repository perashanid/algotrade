import { ConstraintModel } from '../models/Constraint';
import { TradingConstraint, CreateConstraintRequest, UpdateConstraintRequest, TriggerEvent } from '../types';

export class ConstraintService {
  static async createConstraint(userId: string, constraint: CreateConstraintRequest): Promise<TradingConstraint> {
    // Validate constraint logic
    this.validateConstraintLogic(constraint);
    
    return await ConstraintModel.create(userId, constraint);
  }

  static async updateConstraint(constraintId: string, userId: string, updates: UpdateConstraintRequest): Promise<TradingConstraint | null> {
    // Validate updates if provided
    if (updates.buyTriggerPercent !== undefined || updates.sellTriggerPercent !== undefined) {
      const existingConstraint = await ConstraintModel.findById(constraintId, userId);
      if (!existingConstraint) {
        throw new Error('Constraint not found');
      }

      const updatedConstraint = {
        ...existingConstraint,
        ...updates
      };
      
      this.validateConstraintLogic(updatedConstraint);
    }

    return await ConstraintModel.update(constraintId, userId, updates);
  }

  static async deleteConstraint(constraintId: string, userId: string): Promise<boolean> {
    return await ConstraintModel.delete(constraintId, userId);
  }

  static async getUserConstraints(userId: string): Promise<TradingConstraint[]> {
    return await ConstraintModel.findByUserId(userId);
  }

  static async getConstraintById(constraintId: string, userId: string): Promise<TradingConstraint | null> {
    return await ConstraintModel.findById(constraintId, userId);
  }

  static async evaluateConstraints(stockSymbol: string, currentPrice: number, previousPrice: number): Promise<TriggerEvent[]> {
    const constraints = await ConstraintModel.findActiveBySymbol(stockSymbol);
    const triggers: TriggerEvent[] = [];

    for (const constraint of constraints) {
      const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      // Check for buy trigger (price drop)
      if (priceChangePercent <= -Math.abs(constraint.buyTriggerPercent)) {
        triggers.push({
          constraintId: constraint.id,
          stockSymbol: constraint.stockSymbol,
          triggerType: 'BUY',
          currentPrice,
          triggerPrice: previousPrice * (1 - Math.abs(constraint.buyTriggerPercent) / 100),
          amount: constraint.buyAmount,
          timestamp: new Date()
        });
      }

      // Check for sell trigger (price rise)
      if (priceChangePercent >= constraint.sellTriggerPercent) {
        triggers.push({
          constraintId: constraint.id,
          stockSymbol: constraint.stockSymbol,
          triggerType: 'SELL',
          currentPrice,
          triggerPrice: previousPrice * (1 + constraint.sellTriggerPercent / 100),
          amount: constraint.sellAmount,
          timestamp: new Date()
        });
      }

      // Check for profit trigger (if set)
      if (constraint.profitTriggerPercent) {
        // This would require position data to calculate profit from average cost
        // For now, we'll implement a simplified version
        const profitThreshold = previousPrice * (1 + constraint.profitTriggerPercent / 100);
        if (currentPrice >= profitThreshold) {
          triggers.push({
            constraintId: constraint.id,
            stockSymbol: constraint.stockSymbol,
            triggerType: 'PROFIT',
            currentPrice,
            triggerPrice: profitThreshold,
            amount: constraint.sellAmount,
            timestamp: new Date()
          });
        }
      }
    }

    return triggers;
  }

  static async getActiveConstraints(): Promise<TradingConstraint[]> {
    return await ConstraintModel.findActiveConstraints();
  }

  static async toggleConstraintStatus(constraintId: string, userId: string, isActive: boolean): Promise<TradingConstraint | null> {
    return await ConstraintModel.update(constraintId, userId, { isActive });
  }

  private static validateConstraintLogic(constraint: CreateConstraintRequest | TradingConstraint): void {
    // Validate percentage ranges
    if (constraint.buyTriggerPercent > 0) {
      throw new Error('Buy trigger percent should be negative (price drop)');
    }

    if (constraint.sellTriggerPercent < 0) {
      throw new Error('Sell trigger percent should be positive (price rise)');
    }

    if (constraint.profitTriggerPercent && constraint.profitTriggerPercent <= 0) {
      throw new Error('Profit trigger percent should be positive');
    }

    // Validate amounts
    if (constraint.buyAmount <= 0 || constraint.sellAmount <= 0) {
      throw new Error('Buy and sell amounts must be positive');
    }

    // Validate reasonable ranges
    if (Math.abs(constraint.buyTriggerPercent) > 50) {
      throw new Error('Buy trigger percent seems too large (>50%)');
    }

    if (constraint.sellTriggerPercent > 50) {
      throw new Error('Sell trigger percent seems too large (>50%)');
    }

    if (constraint.profitTriggerPercent && constraint.profitTriggerPercent > 200) {
      throw new Error('Profit trigger percent seems too large (>200%)');
    }
  }
}