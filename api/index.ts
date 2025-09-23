import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  // Health check
  if (req.url === '/api/health') {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    return;
  }

  // Default response
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.url,
    method: req.method
  });
}