const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createStockPricesTable() {
  try {
    console.log('🔄 Creating stock_prices table...');
    
    // Create stock prices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_prices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        symbol VARCHAR(10) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        change_amount DECIMAL(10,2),
        change_percent DECIMAL(5,2),
        volume BIGINT,
        market_cap BIGINT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol)
      );
    `);
    
    console.log('✅ stock_prices table created');
    
    // Add indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
      CREATE INDEX IF NOT EXISTS idx_stock_prices_last_updated ON stock_prices(last_updated);
    `);
    
    console.log('✅ Indexes created');
    
    // Insert sample data
    await pool.query(`
      INSERT INTO stock_prices (symbol, price, change_amount, change_percent, volume, market_cap)
      VALUES 
        ('AAPL', 175.50, 2.30, 1.33, 45000000, 2800000000000),
        ('MSFT', 380.25, -1.75, -0.46, 28000000, 2850000000000),
        ('GOOGL', 140.80, 3.20, 2.32, 32000000, 1750000000000),
        ('AMZN', 145.60, 0.85, 0.59, 38000000, 1500000000000),
        ('TSLA', 245.30, -5.20, -2.08, 85000000, 780000000000),
        ('NVDA', 485.75, 12.40, 2.62, 42000000, 1200000000000),
        ('META', 325.90, 4.15, 1.29, 25000000, 825000000000),
        ('NFLX', 445.20, -2.80, -0.62, 15000000, 195000000000),
        ('AMD', 125.40, 1.90, 1.54, 55000000, 202000000000),
        ('CRM', 220.75, 3.45, 1.59, 18000000, 215000000000)
      ON CONFLICT (symbol) 
      DO UPDATE SET 
        price = EXCLUDED.price,
        change_amount = EXCLUDED.change_amount,
        change_percent = EXCLUDED.change_percent,
        volume = EXCLUDED.volume,
        market_cap = EXCLUDED.market_cap,
        last_updated = CURRENT_TIMESTAMP;
    `);
    
    console.log('✅ Sample stock prices inserted');
    console.log('🎉 Stock prices setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createStockPricesTable();