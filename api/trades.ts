import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { requireAuth } from './lib/auth';
import { executeQuery } from './lib/database';

async function tradesHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Handle different trade endpoints based on query parameters
      const { type } = req.query;
      
      if (type === 'closed-positions') {
        // Get closed positions
        res.status(200).json({
          success: true,
          data: [] // Empty for now - will be populated when trade tracking is implemented
        });
        return;
      }

      // Default: get all trades
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trades API error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export default withCors(tradesHandler);