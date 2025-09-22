import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All portfolio routes require authentication
router.use(authenticateToken);

// Portfolio overview
router.get('/', PortfolioController.getPortfolio);
router.get('/summary', PortfolioController.getPortfolioSummary);
router.get('/performance', PortfolioController.getPerformance);

// Position management
router.get('/positions', PortfolioController.getPositions);
router.get('/positions/:symbol', PortfolioController.getPosition);
router.post('/positions', PortfolioController.updatePosition);
router.delete('/positions/:symbol', PortfolioController.deletePosition);

// Utility endpoints
router.post('/refresh-prices', PortfolioController.refreshPrices);

export default router;