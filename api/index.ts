import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import your existing routes
import authRoutes from '../backend/src/routes/auth';
import portfolioRoutes from '../backend/src/routes/portfolio';
import constraintRoutes from '../backend/src/routes/constraints';
import constraintGroupRoutes from '../backend/src/routes/constraintGroups';
import stockGroupRoutes from '../backend/src/routes/stockGroups';
import marketRoutes from '../backend/src/routes/market';
import analyticsRoutes from '../backend/src/routes/analytics';
import backtestRoutes from '../backend/src/routes/backtest';
import tradeRoutes from '../backend/src/routes/trades';
import systemRoutes from '../backend/src/routes/system';
import optimizedConstraintRoutes from '../backend/src/routes/optimizedConstraints';

// Import middleware
import { errorHandler } from '../backend/src/middleware/errorHandler';
import { logger } from '../backend/src/middleware/logger';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://localhost:3000'] // Uses FRONTEND_URL env variable
    : ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/constraint-groups', constraintGroupRoutes);
app.use('/api/stock-groups', stockGroupRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/optimized-constraints', optimizedConstraintRoutes);

// Error handling middleware
app.use(errorHandler);

// Export the Express app as a serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};