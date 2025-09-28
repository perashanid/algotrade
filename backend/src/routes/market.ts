import { Router } from 'express';
import { MarketController } from '../controllers/marketController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All market data routes require authentication
router.use(authenticateToken);

// Market data endpoints
router.get('/quote/:symbol', MarketController.getQuote);
router.get('/history/:symbol', MarketController.getHistoricalData);
router.get('/benchmark', MarketController.getBenchmark);
router.get('/status', MarketController.getMarketStatus);
router.get('/validate/:symbol', MarketController.validateSymbol);

// Batch operations
router.post('/quotes', MarketController.getMultipleQuotes);

export default router;