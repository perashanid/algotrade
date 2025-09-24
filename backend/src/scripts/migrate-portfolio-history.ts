import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Starting portfolio history migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../../database/create_portfolio_history.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Portfolio history migration completed successfully');
    
    // Test the new table
    const testQuery = 'SELECT COUNT(*) FROM portfolio_history';
    const result = await pool.query(testQuery);
    console.log('📊 Portfolio history table created, current records:', result.rows[0].count);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();