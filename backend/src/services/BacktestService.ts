import { MarketDataService } from './MarketDataService';
import { ConstraintService } from './ConstraintService';
import { BacktestResult, BacktestTrade, TradingConstraint, PriceData } from '../types';

export class BacktestService {
  static async runBacktest(
    constraintId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000
  ): Promise<BacktestResult> {
    try {
      // Get the constraint
      const constraint = await ConstraintService.getConstraintById(constraintId, userId);
      if (!constraint) {
        throw new Error('Constraint not found');
      }

      // Get historical data
      const historicalData = await MarketDataService.getHistoricalData(
        constraint.stockSymbol,
        startDate,
        endDate
      );

      if (historicalData.length < 2) {
        throw new Error('Insufficient historical data for backtesting');
      }

      // Run the backtest simulation
      const simulation = await this.simulateTrading(constraint, historicalData, initialCapital);

      return {
        constraintId,
        startDate,
        endDate,
        totalTrades: simulation.trades.length,
        successfulTrades: simulation.successfulTrades,
        totalReturn: simulation.totalReturn,
        totalReturnPercent: simulation.totalReturnPercent,
        maxDrawdown: simulation.maxDrawdown,
        sharpeRatio: simulation.sharpeRatio,
        trades: simulation.trades
      };
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  }

  static async compareToMarket(
    backtestResult: BacktestResult,
    benchmarkSymbol: string = 'SPY'
  ): Promise<{
    backtestReturn: number;
    marketReturn: number;
    outperformance: number;
    volatility: number;
    marketVolatility: number;
  }> {
    try {
      // Get benchmark data for the same period
      const benchmarkData = await MarketDataService.getHistoricalData(
        benchmarkSymbol,
        backtestResult.startDate,
        backtestResult.endDate
      );

      if (benchmarkData.length < 2) {
        throw new Error('Insufficient benchmark data');
      }

      const startPrice = benchmarkData[0].price;
      const endPrice = benchmarkData[benchmarkData.length - 1].price;
      const marketReturn = ((endPrice - startPrice) / startPrice) * 100;

      // Calculate volatilities
      const backtestVolatility = this.calculateVolatility(backtestResult.trades);
      const marketVolatility = this.calculateMarketVolatility(benchmarkData);

      return {
        backtestReturn: backtestResult.totalReturnPercent,
        marketReturn,
        outperformance: backtestResult.totalReturnPercent - marketReturn,
        volatility: backtestVolatility,
        marketVolatility
      };
    } catch (error) {
      console.error('Error comparing to market:', error);
      throw error;
    }
  }

  static async runMultipleBacktests(
    userId: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000
  ): Promise<BacktestResult[]> {
    try {
      const userConstraints = await ConstraintService.getUserConstraints(userId);
      const results: BacktestResult[] = [];

      for (const constraint of userConstraints) {
        try {
          const result = await this.runBacktest(
            constraint.id,
            userId,
            startDate,
            endDate,
            initialCapital
          );
          results.push(result);
        } catch (error) {
          console.error(`Error backtesting constraint ${constraint.id}:`, error);
          // Continue with other constraints
        }
      }

      return results;
    } catch (error) {
      console.error('Error running multiple backtests:', error);
      throw error;
    }
  }

  private static async simulateTrading(
    constraint: TradingConstraint,
    historicalData: PriceData[],
    initialCapital: number
  ): Promise<{
    trades: BacktestTrade[];
    successfulTrades: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    sharpeRatio: number;
  }> {
    const trades: BacktestTrade[] = [];
    let cash = initialCapital;
    let shares = 0;
    let portfolioValues: number[] = [];
    let previousPrice = historicalData[0].price;

    for (let i = 1; i < historicalData.length; i++) {
      const currentData = historicalData[i];
      const currentPrice = currentData.price;
      
      // Calculate price change percentage
      const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

      // Check for buy trigger (price drop)
      if (priceChangePercent <= -Math.abs(constraint.buyTriggerPercent) && cash >= constraint.buyAmount) {
        const sharesToBuy = Math.floor(constraint.buyAmount / currentPrice);
        const cost = sharesToBuy * currentPrice;
        
        if (cost <= cash) {
          cash -= cost;
          shares += sharesToBuy;
          
          trades.push({
            date: currentData.timestamp,
            type: 'BUY',
            price: currentPrice,
            quantity: sharesToBuy,
            triggerType: 'PRICE_DROP'
          });
        }
      }

      // Check for sell trigger (price rise)
      if (priceChangePercent >= constraint.sellTriggerPercent && shares > 0) {
        const sharesToSell = Math.min(
          Math.floor(constraint.sellAmount / currentPrice),
          shares
        );
        
        if (sharesToSell > 0) {
          const proceeds = sharesToSell * currentPrice;
          cash += proceeds;
          shares -= sharesToSell;
          
          trades.push({
            date: currentData.timestamp,
            type: 'SELL',
            price: currentPrice,
            quantity: sharesToSell,
            triggerType: 'PRICE_RISE'
          });
        }
      }

      // Check for profit trigger
      if (constraint.profitTriggerPercent && shares > 0) {
        // Calculate average cost basis
        const buyTrades = trades.filter(t => t.type === 'BUY');
        if (buyTrades.length > 0) {
          const totalCost = buyTrades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0);
          const totalShares = buyTrades.reduce((sum, trade) => sum + trade.quantity, 0);
          const avgCost = totalCost / totalShares;
          
          const profitPercent = ((currentPrice - avgCost) / avgCost) * 100;
          
          if (profitPercent >= constraint.profitTriggerPercent) {
            const proceeds = shares * currentPrice;
            cash += proceeds;
            
            trades.push({
              date: currentData.timestamp,
              type: 'SELL',
              price: currentPrice,
              quantity: shares,
              triggerType: 'PROFIT_TARGET'
            });
            
            shares = 0;
          }
        }
      }

      // Track portfolio value
      const portfolioValue = cash + (shares * currentPrice);
      portfolioValues.push(portfolioValue);
      
      previousPrice = currentPrice;
    }

    // Calculate final metrics
    const finalValue = cash + (shares * historicalData[historicalData.length - 1].price);
    const totalReturn = finalValue - initialCapital;
    const totalReturnPercent = (totalReturn / initialCapital) * 100;

    // Calculate successful trades (simplified: trades that resulted in profit)
    const successfulTrades = this.calculateSuccessfulTrades(trades);

    // Calculate max drawdown
    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues, initialCapital);

    // Calculate Sharpe ratio
    const sharpeRatio = this.calculateSharpeRatio(portfolioValues, initialCapital);

    return {
      trades,
      successfulTrades,
      totalReturn,
      totalReturnPercent,
      maxDrawdown,
      sharpeRatio
    };
  }

  private static calculateSuccessfulTrades(trades: BacktestTrade[]): number {
    // Group trades into buy-sell pairs
    let successfulTrades = 0;
    let position = 0;
    let avgCost = 0;
    let totalCost = 0;

    for (const trade of trades) {
      if (trade.type === 'BUY') {
        totalCost += trade.price * trade.quantity;
        position += trade.quantity;
        avgCost = position > 0 ? totalCost / position : 0;
      } else if (trade.type === 'SELL' && position > 0) {
        // Check if this sell was profitable
        if (trade.price > avgCost) {
          successfulTrades++;
        }
        
        // Update position
        const soldValue = trade.quantity * avgCost;
        totalCost -= soldValue;
        position -= trade.quantity;
        
        if (position <= 0) {
          position = 0;
          totalCost = 0;
          avgCost = 0;
        } else {
          avgCost = totalCost / position;
        }
      }
    }

    return successfulTrades;
  }

  private static calculateMaxDrawdown(portfolioValues: number[], initialCapital: number): number {
    let maxDrawdown = 0;
    let peak = initialCapital;

    for (const value of portfolioValues) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown * 100; // Return as percentage
  }

  private static calculateSharpeRatio(portfolioValues: number[], _initialCapital: number): number {
    if (portfolioValues.length < 2) return 0;

    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < portfolioValues.length; i++) {
      const dailyReturn = (portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1];
      returns.push(dailyReturn);
    }

    if (returns.length === 0) return 0;

    // Calculate average return and standard deviation
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Assume risk-free rate of 2% annually (convert to daily)
    const riskFreeRate = 0.02 / 252; // 252 trading days per year
    
    return (avgReturn - riskFreeRate) / stdDev;
  }

  private static calculateVolatility(trades: BacktestTrade[]): number {
    if (trades.length < 2) return 0;

    const returns: number[] = [];
    for (let i = 1; i < trades.length; i++) {
      const prevPrice = trades[i - 1].price;
      const currentPrice = trades[i].price;
      const dailyReturn = (currentPrice - prevPrice) / prevPrice;
      returns.push(dailyReturn);
    }

    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Return as percentage
  }

  private static calculateMarketVolatility(priceData: PriceData[]): number {
    if (priceData.length < 2) return 0;

    const returns: number[] = [];
    for (let i = 1; i < priceData.length; i++) {
      const prevPrice = priceData[i - 1].price;
      const currentPrice = priceData[i].price;
      const dailyReturn = (currentPrice - prevPrice) / prevPrice;
      returns.push(dailyReturn);
    }

    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Return as percentage
  }
}