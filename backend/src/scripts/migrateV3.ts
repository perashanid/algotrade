import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateV3() {
  let client;
  
  try {
    console.log('🔄 Starting V3 migration...');
    
    client = await pool.connect();
    
    // Test connection
    await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    console.log('📊 Creating V3 tables and enhancements...');
    
    // Add stock prices table for real-time price data
    await client.query(`
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
    
    // Add indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
      CREATE INDEX IF NOT EXISTS idx_stock_prices_last_updated ON stock_prices(last_updated);
    `);
    
    // Add trigger to update last_updated timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_stock_price_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.last_updated = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_stock_prices_timestamp ON stock_prices;
      CREATE TRIGGER update_stock_prices_timestamp 
        BEFORE UPDATE ON stock_prices
        FOR EACH ROW EXECUTE FUNCTION update_stock_price_timestamp();
    `);
    
    // Insert some sample stock prices for testing
    await client.query(`
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
    
    console.log('✅ V3 migration completed successfully!');
    console.log('📊 New tables and features created:');
    console.log('   - stock_prices (real-time price data)');
    console.log('   - Sample stock prices inserted');
    console.log('   - Performance indexes added');
    console.log('🎉 V3 Migration process completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateV3().catch(console.error);
}

export default migrateV3;