const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
    try {
        console.log('Running database migration...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'database/migrations/add_individual_stock_constraints.sql'), 
            'utf8'
        );
        
        const client = await pool.connect();
        
        // Execute the migration
        await client.query(migrationSQL);
        console.log('✅ Migration executed successfully!');
        
        // Verify the table was created
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'constraint_stock_overrides'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ constraint_stock_overrides table created successfully!');
        } else {
            console.log('❌ Table was not created');
        }
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

runMigration();