import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env'), override: false });

async function runMigrations() {
  // Create a new pool specifically for migration
  const migrationPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('🔄 Starting database migration...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    console.log('🌐 Using external database:', process.env.DATABASE_URL?.includes('render.com') ? 'Yes' : 'No');
    
    // Test connection first
    console.log('🔌 Testing database connection...');
    const client = await migrationPool.connect();
    console.log('✅ Database connection successful!');
    client.release();
    
    // Check for existing tables and drop them if they exist
    console.log('🧹 Cleaning up existing tables...');
    await migrationPool.query(`
      DROP TABLE IF EXISTS trade_history CASCADE;
      DROP TABLE IF EXISTS positions CASCADE;
      DROP TABLE IF EXISTS constraints CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✅ Existing tables cleaned up');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../database/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing SQL migration...');
    
    // Execute the SQL
    await migrationPool.query(sql);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - constraints');
    console.log('   - positions');
    console.log('   - trade_history');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await migrationPool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

export { runMigrations };