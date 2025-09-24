import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../utils/cors';

async function closedPositionsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock closed positions data in the expected format
    res.status(200).json({
      success: true,
      message: 'Closed Positions API working',
      data: [] // Empty array for now - will be populated when connected to database
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(closedPositionsHandler);