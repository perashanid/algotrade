import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';

async function constraintGroupsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock constraint groups data in the expected format
    res.status(200).json({
      success: true,
      message: 'Constraint Groups API working',
      data: [] // Empty array for now - will be populated when connected to database
    });
    return;
  }

  if (req.method === 'POST') {
    // Handle creating new constraint group
    res.status(200).json({
      success: true,
      message: 'Constraint group created (mock)',
      data: {
        id: 'mock-group-' + Date.now(),
        name: req.body?.name || 'New Group',
        description: req.body?.description || '',
        isActive: true,
        stocks: req.body?.stocks || [],
        stockGroups: req.body?.stockGroups || [],
        buyTriggerPercent: req.body?.buyTriggerPercent || -5,
        sellTriggerPercent: req.body?.sellTriggerPercent || 10,
        profitTriggerPercent: req.body?.profitTriggerPercent || 15,
        buyAmount: req.body?.buyAmount || 1000,
        sellAmount: req.body?.sellAmount || 1000,
        stockOverrides: req.body?.stockOverrides || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(constraintGroupsHandler);