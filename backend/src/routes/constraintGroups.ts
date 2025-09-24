import { Router } from 'express';
import { ConstraintGroupController } from '../controllers/ConstraintGroupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/constraint-groups - Get all constraint groups for user
router.get('/', ConstraintGroupController.getConstraintGroups);

// POST /api/constraint-groups - Create new constraint group
router.post('/', ConstraintGroupController.createConstraintGroup);

// PUT /api/constraint-groups/:id - Update constraint group
router.put('/:id', ConstraintGroupController.updateConstraintGroup);

// PUT /api/constraint-groups/:id/toggle - Toggle constraint group active status
router.put('/:id/toggle', ConstraintGroupController.toggleConstraintGroup);

// POST /api/constraint-groups/:id/stocks - Add stock to group
router.post('/:id/stocks', ConstraintGroupController.addStockToGroup);

// PUT /api/constraint-groups/:id/stocks/:stockSymbol - Update individual stock constraint
router.put('/:id/stocks/:stockSymbol', ConstraintGroupController.updateStockConstraint);

// DELETE /api/constraint-groups/:id/stocks/:stockSymbol - Remove individual stock constraint override
router.delete('/:id/stocks/:stockSymbol', ConstraintGroupController.removeStockConstraint);

// DELETE /api/constraint-groups/:id/stocks/:stockSymbol/remove - Remove stock from group
router.delete('/:id/stocks/:stockSymbol/remove', ConstraintGroupController.removeStockFromGroup);

// DELETE /api/constraint-groups/:id - Delete constraint group
router.delete('/:id', ConstraintGroupController.deleteConstraintGroup);

export default router;