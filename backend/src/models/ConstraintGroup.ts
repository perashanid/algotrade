import { pool } from '../config/database';
import { ConstraintGroup, CreateConstraintGroupRequest, StockGroup } from '../types';

// Intermediate interface for constraint groups with stock group IDs
interface ConstraintGroupWithIds extends Omit<ConstraintGroup, 'stockGroups'> {
  stockGroups: string[];
}

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

      // For create, we return a simple constraint group with empty stock groups
      // since we don't need to populate the full objects for creation
      const groupWithIds = this.mapRowToConstraintGroup({
        ...constraint,
        stocks: constraintData.stocks,
        stock_groups: constraintData.stockGroups
      });

      // Convert to full ConstraintGroup with empty stock groups array
      return {
        ...groupWithIds,
        stockGroups: []
      };
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
    const constraintGroupsWithIds = result.rows.map(row => this.mapRowToConstraintGroup(row));

    // Convert to full ConstraintGroup objects with populated stock groups
    const constraintGroups: ConstraintGroup[] = [];

    for (const groupWithIds of constraintGroupsWithIds) {
      // Load full stock group objects
      let fullStockGroups: StockGroup[] = [];
      if (groupWithIds.stockGroups.length > 0) {
        const stockGroupsQuery = `
          SELECT id, user_id, name, description, color, stocks, created_at, updated_at
          FROM stock_groups
          WHERE id = ANY($1) AND user_id = $2
        `;
        const stockGroupsResult = await pool.query(stockGroupsQuery, [groupWithIds.stockGroups, userId]);

        // Map the stock groups with parsed stocks
        fullStockGroups = stockGroupsResult.rows.map((sgRow: any) => {
          let stocks = [];
          try {
            stocks = sgRow.stocks ? JSON.parse(sgRow.stocks) : [];
            if (!Array.isArray(stocks)) stocks = [];
          } catch (e) {
            stocks = [];
          }

          return {
            id: sgRow.id,
            userId: sgRow.user_id,
            name: sgRow.name,
            description: sgRow.description,
            color: sgRow.color,
            stocks: stocks.filter((s: string) => s && typeof s === 'string'),
            createdAt: sgRow.created_at,
            updatedAt: sgRow.updated_at
          };
        });
      }

      // Create the full ConstraintGroup object
      const fullGroup: ConstraintGroup = {
        ...groupWithIds,
        stockGroups: fullStockGroups
      };

      constraintGroups.push(fullGroup);
    }

    // Load individual stock overrides for each group
    for (const group of constraintGroups) {
      const overridesQuery = `
        SELECT stock_symbol, buy_trigger_percent, sell_trigger_percent, 
               profit_trigger_percent, buy_amount, sell_amount
        FROM constraint_stock_overrides
        WHERE constraint_group_id = $1
      `;
      const overridesResult = await pool.query(overridesQuery, [group.id]);
      group.stockOverrides = {};

      for (const override of overridesResult.rows) {
        group.stockOverrides[override.stock_symbol] = {
          buyTriggerPercent: override.buy_trigger_percent ? parseFloat(override.buy_trigger_percent) : undefined,
          sellTriggerPercent: override.sell_trigger_percent ? parseFloat(override.sell_trigger_percent) : undefined,
          profitTriggerPercent: override.profit_trigger_percent ? parseFloat(override.profit_trigger_percent) : undefined,
          buyAmount: override.buy_amount ? parseFloat(override.buy_amount) : undefined,
          sellAmount: override.sell_amount ? parseFloat(override.sell_amount) : undefined
        };
      }
    }

    return constraintGroups;
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
    if (!result.rows[0]) return null;

    const groupWithIds = this.mapRowToConstraintGroup(result.rows[0]);

    // Load full stock group objects
    let fullStockGroups: StockGroup[] = [];
    if (groupWithIds.stockGroups.length > 0) {
      const stockGroupsQuery = `
        SELECT id, user_id, name, description, color, stocks, created_at, updated_at
        FROM stock_groups
        WHERE id = ANY($1) AND user_id = $2
      `;
      const stockGroupsResult = await pool.query(stockGroupsQuery, [groupWithIds.stockGroups, userId]);

      fullStockGroups = stockGroupsResult.rows.map((sgRow: any) => {
        let stocks = [];
        try {
          stocks = sgRow.stocks ? JSON.parse(sgRow.stocks) : [];
          if (!Array.isArray(stocks)) stocks = [];
        } catch (e) {
          stocks = [];
        }

        return {
          id: sgRow.id,
          userId: sgRow.user_id,
          name: sgRow.name,
          description: sgRow.description,
          color: sgRow.color,
          stocks: stocks.filter((s: string) => s && typeof s === 'string'),
          createdAt: sgRow.created_at,
          updatedAt: sgRow.updated_at
        };
      });
    }

    const fullGroup: ConstraintGroup = {
      ...groupWithIds,
      stockGroups: fullStockGroups
    };

    // Load individual stock overrides
    const overridesQuery = `
      SELECT stock_symbol, buy_trigger_percent, sell_trigger_percent, 
             profit_trigger_percent, buy_amount, sell_amount
      FROM constraint_stock_overrides
      WHERE constraint_group_id = $1
    `;
    const overridesResult = await pool.query(overridesQuery, [constraintId]);
    fullGroup.stockOverrides = {};

    for (const override of overridesResult.rows) {
      fullGroup.stockOverrides[override.stock_symbol] = {
        buyTriggerPercent: override.buy_trigger_percent ? parseFloat(override.buy_trigger_percent) : undefined,
        sellTriggerPercent: override.sell_trigger_percent ? parseFloat(override.sell_trigger_percent) : undefined,
        profitTriggerPercent: override.profit_trigger_percent ? parseFloat(override.profit_trigger_percent) : undefined,
        buyAmount: override.buy_amount ? parseFloat(override.buy_amount) : undefined,
        sellAmount: override.sell_amount ? parseFloat(override.sell_amount) : undefined
      };
    }

    return fullGroup;
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

    console.log('Update query:', query);
    console.log('Update values:', values);

    try {
      await pool.query(query, values);
      return await this.findById(constraintId, userId);
    } catch (error) {
      console.error('Update constraint group error:', error);
      throw error;
    }
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

  static async updateStockConstraint(
    constraintId: string,
    userId: string,
    stockSymbol: string,
    constraints: {
      buyTriggerPercent?: number;
      sellTriggerPercent?: number;
      profitTriggerPercent?: number;
      buyAmount?: number;
      sellAmount?: number;
    }
  ): Promise<boolean> {
    // First verify the constraint group belongs to the user
    const groupExists = await pool.query(
      'SELECT id FROM constraint_groups WHERE id = $1 AND user_id = $2',
      [constraintId, userId]
    );

    if (groupExists.rows.length === 0) {
      throw new Error('Constraint group not found');
    }

    // Upsert the stock override
    const query = `
      INSERT INTO constraint_stock_overrides (
        constraint_group_id, stock_symbol, buy_trigger_percent, 
        sell_trigger_percent, profit_trigger_percent, buy_amount, sell_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (constraint_group_id, stock_symbol)
      DO UPDATE SET
        buy_trigger_percent = EXCLUDED.buy_trigger_percent,
        sell_trigger_percent = EXCLUDED.sell_trigger_percent,
        profit_trigger_percent = EXCLUDED.profit_trigger_percent,
        buy_amount = EXCLUDED.buy_amount,
        sell_amount = EXCLUDED.sell_amount,
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [
      constraintId,
      stockSymbol.toUpperCase(),
      constraints.buyTriggerPercent,
      constraints.sellTriggerPercent,
      constraints.profitTriggerPercent,
      constraints.buyAmount,
      constraints.sellAmount
    ]);

    return true;
  }

  static async removeStockConstraint(constraintId: string, userId: string, stockSymbol: string): Promise<boolean> {
    // First verify the constraint group belongs to the user
    const groupExists = await pool.query(
      'SELECT id FROM constraint_groups WHERE id = $1 AND user_id = $2',
      [constraintId, userId]
    );

    if (groupExists.rows.length === 0) {
      throw new Error('Constraint group not found');
    }

    const query = `
      DELETE FROM constraint_stock_overrides 
      WHERE constraint_group_id = $1 AND stock_symbol = $2
    `;

    const result = await pool.query(query, [constraintId, stockSymbol.toUpperCase()]);
    return (result.rowCount ?? 0) > 0;
  }

  static async addStockToGroup(constraintId: string, userId: string, stockSymbol: string): Promise<boolean> {
    // First verify the constraint group belongs to the user
    const groupExists = await pool.query(
      'SELECT id FROM constraint_groups WHERE id = $1 AND user_id = $2',
      [constraintId, userId]
    );

    if (groupExists.rows.length === 0) {
      throw new Error('Constraint group not found');
    }

    const upperStockSymbol = stockSymbol.toUpperCase();

    // Check if stock is already in the group
    const existingStock = await pool.query(
      'SELECT id FROM constraint_stocks WHERE constraint_group_id = $1 AND stock_symbol = $2',
      [constraintId, upperStockSymbol]
    );

    if (existingStock.rows.length > 0) {
      throw new Error('Stock is already in this group');
    }

    // Add the stock to the constraint_stocks table
    const query = `
      INSERT INTO constraint_stocks (constraint_group_id, stock_symbol)
      VALUES ($1, $2)
    `;

    await pool.query(query, [constraintId, upperStockSymbol]);
    return true;
  }

  static async removeStockFromGroup(constraintId: string, userId: string, stockSymbol: string): Promise<boolean> {
    // First verify the constraint group belongs to the user
    const groupExists = await pool.query(
      'SELECT id FROM constraint_groups WHERE id = $1 AND user_id = $2',
      [constraintId, userId]
    );

    if (groupExists.rows.length === 0) {
      throw new Error('Constraint group not found');
    }

    const upperStockSymbol = stockSymbol.toUpperCase();

    // Remove the stock from the constraint_stocks table
    const query = `
      DELETE FROM constraint_stocks 
      WHERE constraint_group_id = $1 AND stock_symbol = $2
    `;

    const result = await pool.query(query, [constraintId, upperStockSymbol]);

    // Also remove any stock-specific overrides for this stock
    await pool.query(
      'DELETE FROM constraint_stock_overrides WHERE constraint_group_id = $1 AND stock_symbol = $2',
      [constraintId, upperStockSymbol]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async delete(constraintId: string, userId: string): Promise<boolean> {
    const query = `DELETE FROM constraint_groups WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [constraintId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToConstraintGroup(row: any): ConstraintGroupWithIds {
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