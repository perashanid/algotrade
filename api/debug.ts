import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { authenticateUser } from './lib/auth';
import { executeQuery } from './lib/database';

async function debugHandler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Test database connection
      const dbTest = await executeQuery('SELECT NOW() as current_time');
      
      // Test authentication
      const user = authenticateUser(req);
      
      // Test constraints query
      let constraintsTest: any = null;
      if (user) {
        try {
          const constraintsResult = await executeQuery(
            'SELECT COUNT(*) as count FROM constraints WHERE user_id = $1',
            [user.id]
          );
          constraintsTest = constraintsResult.rows[0];
        } catch (error) {
          constraintsTest = { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      // Test constraint groups query
      let constraintGroupsTest: any = null;
      if (user) {
        try {
          const groupsResult = await executeQuery(
            'SELECT COUNT(*) as count FROM constraint_groups WHERE user_id = $1',
            [user.id]
          );
          constraintGroupsTest = groupsResult.rows[0];
        } catch (error) {
          constraintGroupsTest = { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      res.status(200).json({
        success: true,
        debug: {
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            currentTime: dbTest.rows[0].current_time
          },
          authentication: {
            hasAuthHeader: !!req.headers.authorization,
            user: user ? { id: user.id, email: user.email } : null
          },
          queries: {
            constraints: constraintsTest,
            constraintGroups: constraintGroupsTest
          },
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasDatabaseUrl: !!process.env.DATABASE_URL
          }
        }
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export default withCors(debugHandler);