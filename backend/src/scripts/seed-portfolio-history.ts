import { pool } from '../config/database';
import { PortfolioHistoryModel } from '../models/PortfolioHistory';

async function seedPortfolioHistory() {
  try {
    console.log('🌱 Seeding portfolio history data...');
    
    // Get all users
    const usersResult = await pool.query('SELECT id FROM users LIMIT 5');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('⚠️  No users found, skipping seed');
      return;
    }
    
    // Create historical data for each user
    for (const user of users) {
      const userId = user.id;
      console.log(`📊 Creating history for user: ${userId}`);
      
      // Create 30 days of historical data
      const now = new Date();
      let totalValue = 10000; // Starting value
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Simulate some market movement
        const change = (Math.random() - 0.5) * 500; // Random change between -250 and +250
        totalValue += change;
        
        const totalGainLoss = totalValue - 10000;
        const totalGainLossPercent = (totalGainLoss / 10000) * 100;
        const positionCount = Math.floor(Math.random() * 10) + 5; // 5-15 positions
        
        // Insert historical snapshot
        await pool.query(`
          INSERT INTO portfolio_history (user_id, total_value, total_gain_loss, total_gain_loss_percent, position_count, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, totalValue, totalGainLoss, totalGainLossPercent, positionCount, date]);
      }
    }
    
    console.log('✅ Portfolio history seeding completed');
    
    // Show summary
    const countResult = await pool.query('SELECT COUNT(*) as count FROM portfolio_history');
    console.log(`📈 Total historical records created: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedPortfolioHistory();