import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function dashboardHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock dashboard data
    res.status(200).json({
      success: true,
      message: 'Dashboard API working',
      data: {
        portfolio: {
          totalValue: 10000,
          totalGainLoss: 500,
          totalGainLossPercent: 5.0,
          positions: []
        },
        constraints: [],
        constraintGroups: [],
        recentTrades: [],
        alerts: []
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(dashboardHandler);