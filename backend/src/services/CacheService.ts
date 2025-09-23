import { memoryCache } from '../config/database';
import { CacheStats } from '../types/performance';

// Cache key management with consistent naming conventions
export const CacheKeys = {
    // Portfolio related keys
    portfolio: (userId: string) => `portfolio:${userId}`,
    portfolioSummary: (userId: string) => `portfolio:summary:${userId}`,
    positions: (userId: string) => `positions:${userId}`,

    // Constraint related keys
    constraints: (userId: string) => `constraints:${userId}`,
    constraintGroups: (userId: string) => `constraint_groups:${userId}`,
    constraintPositions: (userId: string) => `constraint_positions:${userId}`,
    groupSummary: (userId: string) => `group_summary:${userId}`,

    // Market data keys
    stockPrice: (symbol: string) => `stock_price:${symbol.toUpperCase()}`,
    marketData: (symbol: string) => `market_data:${symbol.toUpperCase()}`,
    benchmarkData: (timeRange: string) => `benchmark:${timeRange}`,
    multiplePrices: (symbols: string[]) => `prices:${symbols.sort().join(',')}`,

    // User patterns for invalidation
    userPattern: (userId: string) => `*:${userId}*`,
    stockPattern: (symbol: string) => `*:${symbol.toUpperCase()}*`,
    portfolioPattern: (userId: string) => `portfolio*:${userId}*`,
    constraintPattern: (userId: string) => `constraint*:${userId}*`,
} as const;

// Cache TTL configurations (in seconds)
export const CacheTTL = {
    SHORT: 60,        // 1 minute - for frequently changing data
    MEDIUM: 300,      // 5 minutes - for moderately changing data
    LONG: 1800,       // 30 minutes - for rarely changing data
    VERY_LONG: 3600,  // 1 hour - for static data

    // Specific TTLs
    STOCK_PRICE: 60,          // Stock prices change frequently
    PORTFOLIO: 300,           // Portfolio data changes moderately
    CONSTRAINTS: 1800,        // Constraints change rarely
    MARKET_DATA: 300,         // Market data changes moderately
    BENCHMARK: 900,           // Benchmark data changes less frequently
} as const;

// Enhanced cache service with typed operations
export class CacheService {
    // Generic get with type safety
    static async get<T>(key: string): Promise<T | null> {
        try {
            const value = await memoryCache.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    // Generic set with type safety
    static async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            const serialized = JSON.stringify(value);
            await memoryCache.set(key, serialized, ttl);
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }

    // Batch get operations
    static async mget<T>(keys: string[]): Promise<Map<string, T>> {
        try {
            const results = await memoryCache.mget(keys);
            const parsed = new Map<string, T>();

            for (const [key, value] of results.entries()) {
                try {
                    parsed.set(key, JSON.parse(value));
                } catch (parseError) {
                    console.error(`Cache parse error for key ${key}:`, parseError);
                }
            }

            return parsed;
        } catch (error) {
            console.error('Cache mget error:', error);
            return new Map();
        }
    }

    // Batch set operations
    static async mset<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
        try {
            const serialized = new Map<string, string>();

            for (const [key, value] of entries.entries()) {
                serialized.set(key, JSON.stringify(value));
            }

            await memoryCache.mset(serialized, ttl);
        } catch (error) {
            console.error('Cache mset error:', error);
        }
    }

    // Delete single key
    static async del(key: string): Promise<void> {
        try {
            await memoryCache.del(key);
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
        }
    }

    // Pattern-based invalidation
    static async invalidate(pattern: string): Promise<number> {
        try {
            return await memoryCache.invalidate(pattern);
        } catch (error) {
            console.error(`Cache invalidation error for pattern ${pattern}:`, error);
            return 0;
        }
    }

    // Check if key exists
    static async exists(key: string): Promise<boolean> {
        try {
            return (await memoryCache.exists(key)) === 1;
        } catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    // Cache with fallback - try cache first, then fallback function
    static async getOrSet<T>(
        key: string,
        fallbackFn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        try {
            // Try to get from cache first
            const cached = await this.get<T>(key);
            if (cached !== null) {
                return cached;
            }

            // Cache miss - execute fallback function
            const result = await fallbackFn();

            // Store in cache for next time
            await this.set(key, result, ttl);

            return result;
        } catch (error) {
            console.error(`Cache getOrSet error for key ${key}:`, error);
            // If cache fails, still try to execute fallback
            return await fallbackFn();
        }
    }

    // Cache warming - preload data
    static async warm<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
        try {
            await this.mset(entries, ttl);
            console.log(`🔥 Cache warmed with ${entries.size} entries`);
        } catch (error) {
            console.error('Cache warming error:', error);
        }
    }

    // Invalidate user-specific cache entries
    static async invalidateUser(userId: string): Promise<number> {
        const pattern = CacheKeys.userPattern(userId);
        return await this.invalidate(pattern);
    }

    // Invalidate stock-specific cache entries
    static async invalidateStock(symbol: string): Promise<number> {
        const pattern = CacheKeys.stockPattern(symbol);
        return await this.invalidate(pattern);
    }

    // Invalidate portfolio-related cache entries
    static async invalidatePortfolio(userId: string): Promise<number> {
        const pattern = CacheKeys.portfolioPattern(userId);
        return await this.invalidate(pattern);
    }

    // Invalidate constraint-related cache entries
    static async invalidateConstraints(userId: string): Promise<number> {
        const pattern = CacheKeys.constraintPattern(userId);
        return await this.invalidate(pattern);
    }

    // Get cache statistics
    static getStats(): CacheStats {
        return memoryCache.getStats();
    }

    // Clear all cache
    static clear(): void {
        memoryCache.clear();
    }

    // Get all keys matching pattern
    static keys(pattern?: string): string[] {
        return memoryCache.keys(pattern);
    }

    // Refresh cache entry with new data
    static async refresh<T>(key: string, refreshFn: () => Promise<T>, ttl?: number): Promise<T> {
        try {
            const newData = await refreshFn();
            await this.set(key, newData, ttl);
            return newData;
        } catch (error) {
            console.error(`Cache refresh error for key ${key}:`, error);
            throw error;
        }
    }

    // Background refresh - refresh cache without blocking
    static async backgroundRefresh<T>(
        key: string,
        refreshFn: () => Promise<T>,
        ttl?: number
    ): Promise<void> {
        // Don't await - let it run in background
        this.refresh(key, refreshFn, ttl).catch(error => {
            console.error(`Background cache refresh failed for key ${key}:`, error);
        });
    }
}

// Cache invalidation strategies
export class CacheInvalidationStrategy {
    // Invalidate when portfolio data changes
    static async onPortfolioUpdate(userId: string): Promise<void> {
        await Promise.all([
            CacheService.invalidatePortfolio(userId),
            CacheService.del(CacheKeys.constraintPositions(userId)),
            CacheService.del(CacheKeys.groupSummary(userId))
        ]);
    }

    // Invalidate when constraint data changes
    static async onConstraintUpdate(userId: string): Promise<void> {
        await Promise.all([
            CacheService.invalidateConstraints(userId),
            CacheService.del(CacheKeys.constraintPositions(userId)),
            CacheService.del(CacheKeys.groupSummary(userId))
        ]);
    }

    // Invalidate when stock prices update
    static async onPriceUpdate(symbols: string[]): Promise<void> {
        const invalidationPromises = symbols.map(symbol =>
            CacheService.invalidateStock(symbol)
        );

        await Promise.all(invalidationPromises);
    }

    // Invalidate when user data changes
    static async onUserUpdate(userId: string): Promise<void> {
        await CacheService.invalidateUser(userId);
    }
}