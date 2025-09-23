# Design Document

## Overview

This design addresses the performance bottlenecks identified in the trading platform by implementing comprehensive database optimization, intelligent caching strategies, query optimization, and frontend data management improvements. The solution focuses on reducing database round trips, implementing efficient caching layers, optimizing query patterns, and improving frontend data fetching strategies.

## Architecture

### Current Performance Issues Identified

1. **N+1 Query Problems**: The `constraintPositionsService.getConstraintPositions()` method makes sequential API calls and database queries
2. **Inefficient Price Updates**: Individual price updates for each position instead of batch operations
3. **Redundant Data Fetching**: Frontend components make duplicate API calls for the same data
4. **Missing Query Optimization**: No use of database joins, aggregations, or prepared statements
5. **Inadequate Caching**: Limited caching strategy with basic memory cache implementation
6. **Sequential API Calls**: Frontend makes sequential instead of parallel API requests

### Proposed Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ React Query │ │◄──►│ │ Cache Layer │ │◄──►│ │ Optimized   │ │
│ │ + Batching  │ │    │ │ (Redis-like)│ │    │ │ Queries     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Optimistic  │ │    │ │ Query       │ │    │ │ Connection  │ │
│ │ Updates     │ │    │ │ Optimizer   │ │    │ │ Pool        │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components and Interfaces

### 1. Enhanced Caching Layer

**CacheService Interface**
```typescript
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  mget<T>(keys: string[]): Promise<Map<string, T>>;
  mset<T>(entries: Map<string, T>, ttl?: number): Promise<void>;
}
```

**Implementation Strategy**:
- Extend current memory cache with Redis-compatible interface
- Implement cache invalidation strategies
- Add cache warming for frequently accessed data
- Support batch operations for multiple cache entries

### 2. Query Optimization Service

**OptimizedQueryService Interface**
```typescript
interface OptimizedQueryService {
  getPortfolioWithPositions(userId: string): Promise<Portfolio>;
  getConstraintPositionsBatch(userId: string): Promise<ConstraintPosition[]>;
  updatePricesBatch(updates: PriceUpdate[]): Promise<void>;
  getAggregatedGroupData(userId: string): Promise<GroupSummary[]>;
}
```

**Key Optimizations**:
- Single query with JOINs for related data
- Batch operations for price updates
- Database-level aggregations
- Prepared statement caching

### 3. Frontend Data Management

**Enhanced React Query Configuration**
```typescript
interface DataManagerConfig {
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  batchRequests: boolean;
}
```

**Batching Strategy**:
- Combine multiple API requests into single calls
- Implement request deduplication
- Use optimistic updates for immediate UI feedback

### 4. Database Connection Optimization

**Enhanced Pool Configuration**
```typescript
interface PoolConfig {
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
}
```

## Data Models

### 1. Optimized Portfolio Query Model

```sql
-- Single query to get portfolio with all related data
WITH portfolio_positions AS (
  SELECT 
    p.user_id,
    p.stock_symbol,
    p.quantity,
    p.average_cost,
    p.current_price,
    p.quantity * COALESCE(p.current_price, p.average_cost) as market_value,
    (p.quantity * COALESCE(p.current_price, p.average_cost)) - (p.quantity * p.average_cost) as unrealized_pnl
  FROM positions p
  WHERE p.user_id = $1 AND p.quantity > 0
),
portfolio_summary AS (
  SELECT 
    user_id,
    SUM(market_value) as total_value,
    SUM(unrealized_pnl) as total_gain_loss,
    COUNT(*) as position_count
  FROM portfolio_positions
  GROUP BY user_id
)
SELECT * FROM portfolio_positions, portfolio_summary;
```

### 2. Constraint Positions Batch Query

```sql
-- Single query to get all constraint positions with group data
SELECT 
  c.id as constraint_id,
  c.stock_symbol,
  c.buy_trigger_percent,
  c.sell_trigger_percent,
  c.profit_trigger_percent,
  c.buy_amount,
  c.sell_amount,
  c.is_active,
  'individual' as constraint_type,
  p.quantity,
  p.average_cost,
  p.current_price,
  COALESCE(p.quantity * p.current_price, 0) as market_value
FROM constraints c
LEFT JOIN positions p ON c.stock_symbol = p.stock_symbol AND c.user_id = p.user_id
WHERE c.user_id = $1

UNION ALL

SELECT 
  cg.id as constraint_id,
  unnest(cg.all_stocks) as stock_symbol,
  cg.buy_trigger_percent,
  cg.sell_trigger_percent,
  cg.profit_trigger_percent,
  cg.buy_amount,
  cg.sell_amount,
  cg.is_active,
  'group' as constraint_type,
  p.quantity,
  p.average_cost,
  p.current_price,
  COALESCE(p.quantity * p.current_price, 0) as market_value
FROM constraint_groups cg
LEFT JOIN positions p ON unnest(cg.all_stocks) = p.stock_symbol AND cg.user_id = p.user_id
WHERE cg.user_id = $1;
```

### 3. Cache Key Strategy

```typescript
const CacheKeys = {
  portfolio: (userId: string) => `portfolio:${userId}`,
  constraintPositions: (userId: string) => `constraint_positions:${userId}`,
  stockPrice: (symbol: string) => `stock_price:${symbol}`,
  groupSummary: (userId: string) => `group_summary:${userId}`,
  marketData: (symbol: string) => `market_data:${symbol}`,
} as const;
```

## Error Handling

### 1. Database Connection Resilience

```typescript
class DatabaseErrorHandler {
  static async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    // Implement exponential backoff retry logic
  }
  
  static async handleConnectionError(error: Error): Promise<void> {
    // Log error, attempt reconnection, notify monitoring
  }
}
```

### 2. Cache Fallback Strategy

```typescript
class CacheErrorHandler {
  static async getWithFallback<T>(
    key: string, 
    fallbackFn: () => Promise<T>
  ): Promise<T> {
    // Try cache first, fallback to database if cache fails
  }
}
```

### 3. API Rate Limiting

```typescript
class RateLimitHandler {
  static async handleRateLimit(error: AxiosError): Promise<void> {
    // Implement exponential backoff for API rate limits
  }
}
```

## Testing Strategy

### 1. Performance Testing

**Load Testing Scenarios**:
- Concurrent user portfolio loading
- Batch price update operations
- Cache hit/miss ratio testing
- Database connection pool stress testing

**Benchmarking Targets**:
- Dashboard load time: < 2 seconds
- API response time: < 500ms for cached data
- Database query time: < 100ms for optimized queries
- Cache hit ratio: > 80% for frequently accessed data

### 2. Integration Testing

**Database Optimization Tests**:
```typescript
describe('Database Performance', () => {
  test('portfolio query executes in under 100ms', async () => {
    const startTime = Date.now();
    await PortfolioService.getOptimizedPortfolio(userId);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100);
  });
});
```

**Cache Performance Tests**:
```typescript
describe('Cache Performance', () => {
  test('cache hit returns data in under 10ms', async () => {
    // Test cache performance
  });
});
```

### 3. Frontend Performance Testing

**React Query Testing**:
```typescript
describe('Frontend Data Management', () => {
  test('batched requests reduce API calls by 70%', async () => {
    // Test request batching effectiveness
  });
});
```

### 4. Monitoring and Metrics

**Performance Metrics Collection**:
- Query execution times
- Cache hit/miss ratios
- API response times
- Database connection pool utilization
- Frontend render times

**Alerting Thresholds**:
- Query time > 200ms
- Cache hit ratio < 70%
- API response time > 1000ms
- Database connection pool > 80% utilization

## Implementation Phases

### Phase 1: Database Query Optimization
- Implement optimized queries with JOINs
- Add batch operations for price updates
- Optimize database connection pool configuration

### Phase 2: Enhanced Caching Layer
- Extend memory cache with batch operations
- Implement cache invalidation strategies
- Add cache warming for critical data

### Phase 3: Frontend Optimization
- Implement React Query with batching
- Add optimistic updates
- Optimize component re-rendering

### Phase 4: Monitoring and Performance Tuning
- Add comprehensive performance monitoring
- Implement alerting for performance degradation
- Fine-tune cache TTL and database pool settings