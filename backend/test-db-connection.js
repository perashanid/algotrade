const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        const client = await pool.connect();
        console.log('✅ Database connected successfully!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW()');
        console.log('✅ Query test successful:', result.rows[0]);
        
        // Check if our tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📋 Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log('  -', row.table_name);
        });
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testConnection();