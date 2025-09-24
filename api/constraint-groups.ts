import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { requireAuth } from './lib/auth';
import { executeQuery } from './lib/database';

async function constraintGroupsHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get user's constraint groups from database
      const query = `
        SELECT cg.id, cg.user_id, cg.name, cg.description, cg.is_active,
               cg.stocks, cg.stock_groups, cg.buy_trigger_percent, cg.sell_trigger_percent,
               cg.profit_trigger_percent, cg.buy_amount, cg.sell_amount,
               cg.stock_overrides, cg.created_at, cg.updated_at
        FROM constraint_groups cg
        WHERE cg.user_id = $1
        ORDER BY cg.created_at DESC
      `;
      
      const result = await executeQuery(query, [user.id]);
      
      const constraintGroups = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        isActive: row.is_active,
        stocks: row.stocks || [],
        stockGroups: row.stock_groups || [],
        buyTriggerPercent: parseFloat(row.buy_trigger_percent),
        sellTriggerPercent: parseFloat(row.sell_trigger_percent),
        profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : null,
        buyAmount: parseFloat(row.buy_amount),
        sellAmount: parseFloat(row.sell_amount),
        stockOverrides: row.stock_overrides || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json({
        success: true,
        data: constraintGroups
      });
      return;
    }

    if (req.method === 'POST') {
      // Create new constraint group
      const {
        name,
        description,
        stocks = [],
        stockGroups = [],
        buyTriggerPercent,
        sellTriggerPercent,
        profitTriggerPercent,
        buyAmount = 1000,
        sellAmount = 1000,
        stockOverrides = {},
        isActive = true
      } = req.body;

      // Validation
      if (!name || buyTriggerPercent === undefined || sellTriggerPercent === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, buyTriggerPercent, sellTriggerPercent'
        });
        return;
      }

      const query = `
        INSERT INTO constraint_groups (
          user_id, name, description, is_active, stocks, stock_groups,
          buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
          buy_amount, sell_amount, stock_overrides
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                  buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                  buy_amount, sell_amount, stock_overrides, created_at, updated_at
      `;

      const result = await executeQuery(query, [
        user.id,
        name,
        description || '',
        isActive,
        JSON.stringify(stocks),
        JSON.stringify(stockGroups),
        buyTriggerPercent,
        sellTriggerPercent,
        profitTriggerPercent,
        buyAmount,
        sellAmount,
        JSON.stringify(stockOverrides)
      ]);

      const group = result.rows[0];
      
      res.status(201).json({
        success: true,
        data: {
          id: group.id,
          userId: group.user_id,
          name: group.name,
          description: group.description,
          isActive: group.is_active,
          stocks: JSON.parse(group.stocks || '[]'),
          stockGroups: JSON.parse(group.stock_groups || '[]'),
          buyTriggerPercent: parseFloat(group.buy_trigger_percent),
          sellTriggerPercent: parseFloat(group.sell_trigger_percent),
          profitTriggerPercent: group.profit_trigger_percent ? parseFloat(group.profit_trigger_percent) : null,
          buyAmount: parseFloat(group.buy_amount),
          sellAmount: parseFloat(group.sell_amount),
          stockOverrides: JSON.parse(group.stock_overrides || '{}'),
          createdAt: group.created_at,
          updatedAt: group.updated_at
        }
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Constraint Groups API error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export default withCors(constraintGroupsHandler);