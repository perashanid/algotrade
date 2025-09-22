import { Router } from 'express';
import { SystemController } from '../controllers/systemController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public health check
router.get('/health', SystemController.getHealthCheck);

// Protected system routes
router.use(authenticateToken);

router.get('/status', SystemController.getSystemStatus);
router.post('/trigger/constraints', SystemController.triggerConstraintEvaluation);
router.post('/trigger/prices', SystemController.triggerPriceUpdate);

export default router;