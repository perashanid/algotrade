import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from '../src/config/database';
import { requestLogger } from '../src/middleware/logger';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';
import routes from '../src/routes';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Initialize database connection (for serverless, this happens on each request)
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export for Vercel
export default app;