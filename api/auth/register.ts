import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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