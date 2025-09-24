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
        stocks: JSON.parse(row.stocks || '[]'),
        stockGroups: JSON.parse(row.stock_groups || '[]'),
        buyTriggerPercent: parseFloat(row.buy_trigger_percent),
        sellTriggerPercent: parseFloat(row.sell_trigger_percent),
        profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : null,
        buyAmount: parseFloat(row.buy_amount),
        sellAmount: parseFloat(row.sell_amount),
        stockOverrides: JSON.parse(row.stock_overrides || '{}'),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json({
        success: true,
        data: constraintGroups
      });
      return;
    }

    if (req.method === 'PUT') {
      // Handle different PUT operations based on URL path
      const url = req.url || '';
      const pathParts = url.split('/').filter(Boolean);
      const groupId = pathParts[pathParts.length - 1]; // Get the last part as ID
      
      if (!groupId) {
        res.status(400).json({
          success: false,
          error: 'Group ID is required'
        });
        return;
      }

      // Handle updating individual stock constraints: PUT /api/constraint-groups/{id}/stocks/{symbol}
      if (pathParts.length === 5 && pathParts[3] === 'stocks') {
        const stockSymbol = pathParts[4];
        const constraints = req.body;
        
        // Get current group
        const getQuery = `SELECT stock_overrides FROM constraint_groups WHERE id = $1 AND user_id = $2`;
        const getResult = await executeQuery(getQuery, [groupId, user.id]);
        
        if (getResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Constraint group not found'
          });
          return;
        }

        const currentOverrides = JSON.parse(getResult.rows[0].stock_overrides || '{}');
        
        // Update overrides for this stock
        currentOverrides[stockSymbol.toUpperCase()] = {
          ...currentOverrides[stockSymbol.toUpperCase()],
          ...constraints
        };
        
        // Update the group
        const updateQuery = `
          UPDATE constraint_groups 
          SET stock_overrides = $1, updated_at = NOW()
          WHERE id = $2 AND user_id = $3
          RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                    buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                    buy_amount, sell_amount, stock_overrides, created_at, updated_at
        `;
        
        const updateResult = await executeQuery(updateQuery, [JSON.stringify(currentOverrides), groupId, user.id]);
        const group = updateResult.rows[0];
        
        res.status(200).json({
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

      // Check if it's a toggle operation
      if (pathParts[3] === 'toggle') {
        const { isActive } = req.body;
        
        const query = `
          UPDATE constraint_groups 
          SET is_active = $1, updated_at = NOW()
          WHERE id = $2 AND user_id = $3
          RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                    buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                    buy_amount, sell_amount, stock_overrides, created_at, updated_at
        `;
        
        const result = await executeQuery(query, [isActive, groupId, user.id]);
        
        if (result.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Constraint group not found'
          });
          return;
        }

        const group = result.rows[0];
        res.status(200).json({
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

      // Regular update operation
      const updates = req.body;
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        setClause.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClause.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.isActive !== undefined) {
        setClause.push(`is_active = $${paramCount++}`);
        values.push(updates.isActive);
      }
      if (updates.buyTriggerPercent !== undefined) {
        setClause.push(`buy_trigger_percent = $${paramCount++}`);
        values.push(updates.buyTriggerPercent);
      }
      if (updates.sellTriggerPercent !== undefined) {
        setClause.push(`sell_trigger_percent = $${paramCount++}`);
        values.push(updates.sellTriggerPercent);
      }
      if (updates.profitTriggerPercent !== undefined) {
        setClause.push(`profit_trigger_percent = $${paramCount++}`);
        values.push(updates.profitTriggerPercent);
      }
      if (updates.buyAmount !== undefined) {
        setClause.push(`buy_amount = $${paramCount++}`);
        values.push(updates.buyAmount);
      }
      if (updates.sellAmount !== undefined) {
        setClause.push(`sell_amount = $${paramCount++}`);
        values.push(updates.sellAmount);
      }

      if (setClause.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
        return;
      }

      setClause.push(`updated_at = NOW()`);
      values.push(groupId, user.id);

      const query = `
        UPDATE constraint_groups 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                  buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                  buy_amount, sell_amount, stock_overrides, created_at, updated_at
      `;

      const result = await executeQuery(query, values);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Constraint group not found'
        });
        return;
      }

      const group = result.rows[0];
      res.status(200).json({
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

    if (req.method === 'DELETE') {
      const url = req.url || '';
      const pathParts = url.split('/').filter(Boolean);
      const groupId = pathParts[2]; // /api/constraint-groups/{id}
      
      if (!groupId) {
        res.status(400).json({
          success: false,
          error: 'Group ID is required'
        });
        return;
      }

      // Handle removing stock from group: DELETE /api/constraint-groups/{id}/stocks/{symbol}/remove
      if (pathParts.length === 6 && pathParts[3] === 'stocks' && pathParts[5] === 'remove') {
        const stockSymbol = pathParts[4];
        
        // Get current group
        const getQuery = `SELECT stocks, stock_overrides FROM constraint_groups WHERE id = $1 AND user_id = $2`;
        const getResult = await executeQuery(getQuery, [groupId, user.id]);
        
        if (getResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Constraint group not found'
          });
          return;
        }

        const currentStocks = JSON.parse(getResult.rows[0].stocks || '[]');
        const currentOverrides = JSON.parse(getResult.rows[0].stock_overrides || '{}');
        
        // Remove stock from the array
        const updatedStocks = currentStocks.filter((stock: string) => stock !== stockSymbol.toUpperCase());
        
        // Remove any overrides for this stock
        const updatedOverrides = { ...currentOverrides };
        delete updatedOverrides[stockSymbol.toUpperCase()];
        
        // Update the group
        const updateQuery = `
          UPDATE constraint_groups 
          SET stocks = $1, stock_overrides = $2, updated_at = NOW()
          WHERE id = $3 AND user_id = $4
          RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                    buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                    buy_amount, sell_amount, stock_overrides, created_at, updated_at
        `;
        
        const updateResult = await executeQuery(updateQuery, [
          JSON.stringify(updatedStocks), 
          JSON.stringify(updatedOverrides), 
          groupId, 
          user.id
        ]);
        const group = updateResult.rows[0];
        
        res.status(200).json({
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

      // Delete constraint group
      const query = `DELETE FROM constraint_groups WHERE id = $1 AND user_id = $2`;
      const result = await executeQuery(query, [groupId, user.id]);
      
      if ((result.rowCount ?? 0) === 0) {
        res.status(404).json({
          success: false,
          error: 'Constraint group not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: null
      });
      return;
    }

    if (req.method === 'POST') {
      const url = req.url || '';
      const pathParts = url.split('/').filter(Boolean);
      
      // Handle adding stock to group: POST /api/constraint-groups/{id}/stocks
      if (pathParts.length === 4 && pathParts[3] === 'stocks') {
        const groupId = pathParts[2];
        const { stockSymbol } = req.body;
        
        if (!groupId || !stockSymbol) {
          res.status(400).json({
            success: false,
            error: 'Group ID and stock symbol are required'
          });
          return;
        }

        // Get current group
        const getQuery = `SELECT stocks FROM constraint_groups WHERE id = $1 AND user_id = $2`;
        const getResult = await executeQuery(getQuery, [groupId, user.id]);
        
        if (getResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Constraint group not found'
          });
          return;
        }

        const currentStocks = JSON.parse(getResult.rows[0].stocks || '[]');
        
        // Check if stock already exists
        if (currentStocks.includes(stockSymbol.toUpperCase())) {
          res.status(400).json({
            success: false,
            error: 'Stock already exists in this group'
          });
          return;
        }

        // Add stock to the array
        const updatedStocks = [...currentStocks, stockSymbol.toUpperCase()];
        
        // Update the group
        const updateQuery = `
          UPDATE constraint_groups 
          SET stocks = $1, updated_at = NOW()
          WHERE id = $2 AND user_id = $3
          RETURNING id, user_id, name, description, is_active, stocks, stock_groups,
                    buy_trigger_percent, sell_trigger_percent, profit_trigger_percent,
                    buy_amount, sell_amount, stock_overrides, created_at, updated_at
        `;
        
        const updateResult = await executeQuery(updateQuery, [JSON.stringify(updatedStocks), groupId, user.id]);
        const group = updateResult.rows[0];
        
        res.status(200).json({
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