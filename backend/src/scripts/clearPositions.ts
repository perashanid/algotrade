import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function clearPositions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('🧹 Clearing existing positions and trade history...');
    
    const client = await pool.connect();
    
    // Clear positions and trade history for demo user
    await client.query('DELETE FROM positions WHERE user_id IN (SELECT id FROM users WHERE email = $1)', ['demo@algotrader.com']);
    await client.query('DELETE FROM trade_history WHERE user_id IN (SELECT id FROM users WHERE email = $1)', ['demo@algotrader.com']);
    
    console.log('✅ Positions and trade history cleared');
    console.log('📊 Now only constraint-based positions will be shown');
    
    client.release();
  } catch (error) {
    console.error('❌ Error clearing positions:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  clearPositions()
    .then(() => {
      console.log('✅ Cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

export { clearPositions };