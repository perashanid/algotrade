# 📊 Price Tracking Timeframe Explained

## Answer: **REAL-TIME / INTRADAY (Minute-by-Minute)**

Your trading system tracks prices in **real-time** during market hours, checking every minute.

## How It Works

### 1. Price Monitoring Schedule

From `backend/src/jobs/priceMonitor.ts`:

```typescript
// Constraint evaluation - EVERY MINUTE during market hours
cron.schedule('* * * * *', async () => {
  await ConstraintEvaluatorService.evaluateAllConstraints();
});

// Portfolio price updates - EVERY 5 MINUTES during market hours
cron.schedule('*/5 * * * *', async () => {
  await PortfolioService.updateAllPositionPrices();
});
```

### 2. What Gets Checked

**Every Minute:**
- ✅ Current stock prices
- ✅ Your buy triggers (-5% drops)
- ✅ Your sell triggers (+5% rises from YOUR buy price)
- ✅ Your profit triggers (+1% profit)

**Every 5 Minutes:**
- ✅ Portfolio value updates
- ✅ Position valuations
- ✅ Unrealized P&L calculations

## Timeframe: **INTRADAY (1-Minute Intervals)**

### What This Means:

Your system is tracking **intraday price movements**, not daily/weekly/monthly charts.

```
Chart Type: 1-Minute Candles
Frequency: Every 60 seconds
Timeframe: Intraday (same day)
```

### Example Timeline:

```
9:30 AM: Market opens, price = $100
9:31 AM: Check price = $99.50 (-0.5%)
9:32 AM: Check price = $99.00 (-1%)
9:33 AM: Check price = $98.50 (-1.5%)
9:34 AM: Check price = $98.00 (-2%)
9:35 AM: Check price = $97.50 (-2.5%)
...
10:00 AM: Check price = $95.00 (-5%) → BUY TRIGGER! 🎯
10:01 AM: You bought at $95
10:02 AM: Check price = $95.50 (+0.53% from $95)
10:03 AM: Check price = $96.00 (+1.05% from $95) → PROFIT TRIGGER! 🎯
```

## Data Source

From `backend/src/services/MarketDataService.ts`:

### Primary Source: **Finnhub API**
- Real-time stock quotes
- Updated continuously during market hours
- Professional-grade market data

### API Endpoint:
```
GET https://finnhub.io/api/v1/quote?symbol=AAPL
```

### Response (Real-Time Quote):
```json
{
  "c": 150.25,  // Current price (what we use)
  "h": 151.50,  // High of the day
  "l": 149.00,  // Low of the day
  "o": 150.00,  // Open price
  "pc": 149.50, // Previous close
  "t": 1234567890 // Timestamp
}
```

## Price Comparison Logic

### How Percentage Changes Are Calculated:

```typescript
// Get current price (real-time)
const currentPrice = await MarketDataService.getCurrentPrice(symbol);

// Get your position (your buy price)
const position = await PortfolioService.getPositionBySymbol(userId, symbol);

// Calculate profit from YOUR buy price
const profitPercent = ((currentPrice - position.averageCost) / position.averageCost) * 100;

// Check triggers
if (profitPercent >= +5%) {
  // SELL TRIGGER - price rose 5% from YOUR buy price
}

if (profitPercent >= +1%) {
  // PROFIT TRIGGER - you have 1% profit
}
```

## Chart Comparison

### What Your System Uses: ✅
```
Timeframe: 1-Minute
Type: Real-time quotes
Frequency: Every 60 seconds
Use Case: Intraday trading
```

### What Your System Does NOT Use: ❌
```
❌ Daily charts (1 candle per day)
❌ Weekly charts (1 candle per week)
❌ Monthly charts (1 candle per month)
❌ End-of-day prices only
```

## Market Hours

### When It Runs:

```typescript
const marketStatus = await MarketDataService.getMarketStatus();

if (!marketStatus.isOpen) {
  console.log('Market is closed, skipping');
  return;
}
```

**Active During:**
- Monday - Friday
- 9:30 AM - 4:00 PM EST (US Market Hours)
- Pre-market and after-hours: Not monitored

**Inactive During:**
- Weekends
- Market holidays
- Outside trading hours

## Real-World Example

### Scenario: Apple Stock (AAPL)

```
Your Settings:
- Buy: -5%
- Sell: +5%
- Profit: +1%

Timeline (Intraday):
9:30 AM: $150.00 (market open)
9:45 AM: $148.50 (-1%)
10:00 AM: $147.00 (-2%)
10:15 AM: $145.50 (-3%)
10:30 AM: $144.00 (-4%)
10:45 AM: $142.50 (-5%) → BUY TRIGGER! 🎯
        You buy at $142.50

11:00 AM: $143.00 (+0.35% from $142.50)
11:15 AM: $143.50 (+0.70% from $142.50)
11:30 AM: $144.00 (+1.05% from $142.50) → PROFIT TRIGGER! 🎯
        You sell at $144.00
        Profit: $1.50 per share (+1.05%)

Total time in position: 45 minutes
```

## Advantages of Intraday Tracking

### ✅ Pros:
1. **Fast Reactions**: Catch opportunities within minutes
2. **Intraday Profits**: Make money same-day
3. **Quick Exits**: Exit bad positions quickly
4. **Multiple Trades**: Can trade same stock multiple times per day
5. **Real-Time**: Always up-to-date with current prices

### ⚠️ Considerations:
1. **More Active**: Requires monitoring during market hours
2. **More Trades**: Can generate more transactions
3. **Intraday Volatility**: Prices can swing quickly
4. **Day Trading Rules**: Be aware of pattern day trader rules (4+ day trades in 5 days)

## Comparison to Other Timeframes

### If It Were Daily Charts:
```
❌ Would only check once per day at market close
❌ Would miss intraday opportunities
❌ Slower to react to price changes
❌ Example: Buy at $95 on Monday, sell at $100 on Tuesday
```

### Current System (1-Minute):
```
✅ Checks every minute during market hours
✅ Catches intraday opportunities
✅ Fast reaction to price changes
✅ Example: Buy at $95 at 10:45 AM, sell at $96 at 11:30 AM
```

## Summary

### Your System Tracks:
- **Timeframe**: 1-Minute intervals (intraday)
- **Frequency**: Every 60 seconds during market hours
- **Data Source**: Finnhub real-time quotes
- **Chart Type**: Real-time price feed (not daily/weekly/monthly candles)
- **Trading Style**: Intraday / Day Trading
- **Speed**: Very fast - can enter and exit positions within minutes

### Perfect For:
- ✅ Quick profits (1-5% gains)
- ✅ Intraday trading
- ✅ Fast reactions to price movements
- ✅ Multiple trades per day
- ✅ Active trading during market hours

### Not Designed For:
- ❌ Long-term holding (weeks/months)
- ❌ End-of-day only trading
- ❌ Swing trading (multi-day positions)
- ❌ Position trading (weeks/months)

## Configuration

If you want to change the monitoring frequency, edit `backend/src/jobs/priceMonitor.ts`:

```typescript
// Current: Every minute
cron.schedule('* * * * *', ...)

// Every 5 minutes:
cron.schedule('*/5 * * * *', ...)

// Every 15 minutes:
cron.schedule('*/15 * * * *', ...)

// Every hour:
cron.schedule('0 * * * *', ...)
```

**Note:** More frequent = faster reactions but more API calls
**Note:** Less frequent = slower reactions but fewer API calls

---

**Bottom Line:** Your system is a **real-time intraday trading system** that checks prices every minute and can execute trades within minutes of triggers being met. It's designed for fast, active trading during market hours! 🚀
