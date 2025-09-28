import { Router } from 'express';
import { StockGroupController } from '../controllers/stockGroupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/stock-groups - Get all stock groups for user
router.get('/', StockGroupController.getStockGroups);

// POST /api/stock-groups - Create new stock group
router.post('/', StockGroupController.createStockGroup);

// PUT /api/stock-groups/:id - Update stock group
router.put('/:id', StockGroupController.updateStockGroup);

// DELETE /api/stock-groups/:id - Delete stock group
router.delete('/:id', StockGroupController.deleteStockGroup);

export default router;