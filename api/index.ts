import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple test function first
export default async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;

  // Health check
  if (url === '/api/health') {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    return;
  }

  // Auth routes
  if (url?.startsWith('/api/auth/')) {
    if (url === '/api/auth/register' && method === 'POST') {
      res.json({
        success: true,
        message: 'Register endpoint working',
        data: { test: true }
      });
      return;
    }

    if (url === '/api/auth/login' && method === 'POST') {
      res.json({
        success: true,
        message: 'Login endpoint working',
        data: { test: true }
      });
      return;
    }
  }

  // Default response
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    url,
    method
  });
};