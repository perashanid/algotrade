import { ConstraintPosition, TradingConstraint, ConstraintGroup, Position, StockGroup } from '../types';
import { constraintsService } from './constraints';
import { constraintGroupsService } from './constraintGroups';
import { stockGroupsService } from './stockGroups';
import { portfolioService } from './portfolio';

export const constraintPositionsService = {
  async getConstraintPositions(): Promise<ConstraintPosition[]> {
    try {
      // Get all data in parallel
      const [constraints, constraintGroups, stockGroups, portfolio] = await Promise.all([
        constraintsService.getConstraints(),
        constraintGroupsService.getConstraintGroups(),
        stockGroupsService.getStockGroups(),
        portfolioService.getPortfolio().catch(() => ({ positions: [] })) // Handle case where portfolio is empty
      ]);

      const constraintPositions: ConstraintPosition[] = [];
      const existingPositions = portfolio.positions || [];

      // Process individual constraints
      for (const constraint of constraints) {
        const position = existingPositions.find(p => p.stockSymbol === constraint.stockSymbol);
        const currentPrice = position?.currentPrice || 0;
        const quantity = position?.quantity || 0;
        const averageCost = position?.averageCost || 0;
        const marketValue = quantity * currentPrice;
        const unrealizedPnl = quantity > 0 ? marketValue - (quantity * averageCost) : 0;
        const unrealizedPnlPercent = averageCost > 0 ? (unrealizedPnl / (quantity * averageCost)) * 100 : 0;

        constraintPositions.push({
          stockSymbol: constraint.stockSymbol,
          constraintType: 'individual',
          isActive: constraint.isActive,
          buyTriggerPercent: constraint.buyTriggerPercent,
          sellTriggerPercent: constraint.sellTriggerPercent,
          profitTriggerPercent: constraint.profitTriggerPercent,
          buyAmount: constraint.buyAmount,
          sellAmount: constraint.sellAmount,
          currentPrice,
          quantity,
          averageCost,
          marketValue,
          unrealizedPnl,
          unrealizedPnlPercent,
          status: quantity > 0 ? 'position' : 'watching'
        });
      }

      // Process constraint groups
      for (const constraintGroup of constraintGroups) {
        // Get all stocks from the constraint group
        const allStocks = new Set<string>();
        
        // Add individual stocks
        constraintGroup.stocks.forEach(stock => allStocks.add(stock));
        
        // Add stocks from stock groups
        for (const groupId of constraintGroup.stockGroups) {
          const stockGroup = stockGroups.find(g => g.id === groupId);
          if (stockGroup) {
            stockGroup.stocks.forEach(stock => allStocks.add(stock));
          }
        }

        // Create constraint positions for each stock
        for (const stockSymbol of allStocks) {
          // Skip if already added by individual constraint
          if (constraintPositions.some(cp => cp.stockSymbol === stockSymbol)) {
            continue;
          }

          const position = existingPositions.find(p => p.stockSymbol === stockSymbol);
          const currentPrice = position?.currentPrice || 0;
          const quantity = position?.quantity || 0;
          const averageCost = position?.averageCost || 0;
          const marketValue = quantity * currentPrice;
          const unrealizedPnl = quantity > 0 ? marketValue - (quantity * averageCost) : 0;
          const unrealizedPnlPercent = averageCost > 0 ? (unrealizedPnl / (quantity * averageCost)) * 100 : 0;

          constraintPositions.push({
            stockSymbol,
            constraintName: constraintGroup.name,
            constraintType: 'group',
            isActive: constraintGroup.isActive,
            buyTriggerPercent: constraintGroup.buyTriggerPercent,
            sellTriggerPercent: constraintGroup.sellTriggerPercent,
            profitTriggerPercent: constraintGroup.profitTriggerPercent,
            buyAmount: constraintGroup.buyAmount,
            sellAmount: constraintGroup.sellAmount,
            currentPrice,
            quantity,
            averageCost,
            marketValue,
            unrealizedPnl,
            unrealizedPnlPercent,
            status: quantity > 0 ? 'position' : 'watching'
          });
        }
      }

      // Sort by status (positions first, then watching) and then by symbol
      return constraintPositions.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'position' ? -1 : 1;
        }
        return a.stockSymbol.localeCompare(b.stockSymbol);
      });

    } catch (error) {
      console.error('Error getting constraint positions:', error);
      return [];
    }
  }
};