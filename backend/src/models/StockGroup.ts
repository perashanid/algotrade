import { pool } from '../config/database';
import { StockGroup, CreateStockGroupRequest } from '../types';

export class StockGroupModel {
  static async create(userId: string, groupData: CreateStockGroupRequest): Promise<StockGroup> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create the stock group
      const groupQuery = `
        INSERT INTO stock_groups (user_id, name, description, color)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, name, description, color, created_at, updated_at
      `;
      
      const groupResult = await client.query(groupQuery, [
        userId,
        groupData.name,
        groupData.description || null,
        groupData.color || '#3B82F6'
      ]);
      
      const group = groupResult.rows[0];
      
      // Add stocks to the group
      for (const stock of groupData.stocks) {
        await client.query(
          'INSERT INTO stock_group_members (group_id, stock_symbol) VALUES ($1, $2)',
          [group.id, stock.toUpperCase()]
        );
      }
      
      await client.query('COMMIT');
      
      return this.mapRowToStockGroup({ ...group, stocks: groupData.stocks });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId: string): Promise<StockGroup[]> {
    const query = `
      SELECT 
        sg.id, sg.user_id, sg.name, sg.description, sg.color, 
        sg.created_at, sg.updated_at,
        ARRAY_AGG(sgm.stock_symbol ORDER BY sgm.stock_symbol) as stocks
      FROM stock_groups sg
      LEFT JOIN stock_group_members sgm ON sg.id = sgm.group_id
      WHERE sg.user_id = $1
      GROUP BY sg.id, sg.user_id, sg.name, sg.description, sg.color, sg.created_at, sg.updated_at
      ORDER BY sg.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToStockGroup(row));
  }

  static async findById(groupId: string, userId: string): Promise<StockGroup | null> {
    const query = `
      SELECT 
        sg.id, sg.user_id, sg.name, sg.description, sg.color, 
        sg.created_at, sg.updated_at,
        ARRAY_AGG(sgm.stock_symbol ORDER BY sgm.stock_symbol) as stocks
      FROM stock_groups sg
      LEFT JOIN stock_group_members sgm ON sg.id = sgm.group_id
      WHERE sg.id = $1 AND sg.user_id = $2
      GROUP BY sg.id, sg.user_id, sg.name, sg.description, sg.color, sg.created_at, sg.updated_at
    `;
    
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0] ? this.mapRowToStockGroup(result.rows[0]) : null;
  }

  static async update(groupId: string, userId: string, updates: Partial<CreateStockGroupRequest>): Promise<StockGroup | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update group info
      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        setClause.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClause.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.color !== undefined) {
        setClause.push(`color = $${paramCount++}`);
        values.push(updates.color);
      }

      if (setClause.length > 0) {
        setClause.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(groupId, userId);

        const updateQuery = `
          UPDATE stock_groups
          SET ${setClause.join(', ')}
          WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        `;

        await client.query(updateQuery, values);
      }

      // Update stocks if provided
      if (updates.stocks !== undefined) {
        // Remove existing stocks
        await client.query('DELETE FROM stock_group_members WHERE group_id = $1', [groupId]);
        
        // Add new stocks
        for (const stock of updates.stocks) {
          await client.query(
            'INSERT INTO stock_group_members (group_id, stock_symbol) VALUES ($1, $2)',
            [groupId, stock.toUpperCase()]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Return updated group
      return await this.findById(groupId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(groupId: string, userId: string): Promise<boolean> {
    const query = `DELETE FROM stock_groups WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [groupId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToStockGroup(row: any): StockGroup {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      color: row.color,
      stocks: row.stocks ? row.stocks.filter((s: string) => s !== null) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}