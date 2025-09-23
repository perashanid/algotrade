const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testNewDatabase() {
    try {
        console.log('🔗 Testing new database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        const client = await pool.connect();
        console.log('✅ New database connected successfully!');
        
        // Check if any tables exist
        console.log('🔍 Checking existing tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log(`📊 Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        if (tablesResult.rows.length === 0) {
            console.log('📝 Database is empty - needs migration');
        }
        
        client.release();
        console.log('✅ Database test completed!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

testNewDatabase();