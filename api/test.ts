import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function testHandler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'Test API endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    }
  });
}

export default withCors(testHandler);