import axios from 'axios';
import { PriceData, BenchmarkData, FinnhubQuote, FinnhubCandle } from '../types';

export class MarketDataService {
  private static readonly FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';
  private static readonly API_KEY = process.env.FINNHUB_API_KEY;
  private static readonly CACHE_TTL = 60; // 60 seconds
  private static readonly BENCHMARK_CACHE_TTL = 300; // 5 minutes

  static async getCurrentPrice(stockSymbol: string): Promise<number> {
    try {
      if (!stockSymbol) {
        throw new Error('Stock symbol is required');
      }

      // Fetch from Finnhub API
      const response = await axios.get(`${this.FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: stockSymbol.toUpperCase(),
          token: this.API_KEY
        },
        timeout: 5000
      });

      const quote: FinnhubQuote = response.data;
      
      if (!quote.c || quote.c === 0) {
        throw new Error(`No price data available for ${stockSymbol}`);
      }

      return quote.c;
    } catch (error) {
      console.error(`Error fetching price for ${stockSymbol}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API key');
        }
      }
      
      throw new Error(`Failed to fetch price for ${stockSymbol}`);
    }
  }

  static async getPriceData(stockSymbol: string): Promise<PriceData> {
    try {
      const response = await axios.get(`${this.FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: stockSymbol.toUpperCase(),
          token: this.API_KEY
        },
        timeout: 5000
      });

      const quote: FinnhubQuote = response.data;
      
      if (!quote.c || quote.c === 0) {
        throw new Error(`No price data available for ${stockSymbol}`);
      }

      const priceData: PriceData = {
        symbol: stockSymbol.toUpperCase(),
        price: quote.c,
        timestamp: new Date(),
        volume: 0,
        change: quote.d,
        changePercent: quote.dp
      };

      return priceData;
    } catch (error) {
      console.error(`Error fetching price data for ${stockSymbol}:`, error);
      throw error;
    }
  }

  static async getHistoricalData(
    stockSymbol: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<PriceData[]> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const response = await axios.get(`${this.FINNHUB_BASE_URL}/stock/candle`, {
        params: {
          symbol: stockSymbol.toUpperCase(),
          resolution: 'D', // Daily resolution
          from: startTimestamp,
          to: endTimestamp,
          token: this.API_KEY
        },
        timeout: 10000
      });

      const candle: FinnhubCandle = response.data;
      
      if (candle.s !== 'ok' || !candle.c || candle.c.length === 0) {
        throw new Error(`No historical data available for ${stockSymbol}`);
      }

      const historicalData: PriceData[] = [];
      
      for (let i = 0; i < candle.c.length; i++) {
        historicalData.push({
          symbol: stockSymbol.toUpperCase(),
          price: candle.c[i],
          timestamp: new Date(candle.t[i] * 1000),
          volume: candle.v[i]
        });
      }

      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${stockSymbol}:`, error);
      throw error;
    }
  }

  static async getBenchmarkData(timeRange: string = '1D'): Promise<BenchmarkData> {
    try {
      // Use SPY ETF as S&P 500 proxy
      const response = await axios.get(`${this.FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: 'SPY',
          token: this.API_KEY
        },
        timeout: 5000
      });

      const quote: FinnhubQuote = response.data;
      
      if (!quote.c || quote.c === 0) {
        throw new Error('No benchmark data available');
      }

      const benchmarkData: BenchmarkData = {
        symbol: 'SPY',
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        timestamp: new Date()
      };

      // Cache the result
      return benchmarkData;
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      throw error;
    }
  }

  static async getMultiplePrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    const promises = symbols.map(async (symbol) => {
      try {
        const price = await this.getCurrentPrice(symbol);
        prices.set(symbol.toUpperCase(), price);
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        // Don't add to map if failed
      }
    });

    await Promise.allSettled(promises);
    return prices;
  }

  static async validateSymbol(stockSymbol: string): Promise<boolean> {
    try {
      const price = await this.getCurrentPrice(stockSymbol);
      return price > 0;
    } catch (error) {
      return false;
    }
  }

  static async getMarketStatus(): Promise<{ isOpen: boolean; nextOpen?: Date; nextClose?: Date }> {
    try {
      // Simple market hours check (NYSE: 9:30 AM - 4:00 PM ET, Mon-Fri)
      const now = new Date();
      const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      
      const day = easternTime.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = easternTime.getHours();
      const minute = easternTime.getMinutes();
      const currentTime = hour * 60 + minute; // Minutes since midnight
      
      const marketOpen = 9 * 60 + 30; // 9:30 AM
      const marketClose = 16 * 60; // 4:00 PM
      
      // Market is closed on weekends
      if (day === 0 || day === 6) {
        return { isOpen: false };
      }
      
      // Check if within market hours
      const isOpen = currentTime >= marketOpen && currentTime < marketClose;
      
      return { isOpen };
    } catch (error) {
      console.error('Error checking market status:', error);
      return { isOpen: false };
    }
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}