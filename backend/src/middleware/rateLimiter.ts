import rateLimit from 'express-rate-limit';
import { APIResponse } from '../types';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    },
    timestamp: new Date()
  } as APIResponse<null>,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.'
    },
    timestamp: new Date()
  } as APIResponse<null>,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Market data rate limiter (more lenient)
export const marketDataLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: {
    success: false,
    error: {
      code: 'MARKET_DATA_RATE_LIMIT_EXCEEDED',
      message: 'Too many market data requests, please try again later.'
    },
    timestamp: new Date()
  } as APIResponse<null>,
});