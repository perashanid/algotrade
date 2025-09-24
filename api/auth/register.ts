import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../utils/cors';

async function registerHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.status(200).json({
      success: true,
      message: 'Register endpoint working',
      data: { 
        note: 'This is a placeholder. Connect to your database for full functionality.',
        token: 'demo-token-' + Date.now(),
        user: { 
          id: '2', 
          email: req.body?.email || 'newuser@example.com' 
        }
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(registerHandler);