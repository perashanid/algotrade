import { ConstraintPosition, ConstraintGroup } from '../types';
import { constraintsService } from './constraints';
import { constraintGroupsService } from './constraintGroups';
import { portfolioService } from './portfolio';

// Enhanced constraint position with group context
export interface EnhancedConstraintPosition extends ConstraintPosition {
  groupId?: string;
  groupName?: string;
  hasCustomTriggers?: boolean;
  groupDefaultTriggers?: {
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
    buyAmount: number;
    sellAmount: number;
  };
}

// Processed group data for display
export interface ProcessedGroupData {
  group: ConstraintGroup;
  individualStocks: string[];
  stockGroupStocks: string[];
  allStocks: string[];
  totalValue: number;
  activePositions: number;
}

export const constraintPositionsService = {
  async getConstraintPositions(): Promise<ConstraintPosition[]> {
    try {
      // Get all data in parallel
      const [constraints, constraintGroups, portfolio] = await Promise.all([
        constraintsService.getConstraints(),
        constraintGroupsService.getConstraintGroups(),
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
        
        // Add stocks from stock groups (stockGroups is array of StockGroup objects)
        for (const stockGroup of constraintGroup.stockGroups) {
          if (stockGroup && stockGroup.stocks) {
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

          // Check if this stock has custom triggers (overrides)
          const stockOverride = constraintGroup.stockOverrides?.[stockSymbol];
          const hasCustomTriggers = !!stockOverride;

          // Use custom triggers if available, otherwise use group defaults
          const effectiveTriggers = {
            buyTriggerPercent: stockOverride?.buyTriggerPercent ?? constraintGroup.buyTriggerPercent,
            sellTriggerPercent: stockOverride?.sellTriggerPercent ?? constraintGroup.sellTriggerPercent,
            profitTriggerPercent: stockOverride?.profitTriggerPercent ?? constraintGroup.profitTriggerPercent,
            buyAmount: stockOverride?.buyAmount ?? constraintGroup.buyAmount,
            sellAmount: stockOverride?.sellAmount ?? constraintGroup.sellAmount,
          };

          constraintPositions.push({
            stockSymbol,
            constraintId: constraintGroup.id,
            constraintName: constraintGroup.name,
            constraintType: 'group',
            isActive: constraintGroup.isActive,
            buyTriggerPercent: effectiveTriggers.buyTriggerPercent,
            sellTriggerPercent: effectiveTriggers.sellTriggerPercent,
            profitTriggerPercent: effectiveTriggers.profitTriggerPercent,
            buyAmount: effectiveTriggers.buyAmount,
            sellAmount: effectiveTriggers.sellAmount,
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
  },

  // Enhanced method that returns constraint positions with group context
  async getEnhancedConstraintPositions(): Promise<EnhancedConstraintPosition[]> {
    try {
      const [constraints, constraintGroups, portfolio] = await Promise.all([
        constraintsService.getConstraints(),
        constraintGroupsService.getConstraintGroups(),
        portfolioService.getPortfolio().catch(() => ({ positions: [] }))
      ]);

      const enhancedPositions: EnhancedConstraintPosition[] = [];
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

        enhancedPositions.push({
          stockSymbol: constraint.stockSymbol,
          constraintId: constraint.id,
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
          status: quantity > 0 ? 'position' : 'watching',
          hasCustomTriggers: false // Individual constraints are always "custom"
        });
      }

      // Process constraint groups
      for (const constraintGroup of constraintGroups) {
        const allStocks = new Set<string>();
        
        // Add individual stocks
        constraintGroup.stocks.forEach(stock => allStocks.add(stock));
        
        // Add stocks from stock groups
        for (const stockGroup of constraintGroup.stockGroups) {
          if (stockGroup && stockGroup.stocks) {
            stockGroup.stocks.forEach(stock => allStocks.add(stock));
          }
        }

        // Create enhanced constraint positions for each stock
        for (const stockSymbol of allStocks) {
          // Skip if already added by individual constraint
          if (enhancedPositions.some(cp => cp.stockSymbol === stockSymbol)) {
            continue;
          }

          const position = existingPositions.find(p => p.stockSymbol === stockSymbol);
          const currentPrice = position?.currentPrice || 0;
          const quantity = position?.quantity || 0;
          const averageCost = position?.averageCost || 0;
          const marketValue = quantity * currentPrice;
          const unrealizedPnl = quantity > 0 ? marketValue - (quantity * averageCost) : 0;
          const unrealizedPnlPercent = averageCost > 0 ? (unrealizedPnl / (quantity * averageCost)) * 100 : 0;

          // Check if this stock has custom triggers
          const stockOverride = constraintGroup.stockOverrides?.[stockSymbol];
          const hasCustomTriggers = !!stockOverride;

          // Use custom triggers if available, otherwise use group defaults
          const effectiveTriggers = {
            buyTriggerPercent: stockOverride?.buyTriggerPercent ?? constraintGroup.buyTriggerPercent,
            sellTriggerPercent: stockOverride?.sellTriggerPercent ?? constraintGroup.sellTriggerPercent,
            profitTriggerPercent: stockOverride?.profitTriggerPercent ?? constraintGroup.profitTriggerPercent,
            buyAmount: stockOverride?.buyAmount ?? constraintGroup.buyAmount,
            sellAmount: stockOverride?.sellAmount ?? constraintGroup.sellAmount,
          };

          enhancedPositions.push({
            stockSymbol,
            constraintId: constraintGroup.id,
            constraintName: constraintGroup.name,
            constraintType: 'group',
            isActive: constraintGroup.isActive,
            buyTriggerPercent: effectiveTriggers.buyTriggerPercent,
            sellTriggerPercent: effectiveTriggers.sellTriggerPercent,
            profitTriggerPercent: effectiveTriggers.profitTriggerPercent,
            buyAmount: effectiveTriggers.buyAmount,
            sellAmount: effectiveTriggers.sellAmount,
            currentPrice,
            quantity,
            averageCost,
            marketValue,
            unrealizedPnl,
            unrealizedPnlPercent,
            status: quantity > 0 ? 'position' : 'watching',
            groupId: constraintGroup.id,
            groupName: constraintGroup.name,
            hasCustomTriggers,
            groupDefaultTriggers: {
              buyTriggerPercent: constraintGroup.buyTriggerPercent,
              sellTriggerPercent: constraintGroup.sellTriggerPercent,
              profitTriggerPercent: constraintGroup.profitTriggerPercent,
              buyAmount: constraintGroup.buyAmount,
              sellAmount: constraintGroup.sellAmount,
            }
          });
        }
      }

      // Sort by status (positions first, then watching) and then by symbol
      return enhancedPositions.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'position' ? -1 : 1;
        }
        return a.stockSymbol.localeCompare(b.stockSymbol);
      });

    } catch (error) {
      console.error('Error getting enhanced constraint positions:', error);
      return [];
    }
  },

  // Process constraint groups into display-ready format
  async getProcessedGroupData(): Promise<ProcessedGroupData[]> {
    try {
      const [constraintGroups, portfolio] = await Promise.all([
        constraintGroupsService.getConstraintGroups(),
        portfolioService.getPortfolio().catch(() => ({ positions: [] }))
      ]);

      const existingPositions = portfolio.positions || [];
      const processedGroups: ProcessedGroupData[] = [];

      for (const group of constraintGroups) {
        const individualStocks = [...group.stocks];
        const stockGroupStocks: string[] = [];
        
        // Collect stocks from stock groups
        for (const stockGroup of group.stockGroups) {
          if (stockGroup && stockGroup.stocks) {
            stockGroupStocks.push(...stockGroup.stocks);
          }
        }

        // Get all unique stocks
        const allStocks = [...new Set([...individualStocks, ...stockGroupStocks])];
        
        // Calculate group metrics
        let totalValue = 0;
        let activePositions = 0;

        for (const stockSymbol of allStocks) {
          const position = existingPositions.find(p => p.stockSymbol === stockSymbol);
          if (position && position.quantity > 0) {
            totalValue += position.quantity * (position.currentPrice || 0);
            activePositions++;
          }
        }

        processedGroups.push({
          group,
          individualStocks,
          stockGroupStocks,
          allStocks,
          totalValue,
          activePositions
        });
      }

      return processedGroups;

    } catch (error) {
      console.error('Error processing group data:', error);
      return [];
    }
  },

  // Convert constraint groups into display-ready format with stock details
  async getGroupDisplayData(): Promise<import('../types').GroupDisplayData[]> {
    try {
      const [constraintGroups, portfolio] = await Promise.all([
        constraintGroupsService.getConstraintGroups(),
        portfolioService.getPortfolio().catch(() => ({ positions: [] }))
      ]);

      const existingPositions = portfolio.positions || [];
      const groupDisplayData: import('../types').GroupDisplayData[] = [];

      for (const group of constraintGroups) {
        const allStocks = new Set<string>();
        
        // Add individual stocks
        group.stocks.forEach(stock => allStocks.add(stock));
        
        // Add stocks from stock groups
        for (const stockGroup of group.stockGroups) {
          if (stockGroup && stockGroup.stocks) {
            stockGroup.stocks.forEach(stock => allStocks.add(stock));
          }
        }

        // Create stock display data for each stock
        const stocks: import('../types').StockDisplayData[] = [];
        let totalValue = 0;
        let activePositions = 0;

        for (const stockSymbol of allStocks) {
          const position = existingPositions.find(p => p.stockSymbol === stockSymbol);
          const currentPrice = position?.currentPrice || 0;
          const quantity = position?.quantity || 0;
          const averageCost = position?.averageCost || 0;
          const marketValue = quantity * currentPrice;
          const unrealizedPnl = quantity > 0 ? marketValue - (quantity * averageCost) : 0;
          const unrealizedPnlPercent = averageCost > 0 ? (unrealizedPnl / (quantity * averageCost)) * 100 : 0;

          // Check if this stock has custom triggers
          const stockOverride = group.stockOverrides?.[stockSymbol];
          const isCustomTriggers = !!stockOverride;

          // Use custom triggers if available, otherwise use group defaults
          const triggers: import('../types').StockTriggers = {
            buyTriggerPercent: stockOverride?.buyTriggerPercent ?? group.buyTriggerPercent,
            sellTriggerPercent: stockOverride?.sellTriggerPercent ?? group.sellTriggerPercent,
            profitTriggerPercent: stockOverride?.profitTriggerPercent ?? group.profitTriggerPercent,
            buyAmount: stockOverride?.buyAmount ?? group.buyAmount,
            sellAmount: stockOverride?.sellAmount ?? group.sellAmount,
          };

          // Determine status
          let status: 'watching' | 'position' | 'triggered' = 'watching';
          if (quantity > 0) {
            status = 'position';
          }
          // TODO: Add trigger detection logic here when price monitoring is implemented

          const stockDisplayData: import('../types').StockDisplayData = {
            symbol: stockSymbol,
            position,
            currentPrice,
            triggers,
            isCustomTriggers,
            status,
            marketValue,
            unrealizedPnl,
            unrealizedPnlPercent
          };

          stocks.push(stockDisplayData);

          // Update group totals
          totalValue += marketValue;
          if (quantity > 0) {
            activePositions++;
          }
        }

        // Sort stocks by symbol
        stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));

        groupDisplayData.push({
          group,
          stocks,
          isExpanded: true, // Default to expanded
          totalValue,
          activePositions
        });
      }

      return groupDisplayData;

    } catch (error) {
      console.error('Error getting group display data:', error);
      return [];
    }
  },

  // Helper function to detect if stock has custom triggers
  hasCustomTriggers(group: ConstraintGroup, stockSymbol: string): boolean {
    return !!group.stockOverrides?.[stockSymbol];
  },

  // Helper function to get effective triggers for a stock in a group
  getEffectiveTriggers(group: ConstraintGroup, stockSymbol: string): import('../types').StockTriggers {
    const stockOverride = group.stockOverrides?.[stockSymbol];
    
    return {
      buyTriggerPercent: stockOverride?.buyTriggerPercent ?? group.buyTriggerPercent,
      sellTriggerPercent: stockOverride?.sellTriggerPercent ?? group.sellTriggerPercent,
      profitTriggerPercent: stockOverride?.profitTriggerPercent ?? group.profitTriggerPercent,
      buyAmount: stockOverride?.buyAmount ?? group.buyAmount,
      sellAmount: stockOverride?.sellAmount ?? group.sellAmount,
    };
  },

  // Helper function to get all stocks from a constraint group (including from stock groups)
  getAllStocksFromGroup(group: ConstraintGroup): string[] {
    const allStocks = new Set<string>();
    
    // Add individual stocks
    group.stocks.forEach(stock => allStocks.add(stock));
    
    // Add stocks from stock groups
    for (const stockGroup of group.stockGroups) {
      if (stockGroup && stockGroup.stocks) {
        stockGroup.stocks.forEach(stock => allStocks.add(stock));
      }
    }

    return Array.from(allStocks).sort();
  }
};