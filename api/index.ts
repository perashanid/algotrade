import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
  // Automatic CORS handling - no manual configuration needed!
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  // Allow requests from the same domain (Vercel app) or localhost for development
  if (origin) {
    if (origin.includes('vercel.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        (host && origin.includes(host))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    // If no origin header, allow same-domain requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path from the request URL
  const path = req.url || '';
  console.log('API Request:', { method: req.method, path, headers: req.headers });

  // Health check
  if (path === '/api/health' || path === '/health') {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    return;
  }

  // Auth routes
  if (path.includes('/auth/')) {
    if ((path === '/api/auth/login' || path === '/auth/login') && req.method === 'POST') {
      res.status(200).json({
        success: true,
        message: 'Login endpoint working',
        data: { 
          note: 'This is a placeholder. Connect to your database for full functionality.',
          token: 'demo-token',
          user: { id: '1', email: 'demo@example.com' }
        }
      });
      return;
    }

    if ((path === '/api/auth/register' || path === '/auth/register') && req.method === 'POST') {
      res.status(200).json({
        success: true,
        message: 'Register endpoint working',
        data: { 
          note: 'This is a placeholder. Connect to your database for full functionality.',
          token: 'demo-token',
          user: { id: '1', email: 'demo@example.com' }
        }
      });
      return;
    }
  }

  // Portfolio routes
  if (path.includes('/portfolio')) {
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

  // Constraints routes
  if (path.includes('/constraints')) {
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

  // Market data routes
  if (path.includes('/market')) {
    res.status(200).json({
      success: true,
      message: 'Market data API working',
      data: { 
        note: 'This is a placeholder. Connect to your database for full functionality.',
        marketData: {}
      }
    });
    return;
  }

  // Default response for unmatched routes
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${path}`,
      availableEndpoints: [
        'GET /api/health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/portfolio',
        'GET /api/constraints',
        'GET /api/market'
      ]
    },
    timestamp: new Date().toISOString()
  });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
}