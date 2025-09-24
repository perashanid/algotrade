import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { requireAuth } from './lib/auth';
import { executeQuery } from './lib/database';

async function constraintsHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get user's constraints from database
      const query = `
        SELECT id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent, 
               profit_trigger_percent, buy_amount, sell_amount, is_active, 
               created_at, updated_at
        FROM constraints 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      
      const result = await executeQuery(query, [user.id]);
      
      const constraints = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        stockSymbol: row.stock_symbol,
        buyTriggerPercent: parseFloat(row.buy_trigger_percent),
        sellTriggerPercent: parseFloat(row.sell_trigger_percent),
        profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : null,
        buyAmount: parseFloat(row.buy_amount),
        sellAmount: parseFloat(row.sell_amount),
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json({
        success: true,
        data: constraints
      });
      return;
    }

    if (req.method === 'POST') {
      // Create new constraint
      const {
        stockSymbol,
        buyTriggerPercent,
        sellTriggerPercent,
        profitTriggerPercent,
        buyAmount,
        sellAmount,
        isActive = true
      } = req.body;

      // Validation
      if (!stockSymbol || buyTriggerPercent === undefined || sellTriggerPercent === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: stockSymbol, buyTriggerPercent, sellTriggerPercent'
        });
        return;
      }

      const query = `
        INSERT INTO constraints (
          user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
          profit_trigger_percent, buy_amount, sell_amount, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
                  profit_trigger_percent, buy_amount, sell_amount, is_active,
                  created_at, updated_at
      `;

      const result = await executeQuery(query, [
        user.id,
        stockSymbol.toUpperCase(),
        buyTriggerPercent,
        sellTriggerPercent,
        profitTriggerPercent,
        buyAmount || 1000,
        sellAmount || 1000,
        isActive
      ]);

      const constraint = result.rows[0];
      
      res.status(201).json({
        success: true,
        data: {
          id: constraint.id,
          userId: constraint.user_id,
          stockSymbol: constraint.stock_symbol,
          buyTriggerPercent: parseFloat(constraint.buy_trigger_percent),
          sellTriggerPercent: parseFloat(constraint.sell_trigger_percent),
          profitTriggerPercent: constraint.profit_trigger_percent ? parseFloat(constraint.profit_trigger_percent) : null,
          buyAmount: parseFloat(constraint.buy_amount),
          sellAmount: parseFloat(constraint.sell_amount),
          isActive: constraint.is_active,
          createdAt: constraint.created_at,
          updatedAt: constraint.updated_at
        }
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Constraints API error:', error);
    
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

export default withCors(constraintsHandler);