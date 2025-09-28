import { Router } from 'express';
import { BacktestController } from '../controllers/backtestController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, backtestSchema } from '../middleware/validation';

const router = Router();

// All backtest routes require authentication
router.use(authenticateToken);

// Backtest operations
router.post('/run', validateRequest(backtestSchema), BacktestController.runBacktest);
router.post('/compare-market', BacktestController.compareToMarket);
router.post('/run-multiple', BacktestController.runMultipleBacktests);

// Backtest management
router.get('/history', BacktestController.getBacktestHistory);
router.post('/validate', BacktestController.validateBacktestParameters);

export default router;