import { pool } from '../config/database';
import { StockGroup, CreateStockGroupRequest } from '../types';

export class StockGroupModel {
  static async create(userId: string, groupData: CreateStockGroupRequest): Promise<StockGroup> {
    const query = `
      INSERT INTO stock_groups (user_id, name, description, color, stocks)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, name, description, color, stocks, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      userId,
      groupData.name,
      groupData.description || null,
      groupData.color || '#3B82F6',
      JSON.stringify(groupData.stocks.map(s => s.toUpperCase()))
    ]);
    
    return this.mapRowToStockGroup(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<StockGroup[]> {
    const query = `
      SELECT id, user_id, name, description, color, stocks, created_at, updated_at
      FROM stock_groups
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToStockGroup(row));
  }

  static async findById(groupId: string, userId: string): Promise<StockGroup | null> {
    const query = `
      SELECT id, user_id, name, description, color, stocks, created_at, updated_at
      FROM stock_groups
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0] ? this.mapRowToStockGroup(result.rows[0]) : null;
  }

  static async update(groupId: string, userId: string, updates: Partial<CreateStockGroupRequest>): Promise<StockGroup | null> {
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
    if (updates.stocks !== undefined) {
      setClause.push(`stocks = $${paramCount++}`);
      values.push(JSON.stringify(updates.stocks.map(s => s.toUpperCase())));
    }

    if (setClause.length === 0) {
      return await this.findById(groupId, userId);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(groupId, userId);

    const updateQuery = `
      UPDATE stock_groups
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, user_id, name, description, color, stocks, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, values);
    return result.rows[0] ? this.mapRowToStockGroup(result.rows[0]) : null;
  }

  static async delete(groupId: string, userId: string): Promise<boolean> {
    const query = `DELETE FROM stock_groups WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [groupId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToStockGroup(row: any): StockGroup {
    let stocks = [];
    try {
      stocks = row.stocks ? JSON.parse(row.stocks) : [];
      if (!Array.isArray(stocks)) stocks = [];
    } catch (e) {
      stocks = [];
    }

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      color: row.color,
      stocks: stocks.filter((s: string) => s && typeof s === 'string'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}