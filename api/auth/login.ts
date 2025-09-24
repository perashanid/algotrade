import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../utils/cors';

async function loginHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.status(200).json({
      success: true,
      message: 'Login endpoint working',
      data: { 
        note: 'This is a placeholder. Connect to your database for full functionality.',
        token: 'demo-token-' + Date.now(),
        user: { 
          id: '1', 
          email: req.body?.email || 'demo@example.com' 
        }
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(loginHandler);