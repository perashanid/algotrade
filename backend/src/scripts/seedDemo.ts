import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

async function seedDemoUser() {
  try {
    console.log('🌱 Seeding demo user...');

    // Check if demo user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@algotrader.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Demo user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create demo user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, name`,
      ['demo@algotrader.com', hashedPassword, 'Demo User']
    );

    console.log('✅ Demo user created:', result.rows[0]);
    console.log('📧 Email: demo@algotrader.com');
    console.log('🔑 Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
    process.exit(1);
  }
}

seedDemoUser();
