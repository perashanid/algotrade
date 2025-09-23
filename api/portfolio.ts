import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Portfolio API working',
      data: { 
        note: 'This is a placeholder. Connect to your database for full functionality.',
        portfolio: {
          totalValue: 10000,
          totalGainLoss: 500,
          totalGainLossPercent: 5.0,
          positions: []
        }
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}