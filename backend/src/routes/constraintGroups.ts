import { Router } from 'express';
import { ConstraintGroupController } from '../controllers/constraintGroupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/constraint-groups - Get all constraint groups for user
router.get('/', ConstraintGroupController.getConstraintGroups);

// POST /api/constraint-groups - Create new constraint group
router.post('/', ConstraintGroupController.createConstraintGroup);

// PUT /api/constraint-groups/:id/toggle - Toggle constraint group active status
router.put('/:id/toggle', ConstraintGroupController.toggleConstraintGroup);

// DELETE /api/constraint-groups/:id - Delete constraint group
router.delete('/:id', ConstraintGroupController.deleteConstraintGroup);

export default router;