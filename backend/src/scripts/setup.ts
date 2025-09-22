import { runMigrations } from './migrate';
import { seedDemoUser } from './seedDemo';

async function setup() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Run migrations first
    console.log('📊 Running migrations...');
    await runMigrations();
    
    // Then seed demo data
    console.log('🌱 Seeding demo data...');
    await seedDemoUser();
    
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('🎉 You can now use the demo account:');
    console.log('📧 Email: demo@algotrader.com');
    console.log('🔑 Password: demo123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { setup };