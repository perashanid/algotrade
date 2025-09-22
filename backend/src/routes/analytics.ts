import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Performance analytics
router.get('/performance', AnalyticsController.getPerformanceMetrics);
router.get('/performance/history', AnalyticsController.getPerformanceHistory);
router.get('/performance/vs-benchmark', AnalyticsController.getPortfolioVsBenchmark);

// Position analytics
router.get('/positions/top-performers', AnalyticsController.getTopPerformers);
router.get('/positions/worst-performers', AnalyticsController.getWorstPerformers);

// Constraint analytics
router.get('/constraints/analysis', AnalyticsController.getConstraintAnalysis);

// Trade analytics
router.get('/trades/statistics', AnalyticsController.getTradeStatistics);
router.get('/trades/export', AnalyticsController.exportTradeHistory);

// Dashboard
router.get('/dashboard', AnalyticsController.getAnalyticsDashboard);

export default router;