import { pool } from '../config/database';

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positionCount: number;
  timestamp: Date;
}

export class PortfolioHistoryModel {
  static async createSnapshot(userId: string, totalValue: number, totalGainLoss: number, totalGainLossPercent: number, positionCount: number): Promise<PortfolioSnapshot> {
    const query = `
      INSERT INTO portfolio_history (user_id, total_value, total_gain_loss, total_gain_loss_percent, position_count, timestamp)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, user_id, total_value, total_gain_loss, total_gain_loss_percent, position_count, timestamp
    `;
    
    const result = await pool.query(query, [userId, totalValue, totalGainLoss, totalGainLossPercent, positionCount]);
    return this.mapRowToSnapshot(result.rows[0]);
  }

  static async getHistoricalData(userId: string, timeRange: '7d' | '30d' | '90d' | '1y'): Promise<PortfolioSnapshot[]> {
    let interval: string;
    let limit: number;
    
    switch (timeRange) {
      case '7d':
        interval = '1 hour';
        limit = 168; // 7 days * 24 hours
        break;
      case '30d':
        interval = '4 hours';
        limit = 180; // 30 days * 6 intervals per day
        break;
      case '90d':
        interval = '12 hours';
        limit = 180; // 90 days * 2 intervals per day
        break;
      case '1y':
        interval = '1 day';
        limit = 365;
        break;
      default:
        interval = '1 hour';
        limit = 168;
    }

    const query = `
      WITH time_series AS (
        SELECT generate_series(
          CURRENT_TIMESTAMP - INTERVAL '${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '1 year'}',
          CURRENT_TIMESTAMP,
          INTERVAL '${interval}'
        ) AS time_bucket
      ),
      latest_snapshots AS (
        SELECT DISTINCT ON (time_bucket) 
          ts.time_bucket,
          ph.id,
          ph.user_id,
          ph.total_value,
          ph.total_gain_loss,
          ph.total_gain_loss_percent,
          ph.position_count,
          ph.timestamp
        FROM time_series ts
        LEFT JOIN portfolio_history ph ON ph.user_id = $1 
          AND ph.timestamp <= ts.time_bucket
        ORDER BY ts.time_bucket, ph.timestamp DESC NULLS LAST
      )
      SELECT * FROM latest_snapshots 
      WHERE id IS NOT NULL
      ORDER BY time_bucket
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows.map(row => this.mapRowToSnapshot(row));
  }

  static async getLatestSnapshot(userId: string): Promise<PortfolioSnapshot | null> {
    const query = `
      SELECT id, user_id, total_value, total_gain_loss, total_gain_loss_percent, position_count, timestamp
      FROM portfolio_history
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? this.mapRowToSnapshot(result.rows[0]) : null;
  }

  static async cleanupOldSnapshots(retentionDays: number = 365): Promise<void> {
    const query = `
      DELETE FROM portfolio_history
      WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '${retentionDays} days'
    `;
    
    await pool.query(query);
  }

  private static mapRowToSnapshot(row: any): PortfolioSnapshot {
    return {
      id: row.id,
      userId: row.user_id,
      totalValue: parseFloat(row.total_value),
      totalGainLoss: parseFloat(row.total_gain_loss),
      totalGainLossPercent: parseFloat(row.total_gain_loss_percent),
      positionCount: parseInt(row.position_count),
      timestamp: row.timestamp
    };
  }
}