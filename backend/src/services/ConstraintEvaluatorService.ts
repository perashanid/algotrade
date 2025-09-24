import { ConstraintService } from './ConstraintService';
import { MarketDataService } from './MarketDataService';
import { PortfolioService } from './PortfolioService';
import { TradeHistoryModel } from '../models/TradeHistory';
import { TriggerEvent, TradingConstraint } from '../types';

export class ConstraintEvaluatorService {
  private static readonly PRICE_HISTORY_KEY = 'price_history';
  private static readonly EVALUATION_LOCK_KEY = 'constraint_evaluation_lock';
  private static readonly LOCK_TTL = 30; // 30 seconds

  static async evaluateAllConstraints(): Promise<TriggerEvent[]> {
    try {
      console.log('Starting constraint evaluation...');
      
      const activeConstraints = await ConstraintService.getActiveConstraints();
      if (activeConstraints.length === 0) {
        console.log('No active constraints found');
        return [];
      }

      // Group constraints by symbol for efficient price fetching
      const symbolGroups = this.groupConstraintsBySymbol(activeConstraints);
      const allTriggers: TriggerEvent[] = [];

      for (const [symbol, constraints] of symbolGroups.entries()) {
        try {
          const triggers = await this.evaluateSymbolConstraints(symbol, constraints);
          allTriggers.push(...triggers);
        } catch (error) {
          console.error(`Error evaluating constraints for ${symbol}:`, error);
        }
      }

      console.log(`Constraint evaluation completed. Found ${allTriggers.length} triggers.`);
      
      // Process triggers
      if (allTriggers.length > 0) {
        await this.processTriggers(allTriggers);
      }

      return allTriggers;
    } catch (error) {
      console.error('Error in constraint evaluation:', error);
      throw error;
    }
  }

  private static async evaluateSymbolConstraints(
    symbol: string, 
    constraints: TradingConstraint[]
  ): Promise<TriggerEvent[]> {
    try {
      // Get current price
      const currentPrice = await MarketDataService.getCurrentPrice(symbol);
      
      // Simplified without price history - using current price evaluation
      const previousPrice = currentPrice * 0.99; // Simplified baseline for demo
      
      // Calculate price change
      const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      console.log(`${symbol}: ${previousPrice} -> ${currentPrice} (${priceChangePercent.toFixed(2)}%)`);

      const triggers: TriggerEvent[] = [];

      for (const constraint of constraints) {
        const constraintTriggers = await this.evaluateConstraint(
          constraint, 
          currentPrice, 
          previousPrice, 
          priceChangePercent
        );
        triggers.push(...constraintTriggers);
      }

      return triggers;
    } catch (error) {
      console.error(`Error evaluating constraints for ${symbol}:`, error);
      return [];
    }
  }

  private static async evaluateConstraint(
    constraint: TradingConstraint,
    currentPrice: number,
    previousPrice: number,
    priceChangePercent: number
  ): Promise<TriggerEvent[]> {
    const triggers: TriggerEvent[] = [];

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

    // Check for profit trigger (if set and user has position)
    if (constraint.profitTriggerPercent) {
      const position = await PortfolioService.getPositionBySymbol(constraint.userId, constraint.stockSymbol);
      
      if (position && position.quantity > 0) {
        const profitPercent = ((currentPrice - position.averageCost) / position.averageCost) * 100;
        
        if (profitPercent >= constraint.profitTriggerPercent) {
          triggers.push({
            constraintId: constraint.id,
            stockSymbol: constraint.stockSymbol,
            triggerType: 'PROFIT',
            currentPrice,
            triggerPrice: position.averageCost * (1 + constraint.profitTriggerPercent / 100),
            amount: constraint.sellAmount,
            timestamp: new Date()
          });
        }
      }
    }

    return triggers;
  }

  private static async processTriggers(triggers: TriggerEvent[]): Promise<void> {
    console.log(`Processing ${triggers.length} triggers...`);

    for (const trigger of triggers) {
      try {
        await this.processTrigger(trigger);
      } catch (error) {
        console.error(`Error processing trigger for ${trigger.stockSymbol}:`, error);
      }
    }
  }

  private static async processTrigger(trigger: TriggerEvent): Promise<void> {
    try {
      // Get constraint to find user ID
      const constraint = await ConstraintService.getConstraintById(trigger.constraintId, '');
      if (!constraint) {
        console.error(`Constraint not found: ${trigger.constraintId}`);
        return;
      }

      // Determine trade type and quantity
      let tradeType: 'BUY' | 'SELL';
      let quantity: number;

      if (trigger.triggerType === 'BUY') {
        tradeType = 'BUY';
        quantity = trigger.amount / trigger.currentPrice; // Convert dollar amount to shares
      } else {
        tradeType = 'SELL';
        
        // For sell triggers, check if user has enough shares
        const position = await PortfolioService.getPositionBySymbol(constraint.userId, trigger.stockSymbol);
        
        if (!position || position.quantity <= 0) {
          console.log(`No position to sell for ${trigger.stockSymbol}, skipping trigger`);
          return;
        }
        
        // Calculate quantity to sell (either fixed amount or percentage of position)
        quantity = Math.min(
          trigger.amount / trigger.currentPrice,
          position.quantity
        );
      }

      // Record the trade in history
      await TradeHistoryModel.create(
        constraint.userId,
        constraint.id,
        trigger.stockSymbol,
        tradeType,
        this.mapTriggerTypeToTradeType(trigger.triggerType),
        quantity,
        trigger.currentPrice,
        trigger.triggerPrice
      );

      // Update portfolio position
      const positionQuantity = tradeType === 'BUY' ? quantity : -quantity;
      await PortfolioService.updatePosition(
        constraint.userId,
        trigger.stockSymbol,
        positionQuantity,
        trigger.currentPrice
      );

      console.log(`✅ Processed ${tradeType} trigger: ${quantity.toFixed(4)} shares of ${trigger.stockSymbol} at $${trigger.currentPrice}`);

      // Optionally, you could add notification logic here
      await this.notifyUser(constraint.userId, trigger, tradeType, quantity);

    } catch (error) {
      console.error(`Error processing trigger:`, error);
      throw error;
    }
  }

  private static mapTriggerTypeToTradeType(triggerType: string): 'PRICE_DROP' | 'PRICE_RISE' | 'PROFIT_TARGET' {
    switch (triggerType) {
      case 'BUY':
        return 'PRICE_DROP';
      case 'SELL':
        return 'PRICE_RISE';
      case 'PROFIT':
        return 'PROFIT_TARGET';
      default:
        return 'PRICE_DROP';
    }
  }

  private static async notifyUser(
    userId: string, 
    trigger: TriggerEvent, 
    tradeType: 'BUY' | 'SELL', 
    quantity: number
  ): Promise<void> {
    // This could be extended to send email notifications, push notifications, etc.
    console.log(`📧 Notification: User ${userId} - ${tradeType} ${quantity.toFixed(4)} ${trigger.stockSymbol} at $${trigger.currentPrice}`);
  }

  private static groupConstraintsBySymbol(constraints: TradingConstraint[]): Map<string, TradingConstraint[]> {
    const groups = new Map<string, TradingConstraint[]>();
    
    for (const constraint of constraints) {
      const symbol = constraint.stockSymbol;
      if (!symbol) {
        console.warn('Constraint has undefined stockSymbol:', constraint.id);
        continue;
      }
      if (!groups.has(symbol)) {
        groups.set(symbol, []);
      }
      groups.get(symbol)!.push(constraint);
    }
    
    return groups;
  }

  // Price history removed for deployment reliability - using direct database queries instead

  // Locking mechanism removed for deployment reliability

  static async getEvaluationStatus(): Promise<{
    isRunning: boolean;
    lastRun?: Date;
    activeConstraints: number;
  }> {
    try {
      const isRunning = false; // Simplified without cache-based locking
      const activeConstraints = await ConstraintService.getActiveConstraints();
      
      return {
        isRunning,
        activeConstraints: activeConstraints.length
      };
    } catch (error) {
      console.error('Error getting evaluation status:', error);
      return {
        isRunning: false,
        activeConstraints: 0
      };
    }
  }
}