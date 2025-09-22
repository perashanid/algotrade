import { pool } from '../config/database';
import { Position } from '../types';

export class PositionModel {
  static async findByUserId(userId: string): Promise<Position[]> {
    const query = `
      SELECT id, user_id, stock_symbol, quantity, average_cost, current_price, last_updated
      FROM positions
      WHERE user_id = $1
      ORDER BY stock_symbol
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToPosition(row));
  }

  static async findByUserIdAndSymbol(userId: string, stockSymbol: string): Promise<Position | null> {
    const query = `
      SELECT id, user_id, stock_symbol, quantity, average_cost, current_price, last_updated
      FROM positions
      WHERE user_id = $1 AND stock_symbol = $2
    `;
    
    const result = await pool.query(query, [userId, stockSymbol.toUpperCase()]);
    return result.rows[0] ? this.mapRowToPosition(result.rows[0]) : null;
  }

  static async upsert(userId: string, stockSymbol: string, quantity: number, price: number): Promise<Position> {
    const existingPosition = await this.findByUserIdAndSymbol(userId, stockSymbol);
    
    if (existingPosition) {
      // Update existing position - calculate new average cost
      const totalValue = (existingPosition.quantity * existingPosition.averageCost) + (quantity * price);
      const newQuantity = existingPosition.quantity + quantity;
      const newAverageCost = newQuantity !== 0 ? totalValue / newQuantity : 0;
      
      const query = `
        UPDATE positions
        SET quantity = $1, average_cost = $2, current_price = $3, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = $4 AND stock_symbol = $5
        RETURNING id, user_id, stock_symbol, quantity, average_cost, current_price, last_updated
      `;
      
      const result = await pool.query(query, [newQuantity, newAverageCost, price, userId, stockSymbol.toUpperCase()]);
      return this.mapRowToPosition(result.rows[0]);
    } else {
      // Create new position
      const query = `
        INSERT INTO positions (user_id, stock_symbol, quantity, average_cost, current_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, stock_symbol, quantity, average_cost, current_price, last_updated
      `;
      
      const result = await pool.query(query, [userId, stockSymbol.toUpperCase(), quantity, price, price]);
      return this.mapRowToPosition(result.rows[0]);
    }
  }

  static async updateCurrentPrice(userId: string, stockSymbol: string, currentPrice: number): Promise<void> {
    const query = `
      UPDATE positions
      SET current_price = $1, last_updated = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND stock_symbol = $3
    `;
    
    await pool.query(query, [currentPrice, userId, stockSymbol.toUpperCase()]);
  }

  static async updateAllCurrentPrices(priceUpdates: { symbol: string; price: number }[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const update of priceUpdates) {
        const query = `
          UPDATE positions
          SET current_price = $1, last_updated = CURRENT_TIMESTAMP
          WHERE stock_symbol = $2
        `;
        
        await client.query(query, [update.price, update.symbol.toUpperCase()]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(userId: string, stockSymbol: string): Promise<boolean> {
    const query = `
      DELETE FROM positions
      WHERE user_id = $1 AND stock_symbol = $2
    `;
    
    const result = await pool.query(query, [userId, stockSymbol.toUpperCase()]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getAllUniqueSymbols(): Promise<string[]> {
    const query = `
      SELECT DISTINCT stock_symbol
      FROM positions
      WHERE quantity > 0
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => row.stock_symbol);
  }

  private static mapRowToPosition(row: any): Position {
    return {
      id: row.id,
      userId: row.user_id,
      stockSymbol: row.stock_symbol,
      quantity: parseFloat(row.quantity),
      averageCost: parseFloat(row.average_cost),
      currentPrice: row.current_price ? parseFloat(row.current_price) : undefined,
      lastUpdated: row.last_updated
    };
  }
}