import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function healthHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      cors: 'auto-configured'
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(healthHandler);