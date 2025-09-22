import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env'), override: false });

// Override DATABASE_URL if it's still pointing to localhost
if (process.env.DATABASE_URL?.includes('localhost')) {
  process.env.DATABASE_URL = 'postgresql://test_ndo2_user:vAOUnFxDqVJxnNQLVuXGMaQhdABHqQqV@dpg-d358vt33fgac73b8tv5g-a.singapore-postgres.render.com/test_ndo2';
}

const defaultStockGroups = [
  {
    name: 'Technology Giants',
    description: 'Major technology companies and FAANG stocks',
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'ORCL', 'CRM', 'ADBE', 'INTC', 'AMD', 'PYPL', 'UBER']
  },
  {
    name: 'Retail & Consumer',
    description: 'Retail chains and consumer goods companies',
    stocks: ['WMT', 'TGT', 'COST', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD', 'DIS', 'PG', 'KO', 'PEP', 'UNP', 'V', 'MA']
  },
  {
    name: 'Energy & Oil',
    description: 'Oil companies and energy sector stocks',
    stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'VLO', 'PSX', 'OXY', 'BKR', 'HAL', 'DVN', 'FANG', 'MRO', 'APA']
  },
  {
    name: 'Automotive',
    description: 'Car manufacturers and automotive industry',
    stocks: ['TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'NKLA', 'GOEV', 'RIDE', 'WKHS', 'HYLN', 'FSR', 'ARVL']
  },
  {
    name: 'Banking & Finance',
    description: 'Major banks and financial institutions',
    stocks: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'COF', 'AXP', 'BLK', 'SCHW', 'CB', 'AIG', 'BK', 'STT', 'NTRS', 'RF', 'KEY']
  },
  {
    name: 'Healthcare & Pharma',
    description: 'Healthcare and pharmaceutical companies',
    stocks: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY', 'LLY', 'AMGN', 'GILD', 'CVS', 'MDT', 'ISRG']
  },
  {
    name: 'Legacy Blue Chips',
    description: 'Established dividend-paying companies with long history',
    stocks: ['IBM', 'GE', 'T', 'VZ', 'MMM', 'CAT', 'BA', 'DD', 'HON', 'WBA', 'CVS', 'XOM', 'PG', 'JNJ', 'KO', 'MO', 'PM', 'SO', 'D', 'NEE']
  },
  {
    name: 'Dividend Aristocrats',
    description: 'Companies with 25+ years of consecutive dividend increases',
    stocks: ['KO', 'PG', 'JNJ', 'MMM', 'CAT', 'MCD', 'WMT', 'CVX', 'XOM', 'IBM', 'GE', 'T', 'VZ', 'MO', 'PM', 'SO', 'D', 'NEE', 'O', 'ABBV']
  },
  {
    name: 'Industrial Legacy',
    description: 'Traditional industrial and manufacturing companies',
    stocks: ['GE', 'CAT', 'MMM', 'HON', 'UTX', 'BA', 'DE', 'EMR', 'ITW', 'ETN', 'DOV', 'ROK', 'PH', 'CMI', 'IR', 'FLR', 'JCI', 'TXT', 'LMT', 'NOC']
  },
  {
    name: 'Utilities & Infrastructure',
    description: 'Electric utilities and infrastructure companies',
    stocks: ['SO', 'D', 'NEE', 'DUK', 'AEP', 'EXC', 'SRE', 'PEG', 'ED', 'XEL', 'WEC', 'ES', 'ETR', 'FE', 'PPL', 'CMS', 'DTE', 'NI', 'LNT', 'ATO']
  },
  {
    name: 'Aerospace & Defense',
    description: 'Aerospace, defense, and industrial companies',
    stocks: ['BA', 'LMT', 'RTX', 'NOC', 'GD', 'LHX', 'TXT', 'HON', 'UTX', 'CAT', 'DE', 'EMR', 'ETN', 'ITW', 'MMM']
  },
  {
    name: 'Telecommunications',
    description: 'Telecom and communication service providers',
    stocks: ['VZ', 'T', 'TMUS', 'CHTR', 'CMCSA', 'DIS', 'NFLX', 'GOOGL', 'META', 'S', 'CTL', 'FTR', 'WIN', 'SHEN', 'LUMN']
  },
  {
    name: 'Real Estate & REITs',
    description: 'Real estate investment trusts and property companies',
    stocks: ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'EXR', 'AVB', 'EQR', 'DLR', 'WELL', 'VTR', 'ESS', 'MAA', 'UDR', 'CPT']
  },
  {
    name: 'Classic Consumer Brands',
    description: 'Iconic consumer brands with decades of history',
    stocks: ['KO', 'PEP', 'PG', 'JNJ', 'MCD', 'SBUX', 'NKE', 'DIS', 'MO', 'PM', 'CL', 'KMB', 'GIS', 'K', 'CPB', 'CAG', 'HSY', 'MKC', 'SJM', 'HRL']
  },
  {
    name: 'Traditional Retail',
    description: 'Established brick-and-mortar retail chains',
    stocks: ['WMT', 'TGT', 'COST', 'HD', 'LOW', 'KSS', 'M', 'JWN', 'DKS', 'BBY', 'GPS', 'ANF', 'AEO', 'URBN', 'TJX', 'ROST', 'DLTR', 'DG', 'FDO', 'KR']
  },
  {
    name: 'Old Economy Stocks',
    description: 'Traditional economy companies from pre-internet era',
    stocks: ['GE', 'IBM', 'XOM', 'CVX', 'CAT', 'MMM', 'BA', 'UTX', 'HON', 'DD', 'DOW', 'EMR', 'ITW', 'ETN', 'PH', 'CMI', 'IR', 'ROK', 'DOV', 'FLR']
  }
];

async function seedStockGroups() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('🌱 Starting stock groups seeding...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    console.log('🌐 Using external database:', process.env.DATABASE_URL?.includes('render.com') ? 'Yes' : 'No');
    
    // Test connection first
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    client.release();

    // Get all users to create default stock groups for each
    console.log('👥 Getting all users...');
    const usersResult = await pool.query('SELECT id FROM users');
    console.log(`✅ Found ${usersResult.rows.length} users`);

    // Insert default stock groups for each user
    console.log('📊 Creating default stock groups for all users...');
    
    for (const user of usersResult.rows) {
      console.log(`👤 Creating groups for user: ${user.id}`);
      
      for (const group of defaultStockGroups) {
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          
          // Create the stock group (skip if already exists)
          const groupResult = await client.query(`
            INSERT INTO stock_groups (user_id, name, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, name) DO NOTHING
            RETURNING id
          `, [user.id, group.name, group.description]);
          
          if (groupResult.rows.length > 0) {
            const groupId = groupResult.rows[0].id;
            
            // Add stocks to the group
            for (const stock of group.stocks) {
              await client.query(`
                INSERT INTO stock_group_members (group_id, stock_symbol)
                VALUES ($1, $2)
                ON CONFLICT (group_id, stock_symbol) DO NOTHING
              `, [groupId, stock.toUpperCase()]);
            }
            
            console.log(`✅ Created "${group.name}" with ${group.stocks.length} stocks for user ${user.id}`);
          } else {
            console.log(`⏭️ Skipped "${group.name}" (already exists) for user ${user.id}`);
          }
          
          await client.query('COMMIT');
          
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`❌ Failed to create "${group.name}" for user ${user.id}:`, error);
          throw error;
        } finally {
          client.release();
        }
      }
    }

    console.log('🎉 Stock groups seeding completed successfully!');
    console.log(`📈 Created ${defaultStockGroups.length} default stock groups`);
    console.log('📋 Available groups:');
    defaultStockGroups.forEach(group => {
      console.log(`   - ${group.name} (${group.stocks.length} stocks)`);
    });
    
  } catch (error) {
    console.error('❌ Stock groups seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedStockGroups()
    .then(() => {
      console.log('🌟 Stock groups seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Stock groups seeding process failed:', error);
      process.exit(1);
    });
}

export { seedStockGroups };