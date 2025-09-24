import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { requireAuth } from './lib/auth';
import { executeQuery } from './lib/database';

async function stockGroupsHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get user's stock groups from database
      const query = `
        SELECT id, user_id, name, description, color, stocks, created_at, updated_at
        FROM stock_groups 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      
      const result = await executeQuery(query, [user.id]);
      
      const stockGroups = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        color: row.color,
        stocks: JSON.parse(row.stocks || '[]'),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json({
        success: true,
        data: stockGroups
      });
      return;
    }

    if (req.method === 'POST') {
      // Create new stock group
      const {
        name,
        description = '',
        color = '#3B82F6',
        stocks = []
      } = req.body;

      // Validation
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: name'
        });
        return;
      }

      const query = `
        INSERT INTO stock_groups (user_id, name, description, color, stocks)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, name, description, color, stocks, created_at, updated_at
      `;

      const result = await executeQuery(query, [
        user.id,
        name,
        description,
        color,
        JSON.stringify(stocks.map((s: string) => s.toUpperCase()))
      ]);

      const stockGroup = result.rows[0];
      
      res.status(201).json({
        success: true,
        data: {
          id: stockGroup.id,
          userId: stockGroup.user_id,
          name: stockGroup.name,
          description: stockGroup.description,
          color: stockGroup.color,
          stocks: JSON.parse(stockGroup.stocks || '[]'),
          createdAt: stockGroup.created_at,
          updatedAt: stockGroup.updated_at
        }
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stock Groups API error:', error);
    
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

export default withCors(stockGroupsHandler);