import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false }
    : false,
});

async function seedDemoUser() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting demo user seeding...');
    
    // Demo user credentials
    const demoUser = {
      email: 'demo@algotrader.com',
      password: 'demo123'
    };
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(demoUser.password, 12);
    
    // Check if demo user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [demoUser.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Demo user already exists');
      const userId = existingUser.rows[0].id;
      await seedDemoData(client, userId);
      return;
    }
    
    // Create demo user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [demoUser.email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Demo user created with ID: ${userId}`);
    
    // Seed demo data
    await seedDemoData(client, userId);
    
    console.log('🎉 Demo user and data seeded successfully!');
    console.log('📧 Email: demo@algotrader.com');
    console.log('🔑 Password: demo123');
    
  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function seedDemoData(client: any, userId: string) {
  console.log('🌱 Seeding demo data...');
  
  // Create demo constraints (matching the actual schema)
  const constraints = [
    {
      stock_symbol: 'AAPL',
      buy_trigger_percent: -5.00,
      sell_trigger_percent: 10.00,
      profit_trigger_percent: 15.00,
      buy_amount: 1000.00,
      sell_amount: 500.00,
      is_active: true
    },
    {
      stock_symbol: 'GOOGL',
      buy_trigger_percent: -7.00,
      sell_trigger_percent: 12.00,
      profit_trigger_percent: 20.00,
      buy_amount: 1500.00,
      sell_amount: 750.00,
      is_active: true
    },
    {
      stock_symbol: 'MSFT',
      buy_trigger_percent: -4.00,
      sell_trigger_percent: 8.00,
      profit_trigger_percent: 12.00,
      buy_amount: 2000.00,
      sell_amount: 1000.00,
      is_active: true
    }
  ];
  
  for (const constraint of constraints) {
    await client.query(
      `INSERT INTO constraints (user_id, stock_symbol, buy_trigger_percent, sell_trigger_percent, profit_trigger_percent, buy_amount, sell_amount, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [userId, constraint.stock_symbol, constraint.buy_trigger_percent, constraint.sell_trigger_percent, constraint.profit_trigger_percent, constraint.buy_amount, constraint.sell_amount, constraint.is_active]
    );
  }
  
  // No demo positions - positions will be created when constraints trigger trades
  
  // No demo trade history - trades will be created when constraints are triggered
  
  console.log('✅ Demo data seeded successfully');
}

// Run the seeder if called directly
if (require.main === module) {
  seedDemoUser()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDemoUser };