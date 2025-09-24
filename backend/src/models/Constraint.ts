import { pool } from '../config/database';
import { TradingConstraint, CreateConstraintRequest, UpdateConstraintRequest } from '../types';

export class ConstraintModel {
  static async create(userId: string, constraint: CreateConstraintRequest): Promise<TradingConstraint> {
    const query = `
      INSERT INTO constraints (
        user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
        profit_trigger_percent, buy_amount, sell_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
                profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
    `;
    
    const values = [
      userId,
      constraint.stockSymbol.toUpperCase(),
      constraint.buyTriggerPercent,
      constraint.sellTriggerPercent,
      constraint.profitTriggerPercent || null,
      constraint.buyAmount,
      constraint.sellAmount
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToConstraint(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<TradingConstraint[]> {
    const query = `
      SELECT id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
             profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
      FROM constraints
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToConstraint(row));
  }

  static async findById(constraintId: string, userId: string): Promise<TradingConstraint | null> {
    const query = `
      SELECT id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
             profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
      FROM constraints
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [constraintId, userId]);
    return result.rows[0] ? this.mapRowToConstraint(result.rows[0]) : null;
  }

  static async findActiveBySymbol(stockSymbol: string): Promise<TradingConstraint[]> {
    const query = `
      SELECT id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
             profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
      FROM constraints
      WHERE stock_symbol = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [stockSymbol.toUpperCase()]);
    return result.rows.map(row => this.mapRowToConstraint(row));
  }

  static async update(constraintId: string, userId: string, updates: UpdateConstraintRequest): Promise<TradingConstraint | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

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
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (setClause.length === 0) {
      return null;
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(constraintId, userId);

    const query = `
      UPDATE constraints
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
                profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToConstraint(result.rows[0]) : null;
  }

  static async delete(constraintId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM constraints
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [constraintId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findActiveConstraints(): Promise<TradingConstraint[]> {
    const query = `
      SELECT id, user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent,
             profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
      FROM constraints
      WHERE is_active = true
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToConstraint(row));
  }

  private static mapRowToConstraint(row: any): TradingConstraint {
    return {
      id: row.id,
      userId: row.user_id,
      stockSymbol: row.stock_symbol,
      buyTriggerPercent: parseFloat(row.buy_trigger_percent),
      sellTriggerPercent: parseFloat(row.sell_trigger_percent),
      profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : undefined,
      buyAmount: parseFloat(row.buy_amount),
      sellAmount: parseFloat(row.sell_amount),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}