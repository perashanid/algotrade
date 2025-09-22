import { Response } from 'express';
import { MarketDataService } from '../services/MarketDataService';
import { AuthRequest } from '../middleware/auth';
// import { APIResponse, PriceData, BenchmarkData } from '../types';

export class MarketController {
  static async getQuote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Stock symbol is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const priceData = await MarketDataService.getPriceData(symbol);

      res.json({
        success: true,
        data: priceData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get quote error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'API rate limit exceeded. Please try again later.'
            },
            timestamp: new Date()
          });
          return;
        }
        
        if (error.message.includes('No price data')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SYMBOL_NOT_FOUND',
              message: `No price data available for symbol: ${req.params.symbol}`
            },
            timestamp: new Date()
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'MARKET_DATA_ERROR',
          message: 'Failed to fetch market data'
        },
        timestamp: new Date()
      });
    }
  }

  static async getHistoricalData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Stock symbol is required'
          },
          timestamp: new Date()
        });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DATES',
            message: 'Start date and end date are required'
          },
          timestamp: new Date()
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATES',
            message: 'Invalid date format'
          },
          timestamp: new Date()
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE_RANGE',
            message: 'Start date must be before end date'
          },
          timestamp: new Date()
        });
        return;
      }

      const historicalData = await MarketDataService.getHistoricalData(symbol, start, end);

      res.json({
        success: true,
        data: historicalData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get historical data error:', error);
      
      if (error instanceof Error && error.message.includes('No historical data')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NO_HISTORICAL_DATA',
            message: `No historical data available for symbol: ${req.params.symbol}`
          },
          timestamp: new Date()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORICAL_DATA_ERROR',
          message: 'Failed to fetch historical data'
        },
        timestamp: new Date()
      });
    }
  }

  static async getBenchmark(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { timeRange } = req.query;
      const benchmarkData = await MarketDataService.getBenchmarkData(timeRange as string);

      res.json({
        success: true,
        data: benchmarkData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get benchmark error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BENCHMARK_DATA_ERROR',
          message: 'Failed to fetch benchmark data'
        },
        timestamp: new Date()
      });
    }
  }

  static async validateSymbol(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Stock symbol is required'
          },
          timestamp: new Date()
        });
        return;
      }

      const isValid = await MarketDataService.validateSymbol(symbol);

      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          isValid
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Validate symbol error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYMBOL_VALIDATION_ERROR',
          message: 'Failed to validate symbol'
        },
        timestamp: new Date()
      });
    }
  }

  static async getMarketStatus(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const marketStatus = await MarketDataService.getMarketStatus();

      res.json({
        success: true,
        data: marketStatus,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get market status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MARKET_STATUS_ERROR',
          message: 'Failed to fetch market status'
        },
        timestamp: new Date()
      });
    }
  }

  static async getMultipleQuotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { symbols } = req.body;
      
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SYMBOLS',
            message: 'Array of symbols is required'
          },
          timestamp: new Date()
        });
        return;
      }

      if (symbols.length > 50) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_SYMBOLS',
            message: 'Maximum 50 symbols allowed per request'
          },
          timestamp: new Date()
        });
        return;
      }

      const prices = await MarketDataService.getMultiplePrices(symbols);
      
      // Convert Map to object for JSON response
      const pricesObject = Object.fromEntries(prices);

      res.json({
        success: true,
        data: {
          prices: pricesObject,
          requestedCount: symbols.length,
          retrievedCount: prices.size
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get multiple quotes error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MULTIPLE_QUOTES_ERROR',
          message: 'Failed to fetch multiple quotes'
        },
        timestamp: new Date()
      });
    }
  }
}