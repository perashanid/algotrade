import { Router } from 'express';
import { OptimizedConstraintController } from '../controllers/optimizedConstraintController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get optimized constraint positions
router.get('/positions', OptimizedConstraintController.getConstraintPositions);

// Get optimized group summary
router.get('/groups/summary', OptimizedConstraintController.getGroupSummary);

// Get combined dashboard data (most efficient for dashboard)
router.get('/dashboard', OptimizedConstraintController.getDashboardData);

// Refresh cache
router.post('/cache/refresh', OptimizedConstraintController.refreshCache);

export default router;