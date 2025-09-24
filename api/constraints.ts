import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function constraintsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Constraints API working',
      data: { 
        note: 'This is a placeholder. Connect to your database for full functionality.',
        constraints: []
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(constraintsHandler);