import { pool } from '../config/database';
import { TradeHistory } from '../types';

export class TradeHistoryModel {
  static async create(
    userId: string,
    constraintId: string | null,
    stockSymbol: string,
    tradeType: 'BUY' | 'SELL',
    triggerType: 'PRICE_DROP' | 'PRICE_RISE' | 'PROFIT_TARGET',
    quantity: number,
    price: number,
    triggerPrice: number
  ): Promise<TradeHistory> {
    const query = `
      INSERT INTO trade_history (
        user_id, constraint_id, stock_symbol, trade_type, trigger_type,
        quantity, price, trigger_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, constraint_id, stock_symbol, trade_type, trigger_type,
                quantity, price, trigger_price, executed_at
    `;
    
    const values = [
      userId,
      constraintId,
      stockSymbol.toUpperCase(),
      tradeType,
      triggerType,
      quantity,
      price,
      triggerPrice
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToTradeHistory(result.rows[0]);
  }

  static async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<TradeHistory[]> {
    const query = `
      SELECT id, user_id, constraint_id, stock_symbol, trade_type, trigger_type,
             quantity, price, trigger_price, executed_at
      FROM trade_history
      WHERE user_id = $1
      ORDER BY executed_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(row => this.mapRowToTradeHistory(row));
  }

  static async findByUserIdAndSymbol(userId: string, stockSymbol: string): Promise<TradeHistory[]> {
    const query = `
      SELECT id, user_id, constraint_id, stock_symbol, trade_type, trigger_type,
             quantity, price, trigger_price, executed_at
      FROM trade_history
      WHERE user_id = $1 AND stock_symbol = $2
      ORDER BY executed_at DESC
    `;
    
    const result = await pool.query(query, [userId, stockSymbol.toUpperCase()]);
    return result.rows.map(row => this.mapRowToTradeHistory(row));
  }

  static async findByConstraintId(constraintId: string): Promise<TradeHistory[]> {
    const query = `
      SELECT id, user_id, constraint_id, stock_symbol, trade_type, trigger_type,
             quantity, price, trigger_price, executed_at
      FROM trade_history
      WHERE constraint_id = $1
      ORDER BY executed_at DESC
    `;
    
    const result = await pool.query(query, [constraintId]);
    return result.rows.map(row => this.mapRowToTradeHistory(row));
  }

  static async getTradeStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalTrades: number;
    buyTrades: number;
    sellTrades: number;
    totalVolume: number;
    avgTradeSize: number;
  }> {
    let query = `
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN trade_type = 'BUY' THEN 1 END) as buy_trades,
        COUNT(CASE WHEN trade_type = 'SELL' THEN 1 END) as sell_trades,
        SUM(quantity * price) as total_volume,
        AVG(quantity * price) as avg_trade_size
      FROM trade_history
      WHERE user_id = $1
    `;
    
    const values: any[] = [userId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND executed_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND executed_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      totalTrades: parseInt(row.total_trades) || 0,
      buyTrades: parseInt(row.buy_trades) || 0,
      sellTrades: parseInt(row.sell_trades) || 0,
      totalVolume: parseFloat(row.total_volume) || 0,
      avgTradeSize: parseFloat(row.avg_trade_size) || 0
    };
  }

  static async exportToCSV(userId: string, startDate?: Date, endDate?: Date): Promise<string> {
    let query = `
      SELECT stock_symbol, trade_type, trigger_type, quantity, price, trigger_price, executed_at
      FROM trade_history
      WHERE user_id = $1
    `;
    
    const values: any[] = [userId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND executed_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND executed_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }
    
    query += ` ORDER BY executed_at DESC`;
    
    const result = await pool.query(query, values);
    
    // Create CSV content
    const headers = ['Symbol', 'Type', 'Trigger', 'Quantity', 'Price', 'Trigger Price', 'Date'];
    let csv = headers.join(',') + '\n';
    
    for (const row of result.rows) {
      const csvRow = [
        row.stock_symbol,
        row.trade_type,
        row.trigger_type,
        row.quantity,
        row.price,
        row.trigger_price,
        row.executed_at.toISOString()
      ];
      csv += csvRow.join(',') + '\n';
    }
    
    return csv;
  }

  private static mapRowToTradeHistory(row: any): TradeHistory {
    return {
      id: row.id,
      userId: row.user_id,
      constraintId: row.constraint_id,
      stockSymbol: row.stock_symbol,
      tradeType: row.trade_type,
      triggerType: row.trigger_type,
      quantity: parseFloat(row.quantity),
      price: parseFloat(row.price),
      triggerPrice: parseFloat(row.trigger_price),
      executedAt: row.executed_at
    };
  }
}