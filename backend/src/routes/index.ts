import { Router } from 'express';
import authRoutes from './auth';
import constraintRoutes from './constraints';
import constraintGroupRoutes from './constraintGroups';
import stockGroupRoutes from './stockGroups';
import portfolioRoutes from './portfolio';
import marketRoutes from './market';
import analyticsRoutes from './analytics';
import backtestRoutes from './backtest';
import tradeRoutes from './trades';
import systemRoutes from './system';
import optimizedConstraintRoutes from './optimizedConstraints';
import { apiLimiter, authLimiter, marketDataLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting
router.use('/auth', authLimiter);
router.use('/market', marketDataLimiter);
router.use(apiLimiter); // Apply general rate limiting to all other routes

// Mount routes
router.use('/auth', authRoutes);
router.use('/constraints', constraintRoutes);
router.use('/constraint-groups', constraintGroupRoutes);
router.use('/stock-groups', stockGroupRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/market', marketRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/backtest', backtestRoutes);
router.use('/trades', tradeRoutes);
router.use('/system', systemRoutes);
router.use('/optimized-constraints', optimizedConstraintRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    },
    timestamp: new Date()
  });
});

export default router;