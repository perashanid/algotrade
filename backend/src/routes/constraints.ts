import { Router } from 'express';
import { ConstraintController } from '../controllers/constraintController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, createConstraintSchema, updateConstraintSchema } from '../middleware/validation';

const router = Router();

// All constraint routes require authentication
router.use(authenticateToken);

// Constraint CRUD operations
router.post('/', validateRequest(createConstraintSchema), ConstraintController.createConstraint);
router.get('/', ConstraintController.getConstraints);
router.get('/:id', ConstraintController.getConstraint);
router.put('/:id', validateRequest(updateConstraintSchema), ConstraintController.updateConstraint);
router.delete('/:id', ConstraintController.deleteConstraint);

// Toggle constraint active status
router.patch('/:id/toggle', ConstraintController.toggleConstraint);

export default router;