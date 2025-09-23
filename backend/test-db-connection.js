const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        const client = await pool.connect();
        console.log('✅ Connected to database successfully');
        
        // Test if tables exist
        const tables = ['constraint_groups', 'stock_groups', 'constraint_stocks', 'stock_group_members'];
        
        for (const table of tables) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`✅ Table ${table} exists with ${result.rows[0].count} rows`);
            } catch (error) {
                console.log(`❌ Table ${table} does not exist or has issues:`, error.message);
            }
        }
        
        client.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();