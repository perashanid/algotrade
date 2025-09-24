import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function stockGroupsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock stock groups data in the expected format
    res.status(200).json({
      success: true,
      message: 'Stock Groups API working',
      data: [] // Empty array for now - will be populated when connected to database
    });
    return;
  }

  if (req.method === 'POST') {
    // Handle creating new stock group
    res.status(200).json({
      success: true,
      message: 'Stock group created (mock)',
      data: {
        id: 'mock-stock-group-' + Date.now(),
        userId: 'mock-user',
        name: req.body?.name || 'New Stock Group',
        description: req.body?.description || '',
        color: req.body?.color || '#3B82F6',
        stocks: req.body?.stocks || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(stockGroupsHandler);