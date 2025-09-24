import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Analytics endpoints
router.get('/portfolio-history', AnalyticsController.getPortfolioHistory);
router.get('/real-time', AnalyticsController.getRealTimeAnalytics);

// Trading endpoints
router.post('/buy', AnalyticsController.buyStock);
router.post('/sell', AnalyticsController.sellStock);

// Price endpoints
router.get('/price/:symbol', AnalyticsController.getCurrentPrice);

// Position endpoints
router.get('/position/:symbol', AnalyticsController.getPosition);

export default router;