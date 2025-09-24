import { executeQueryWithRetry } from '../config/database';

// Optimized constraint position data structure
export interface OptimizedConstraintPosition {
  stockSymbol: string;
  constraintId?: string;
  constraintName?: string;
  constraintType: 'individual' | 'group';
  isActive: boolean;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
  currentPrice: number;
  quantity: number;
  averageCost: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  status: 'position' | 'watching';
  hasCustomTriggers?: boolean;
  groupId?: string;
  groupName?: string;
}

export interface OptimizedGroupSummary {
  groupId: string;
  groupName: string;
  isActive: boolean;
  totalStocks: number;
  activePositions: number;
  totalValue: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}

export class OptimizedConstraintPositionService {
  // Single optimized query to get all constraint positions with portfolio data
  static async getConstraintPositions(userId: string): Promise<OptimizedConstraintPosition[]> {
    return await this.getConstraintPositionsFromDatabase(userId);
  }

  private static async getConstraintPositionsFromDatabase(userId: string): Promise<OptimizedConstraintPosition[]> {
    try {
      // Single complex query that gets all constraint positions with portfolio data
      const query = `
        WITH individual_constraints AS (
          SELECT 
            c.id as constraint_id,
            c.stock_symbol,
            c.buy_trigger_percent,
            c.sell_trigger_percent,
            c.profit_trigger_percent,
            c.buy_amount,
            c.sell_amount,
            c.is_active,
            'individual' as constraint_type,
            NULL as group_id,
            NULL as group_name,
            false as has_custom_triggers
          FROM constraints c
          WHERE c.user_id = $1
        ),
        
        expanded_group_stocks AS (
          SELECT 
            cg.id as group_id,
            cg.name as group_name,
            cg.is_active,
            cg.buy_trigger_percent as group_buy_trigger,
            cg.sell_trigger_percent as group_sell_trigger,
            cg.profit_trigger_percent as group_profit_trigger,
            cg.buy_amount as group_buy_amount,
            cg.sell_amount as group_sell_amount,
            stock_symbol,
            COALESCE(
              (cg.stock_overrides->stock_symbol->>'buyTriggerPercent')::numeric,
              cg.buy_trigger_percent
            ) as buy_trigger_percent,
            COALESCE(
              (cg.stock_overrides->stock_symbol->>'sellTriggerPercent')::numeric,
              cg.sell_trigger_percent
            ) as sell_trigger_percent,
            COALESCE(
              (cg.stock_overrides->stock_symbol->>'profitTriggerPercent')::numeric,
              cg.profit_trigger_percent
            ) as profit_trigger_percent,
            COALESCE(
              (cg.stock_overrides->stock_symbol->>'buyAmount')::numeric,
              cg.buy_amount
            ) as buy_amount,
            COALESCE(
              (cg.stock_overrides->stock_symbol->>'sellAmount')::numeric,
              cg.sell_amount
            ) as sell_amount,
            CASE 
              WHEN cg.stock_overrides ? stock_symbol THEN true 
              ELSE false 
            END as has_custom_triggers
          FROM constraint_groups cg
          CROSS JOIN LATERAL (
            SELECT unnest(
              ARRAY(SELECT jsonb_array_elements_text(cg.stocks)) ||
              ARRAY(
                SELECT jsonb_array_elements_text(sg_stocks.stocks)
                FROM jsonb_array_elements(cg.stock_groups) sg(sg_data)
                JOIN stock_groups sg_stocks ON sg_stocks.id = (sg_data->>'id')::uuid
              )
            ) as stock_symbol
          ) expanded_stocks
          WHERE cg.user_id = $1
        ),
        
        group_constraints AS (
          SELECT 
            NULL as constraint_id,
            stock_symbol,
            buy_trigger_percent,
            sell_trigger_percent,
            profit_trigger_percent,
            buy_amount,
            sell_amount,
            is_active,
            'group' as constraint_type,
            group_id,
            group_name,
            has_custom_triggers
          FROM expanded_group_stocks
          WHERE stock_symbol NOT IN (
            SELECT stock_symbol FROM individual_constraints
          )
        ),
        
        all_constraints AS (
          SELECT * FROM individual_constraints
          UNION ALL
          SELECT * FROM group_constraints
        )
        
        SELECT 
          ac.*,
          COALESCE(p.quantity, 0) as quantity,
          COALESCE(p.average_cost, 0) as average_cost,
          COALESCE(p.current_price, 0) as current_price,
          COALESCE(p.quantity * p.current_price, 0) as market_value,
          COALESCE(
            (p.quantity * p.current_price) - (p.quantity * p.average_cost), 
            0
          ) as unrealized_pnl,
          CASE 
            WHEN p.quantity > 0 AND p.average_cost > 0 THEN
              (((p.current_price - p.average_cost) / p.average_cost) * 100)
            ELSE 0
          END as unrealized_pnl_percent,
          CASE 
            WHEN COALESCE(p.quantity, 0) > 0 THEN 'position'
            ELSE 'watching'
          END as status
        FROM all_constraints ac
        LEFT JOIN positions p ON p.stock_symbol = ac.stock_symbol AND p.user_id = $1
        ORDER BY 
          CASE WHEN COALESCE(p.quantity, 0) > 0 THEN 0 ELSE 1 END,
          ac.stock_symbol;
      `;

      const result = await executeQueryWithRetry(query, [userId]);
      
      return result.rows.map((row: any) => ({
        stockSymbol: row.stock_symbol,
        constraintId: row.constraint_id,
        constraintName: row.group_name,
        constraintType: row.constraint_type as 'individual' | 'group',
        isActive: row.is_active,
        buyTriggerPercent: parseFloat(row.buy_trigger_percent),
        sellTriggerPercent: parseFloat(row.sell_trigger_percent),
        profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : undefined,
        buyAmount: parseFloat(row.buy_amount),
        sellAmount: parseFloat(row.sell_amount),
        currentPrice: parseFloat(row.current_price) || 0,
        quantity: parseFloat(row.quantity) || 0,
        averageCost: parseFloat(row.average_cost) || 0,
        marketValue: parseFloat(row.market_value) || 0,
        unrealizedPnl: parseFloat(row.unrealized_pnl) || 0,
        unrealizedPnlPercent: parseFloat(row.unrealized_pnl_percent) || 0,
        status: row.status as 'position' | 'watching',
        hasCustomTriggers: row.has_custom_triggers,
        groupId: row.group_id,
        groupName: row.group_name
      }));

    } catch (error) {
      console.error('Error getting constraint positions from database:', error);
      throw error;
    }
  }

  // Optimized group summary with database-level aggregations
  static async getGroupSummary(userId: string): Promise<OptimizedGroupSummary[]> {
    return await this.getGroupSummaryFromDatabase(userId);
  }

  private static async getGroupSummaryFromDatabase(userId: string): Promise<OptimizedGroupSummary[]> {
    try {
      const query = `
        WITH expanded_group_stocks AS (
          SELECT 
            cg.id as group_id,
            cg.name as group_name,
            cg.is_active,
            cg.buy_trigger_percent,
            cg.sell_trigger_percent,
            cg.profit_trigger_percent,
            cg.buy_amount,
            cg.sell_amount,
            stock_symbol
          FROM constraint_groups cg
          CROSS JOIN LATERAL (
            SELECT unnest(
              ARRAY(SELECT jsonb_array_elements_text(cg.stocks)) ||
              ARRAY(
                SELECT jsonb_array_elements_text(sg_stocks.stocks)
                FROM jsonb_array_elements(cg.stock_groups) sg(sg_data)
                JOIN stock_groups sg_stocks ON sg_stocks.id = (sg_data->>'id')::uuid
              )
            ) as stock_symbol
          ) expanded_stocks
          WHERE cg.user_id = $1
        ),
        
        group_positions AS (
          SELECT 
            egs.group_id,
            egs.group_name,
            egs.is_active,
            egs.buy_trigger_percent,
            egs.sell_trigger_percent,
            egs.profit_trigger_percent,
            egs.buy_amount,
            egs.sell_amount,
            COUNT(DISTINCT egs.stock_symbol) as total_stocks,
            COUNT(DISTINCT CASE WHEN p.quantity > 0 THEN p.stock_symbol END) as active_positions,
            COALESCE(SUM(p.quantity * COALESCE(p.current_price, 0)), 0) as total_value,
            COALESCE(
              SUM((p.quantity * COALESCE(p.current_price, 0)) - (p.quantity * p.average_cost)), 
              0
            ) as total_unrealized_pnl
          FROM expanded_group_stocks egs
          LEFT JOIN positions p ON p.stock_symbol = egs.stock_symbol AND p.user_id = $1
          GROUP BY 
            egs.group_id, egs.group_name, egs.is_active,
            egs.buy_trigger_percent, egs.sell_trigger_percent, egs.profit_trigger_percent,
            egs.buy_amount, egs.sell_amount
        )
        
        SELECT 
          *,
          CASE 
            WHEN total_value > 0 THEN 
              (total_unrealized_pnl / (total_value - total_unrealized_pnl)) * 100
            ELSE 0
          END as total_unrealized_pnl_percent
        FROM group_positions
        ORDER BY group_name;
      `;

      const result = await executeQueryWithRetry(query, [userId]);
      
      return result.rows.map((row: any) => ({
        groupId: row.group_id,
        groupName: row.group_name,
        isActive: row.is_active,
        totalStocks: parseInt(row.total_stocks) || 0,
        activePositions: parseInt(row.active_positions) || 0,
        totalValue: parseFloat(row.total_value) || 0,
        totalUnrealizedPnl: parseFloat(row.total_unrealized_pnl) || 0,
        totalUnrealizedPnlPercent: parseFloat(row.total_unrealized_pnl_percent) || 0,
        buyTriggerPercent: parseFloat(row.buy_trigger_percent),
        sellTriggerPercent: parseFloat(row.sell_trigger_percent),
        profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : undefined,
        buyAmount: parseFloat(row.buy_amount),
        sellAmount: parseFloat(row.sell_amount)
      }));

    } catch (error) {
      console.error('Error getting group summary from database:', error);
      throw error;
    }
  }

  // Cache invalidation removed for deployment reliability

  // Cache invalidation removed for deployment reliability

  // Get combined dashboard data in single call
  static async getDashboardData(userId: string): Promise<{
    constraintPositions: OptimizedConstraintPosition[];
    groupSummary: OptimizedGroupSummary[];
    totalPositions: number;
    totalWatching: number;
    totalValue: number;
    totalUnrealizedPnl: number;
  }> {
    try {
      // Get both datasets in parallel
      const [constraintPositions, groupSummary] = await Promise.all([
        this.getConstraintPositions(userId),
        this.getGroupSummary(userId)
      ]);

      // Calculate summary statistics
      const totalPositions = constraintPositions.filter(cp => cp.status === 'position').length;
      const totalWatching = constraintPositions.filter(cp => cp.status === 'watching').length;
      const totalValue = constraintPositions.reduce((sum, cp) => sum + cp.marketValue, 0);
      const totalUnrealizedPnl = constraintPositions.reduce((sum, cp) => sum + cp.unrealizedPnl, 0);

      return {
        constraintPositions,
        groupSummary,
        totalPositions,
        totalWatching,
        totalValue,
        totalUnrealizedPnl
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }


}