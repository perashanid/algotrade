import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function optimizedConstraintsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock optimized constraints data
    res.status(200).json({
      success: true,
      message: 'Optimized Constraints API working',
      data: {
        constraintPositions: [],
        groupSummary: [],
        totalPositions: 0,
        totalWatching: 0,
        totalValue: 0,
        totalUnrealizedPnl: 0
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(optimizedConstraintsHandler);