import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function portfolioHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Portfolio API working',
      data: {
        totalValue: 10000,
        totalGainLoss: 500,
        totalGainLossPercent: 5.0,
        positions: [] // Empty array - frontend expects this format
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(portfolioHandler);