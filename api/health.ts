import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { executeQuery } from './lib/database';

async function healthHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const testQuery = 'SELECT NOW() as current_time, version() as db_version';
    const result = await executeQuery(testQuery);
    
    console.log('Database test result:', result.rows[0]);
    
    // Test if our tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'constraints', 'constraint_groups', 'stock_groups')
      ORDER BY table_name
    `;
    
    const tablesResult = await executeQuery(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('Existing tables:', existingTables);
    
    // Test constraint groups data
    const constraintGroupsQuery = 'SELECT id, name, stocks FROM constraint_groups LIMIT 5';
    const constraintGroupsResult = await executeQuery(constraintGroupsQuery);
    
    console.log('Sample constraint groups:', constraintGroupsResult.rows);
    
    res.status(200).json({
      success: true,
      data: {
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version
        },
        tables: {
          existing: existingTables,
          required: ['users', 'constraints', 'constraint_groups', 'stock_groups']
        },
        sampleData: {
          constraintGroups: constraintGroupsResult.rows
        }
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

export default withCors(healthHandler);