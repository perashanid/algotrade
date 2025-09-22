import { pool } from '../config/database';
import { ConstraintGroup, CreateConstraintGroupRequest } from '../types';

export class ConstraintGroupModel {
  static async create(userId: string, constraintData: CreateConstraintGroupRequest): Promise<ConstraintGroup> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create the constraint group
      const constraintQuery = `
        INSERT INTO constraint_groups (
          user_id, name, description, buy_trigger_percent, sell_trigger_percent,
          profit_trigger_percent, buy_amount, sell_amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, name, description, buy_trigger_percent, sell_trigger_percent,
                  profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at
      `;
      
      const constraintResult = await client.query(constraintQuery, [
        userId,
        constraintData.name,
        constraintData.description || null,
        constraintData.buyTriggerPercent,
        constraintData.sellTriggerPercent,
        constraintData.profitTriggerPercent || null,
        constraintData.buyAmount,
        constraintData.sellAmount
      ]);
      
      const constraint = constraintResult.rows[0];
      
      // Add individual stocks
      for (const stock of constraintData.stocks) {
        await client.query(
          'INSERT INTO constraint_stocks (constraint_group_id, stock_symbol) VALUES ($1, $2)',
          [constraint.id, stock.toUpperCase()]
        );
      }
      
      // Add stock groups
      for (const groupId of constraintData.stockGroups) {
        await client.query(
          'INSERT INTO constraint_stock_groups (constraint_group_id, stock_group_id) VALUES ($1, $2)',
          [constraint.id, groupId]
        );
      }
      
      await client.query('COMMIT');
      
      return this.mapRowToConstraintGroup({
        ...constraint,
        stocks: constraintData.stocks,
        stockGroups: constraintData.stockGroups
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId: string): Promise<ConstraintGroup[]> {
    const query = `
      SELECT 
        cg.id, cg.user_id, cg.name, cg.description, 
        cg.buy_trigger_percent, cg.sell_trigger_percent, cg.profit_trigger_percent,
        cg.buy_amount, cg.sell_amount, cg.is_active, cg.created_at, cg.updated_at,
        COALESCE(ARRAY_AGG(DISTINCT cs.stock_symbol) FILTER (WHERE cs.stock_symbol IS NOT NULL), ARRAY[]::VARCHAR[]) as stocks,
        COALESCE(ARRAY_AGG(DISTINCT csg.stock_group_id) FILTER (WHERE csg.stock_group_id IS NOT NULL), ARRAY[]::UUID[]) as stock_groups
      FROM constraint_groups cg
      LEFT JOIN constraint_stocks cs ON cg.id = cs.constraint_group_id
      LEFT JOIN constraint_stock_groups csg ON cg.id = csg.constraint_group_id
      WHERE cg.user_id = $1
      GROUP BY cg.id, cg.user_id, cg.name, cg.description, 
               cg.buy_trigger_percent, cg.sell_trigger_percent, cg.profit_trigger_percent,
               cg.buy_amount, cg.sell_amount, cg.is_active, cg.created_at, cg.updated_at
      ORDER BY cg.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToConstraintGroup(row));
  }

  static async findById(constraintId: string, userId: string): Promise<ConstraintGroup | null> {
    const query = `
      SELECT 
        cg.id, cg.user_id, cg.name, cg.description, 
        cg.buy_trigger_percent, cg.sell_trigger_percent, cg.profit_trigger_percent,
        cg.buy_amount, cg.sell_amount, cg.is_active, cg.created_at, cg.updated_at,
        COALESCE(ARRAY_AGG(DISTINCT cs.stock_symbol) FILTER (WHERE cs.stock_symbol IS NOT NULL), ARRAY[]::VARCHAR[]) as stocks,
        COALESCE(ARRAY_AGG(DISTINCT csg.stock_group_id) FILTER (WHERE csg.stock_group_id IS NOT NULL), ARRAY[]::UUID[]) as stock_groups
      FROM constraint_groups cg
      LEFT JOIN constraint_stocks cs ON cg.id = cs.constraint_group_id
      LEFT JOIN constraint_stock_groups csg ON cg.id = csg.constraint_group_id
      WHERE cg.id = $1 AND cg.user_id = $2
      GROUP BY cg.id, cg.user_id, cg.name, cg.description, 
               cg.buy_trigger_percent, cg.sell_trigger_percent, cg.profit_trigger_percent,
               cg.buy_amount, cg.sell_amount, cg.is_active, cg.created_at, cg.updated_at
    `;
    
    const result = await pool.query(query, [constraintId, userId]);
    return result.rows[0] ? this.mapRowToConstraintGroup(result.rows[0]) : null;
  }

  static async update(constraintId: string, userId: string, updates: Partial<ConstraintGroup>): Promise<ConstraintGroup | null> {
    const allowedFields = [
      'name', 'description', 'buy_trigger_percent', 'sell_trigger_percent', 
      'profit_trigger_percent', 'buy_amount', 'sell_amount', 'is_active'
    ];
    
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField) && value !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    if (updateFields.length === 0) {
      return await this.findById(constraintId, userId);
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(constraintId, userId);
    
    const query = `
      UPDATE constraint_groups
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    `;
    
    await pool.query(query, values);
    return await this.findById(constraintId, userId);
  }

  static async toggleActive(constraintId: string, userId: string, isActive: boolean): Promise<ConstraintGroup | null> {
    const query = `
      UPDATE constraint_groups
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
    `;
    
    await pool.query(query, [isActive, constraintId, userId]);
    return await this.findById(constraintId, userId);
  }

  static async delete(constraintId: string, userId: string): Promise<boolean> {
    const query = `DELETE FROM constraint_groups WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [constraintId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToConstraintGroup(row: any): ConstraintGroup {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      buyTriggerPercent: parseFloat(row.buy_trigger_percent),
      sellTriggerPercent: parseFloat(row.sell_trigger_percent),
      profitTriggerPercent: row.profit_trigger_percent ? parseFloat(row.profit_trigger_percent) : undefined,
      buyAmount: parseFloat(row.buy_amount),
      sellAmount: parseFloat(row.sell_amount),
      isActive: row.is_active,
      stocks: row.stocks || [],
      stockGroups: row.stock_groups || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}