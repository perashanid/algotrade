import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function migrateToV2() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('🔄 Starting V2 migration...');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful!');

    // Create new tables for V2 schema
    console.log('📊 Creating V2 tables...');
    
    await client.query(`
      -- Stock groups table
      CREATE TABLE IF NOT EXISTS stock_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );
    `);

    await client.query(`
      -- Stock group members table
      CREATE TABLE IF NOT EXISTS stock_group_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES stock_groups(id) ON DELETE CASCADE,
        stock_symbol VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, stock_symbol)
      );
    `);

    await client.query(`
      -- Enhanced constraints table
      CREATE TABLE IF NOT EXISTS constraint_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        buy_trigger_percent DECIMAL(5,2) NOT NULL,
        sell_trigger_percent DECIMAL(5,2) NOT NULL,
        profit_trigger_percent DECIMAL(5,2),
        buy_amount DECIMAL(10,2) NOT NULL,
        sell_amount DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      -- Constraint group stocks table (for individual stocks in a constraint)
      CREATE TABLE IF NOT EXISTS constraint_stocks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        constraint_group_id UUID REFERENCES constraint_groups(id) ON DELETE CASCADE,
        stock_symbol VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(constraint_group_id, stock_symbol)
      );
    `);

    await client.query(`
      -- Constraint group stock groups table (for entire stock groups in a constraint)
      CREATE TABLE IF NOT EXISTS constraint_stock_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        constraint_group_id UUID REFERENCES constraint_groups(id) ON DELETE CASCADE,
        stock_group_id UUID REFERENCES stock_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(constraint_group_id, stock_group_id)
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_groups_user_id ON stock_groups(user_id);
      CREATE INDEX IF NOT EXISTS idx_stock_group_members_group_id ON stock_group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_constraint_groups_user_id ON constraint_groups(user_id);
      CREATE INDEX IF NOT EXISTS idx_constraint_groups_active ON constraint_groups(is_active);
      CREATE INDEX IF NOT EXISTS idx_constraint_stocks_constraint_id ON constraint_stocks(constraint_group_id);
      CREATE INDEX IF NOT EXISTS idx_constraint_stock_groups_constraint_id ON constraint_stock_groups(constraint_group_id);
    `);

    // Add triggers for updated_at
    await client.query(`
      CREATE TRIGGER update_stock_groups_updated_at BEFORE UPDATE ON stock_groups
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_constraint_groups_updated_at BEFORE UPDATE ON constraint_groups
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create default stock groups
    console.log('🏷️ Creating default stock groups...');
    
    const defaultGroups = [
      {
        name: 'Technology',
        description: 'Major technology companies',
        color: '#3B82F6',
        stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX']
      },
      {
        name: 'Financial',
        description: 'Banking and financial services',
        color: '#10B981',
        stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK']
      },
      {
        name: 'Healthcare',
        description: 'Healthcare and pharmaceutical companies',
        color: '#F59E0B',
        stocks: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'CVS']
      },
      {
        name: 'Consumer',
        description: 'Consumer goods and retail',
        color: '#EF4444',
        stocks: ['WMT', 'PG', 'KO', 'PEP', 'NKE', 'MCD', 'SBUX', 'HD']
      },
      {
        name: 'Energy',
        description: 'Oil, gas and renewable energy',
        color: '#8B5CF6',
        stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'VLO', 'PSX']
      }
    ];

    // Get all users to create default groups for each
    const usersResult = await client.query('SELECT id FROM users');
    
    for (const user of usersResult.rows) {
      for (const group of defaultGroups) {
        // Create stock group
        const groupResult = await client.query(`
          INSERT INTO stock_groups (user_id, name, description, color)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, name) DO NOTHING
          RETURNING id
        `, [user.id, group.name, group.description, group.color]);

        if (groupResult.rows.length > 0) {
          const groupId = groupResult.rows[0].id;
          
          // Add stocks to the group
          for (const stock of group.stocks) {
            await client.query(`
              INSERT INTO stock_group_members (group_id, stock_symbol)
              VALUES ($1, $2)
              ON CONFLICT (group_id, stock_symbol) DO NOTHING
            `, [groupId, stock]);
          }
        }
      }
    }

    client.release();
    console.log('✅ V2 migration completed successfully!');
    console.log('📊 New tables created:');
    console.log('   - stock_groups');
    console.log('   - stock_group_members');
    console.log('   - constraint_groups');
    console.log('   - constraint_stocks');
    console.log('   - constraint_stock_groups');
    console.log('🏷️ Default stock groups created for all users');

  } catch (error) {
    console.error('❌ V2 migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToV2()
    .then(() => {
      console.log('🎉 V2 Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 V2 Migration process failed:', error);
      process.exit(1);
    });
}

export { migrateToV2 };