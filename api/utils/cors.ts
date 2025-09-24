import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Smart CORS configuration for Vercel deployment
 * Automatically detects the deployment URL and sets appropriate CORS headers
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Determine allowed origins based on environment
  const allowedOrigins = getAllowedOrigins(req);
  
  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes('*') || 
    (origin && allowedOrigins.some(allowed => 
      allowed === origin || 
      (allowed.includes('*') && matchesWildcard(origin, allowed))
    ));
  
  // Set CORS headers
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Get allowed origins based on environment and request
 */
function getAllowedOrigins(req: VercelRequest): string[] {
  const { NODE_ENV, VERCEL_URL, VERCEL_BRANCH_URL } = process.env;
  
  // Development origins
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  // Production origins
  const prodOrigins: string[] = [];
  
  // Add Vercel URLs if available
  if (VERCEL_URL) {
    prodOrigins.push(`https://${VERCEL_URL}`);
  }
  
  if (VERCEL_BRANCH_URL) {
    prodOrigins.push(`https://${VERCEL_BRANCH_URL}`);
  }
  
  // Auto-detect from request headers
  const host = req.headers.host;
  if (host) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const autoDetectedUrl = `${protocol}://${host}`;
    if (!prodOrigins.includes(autoDetectedUrl)) {
      prodOrigins.push(autoDetectedUrl);
    }
  }
  
  // Add any custom domains from environment
  const customDomain = process.env.FRONTEND_URL;
  if (customDomain && !prodOrigins.includes(customDomain)) {
    prodOrigins.push(customDomain);
  }
  
  // Return appropriate origins based on environment
  if (NODE_ENV === 'development') {
    return [...devOrigins, ...prodOrigins];
  }
  
  // For production, be more restrictive
  return prodOrigins.length > 0 ? prodOrigins : ['*'];
}

/**
 * Check if origin matches wildcard pattern
 */
function matchesWildcard(origin: string, pattern: string): boolean {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return regex.test(origin);
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPrelight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Wrapper function to apply CORS to any API handler
 */
export function withCors(handler: (req: VercelRequest, res: VercelResponse) => void | Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Set CORS headers
    setCorsHeaders(req, res);
    
    // Handle preflight
    if (handleCorsPrelight(req, res)) {
      return;
    }
    
    // Call the actual handler
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };
}