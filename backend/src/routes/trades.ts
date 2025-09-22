import { Router } from 'express';
import { TradeHistoryController } from '../controllers/tradeHistoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All trade history routes require authentication
router.use(authenticateToken);

// Trade history endpoints
router.get('/', TradeHistoryController.getTradeHistory);
router.get('/constraint/:constraintId', TradeHistoryController.getTradesByConstraint);
router.get('/statistics', TradeHistoryController.getTradeStatistics);
router.get('/analytics', TradeHistoryController.getTradeAnalytics);
router.get('/performance-by-symbol', TradeHistoryController.getTradingPerformanceBySymbol);

// Export functionality
router.get('/export', TradeHistoryController.exportTradeHistory);

export default router;