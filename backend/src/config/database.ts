import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - backend .env takes precedence
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env'), override: false });

// Only override DATABASE_URL if it's pointing to localhost (keep the env file value otherwise)
if (process.env.DATABASE_URL?.includes('localhost')) {
  console.log('⚠️  DATABASE_URL is pointing to localhost, but no override needed - using external database from env');
}

// Optimized PostgreSQL connection pool configuration
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 25, // Increased max connections for better concurrency
    min: 5, // Maintain minimum connections for faster response
    idleTimeoutMillis: 60000, // Increased idle timeout for better connection reuse
    connectionTimeoutMillis: 15000, // Increased connection timeout
    // acquireTimeoutMillis: 10000, // Not available in pg Pool
    // createTimeoutMillis: 10000, // Not available in pg Pool
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
});

// Enhanced in-memory cache with batch operations and performance tracking
interface CacheItem {
    value: string;
    expiry?: number;
    accessCount: number;
    lastAccessed: number;
}



class EnhancedMemoryCache {
    private cache = new Map<string, CacheItem>();
    private hitCount = 0;
    private missCount = 0;
    private readonly maxSize: number;
    private readonly defaultTTL: number;

    constructor(maxSize = 10000, defaultTTL = 300) {
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        
        // Clean up expired items every 2 minutes
        setInterval(() => this.cleanup(), 2 * 60 * 1000);
        
        // Evict least recently used items every 5 minutes if cache is full
        setInterval(() => this.evictLRU(), 5 * 60 * 1000);
    }

    async get(key: string): Promise<string | null> {
        const item = this.cache.get(key);
        if (!item) {
            this.missCount++;
            return null;
        }

        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            this.missCount++;
            return null;
        }

        // Update access statistics
        item.accessCount++;
        item.lastAccessed = Date.now();
        this.hitCount++;

        return item.value;
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        const expiry = ttl ? Date.now() + (ttl * 1000) : 
                      this.defaultTTL ? Date.now() + (this.defaultTTL * 1000) : undefined;

        this.cache.set(key, {
            value,
            expiry,
            accessCount: 0,
            lastAccessed: Date.now()
        });

        // Evict if cache is too large
        if (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }

    async setEx(key: string, seconds: number, value: string): Promise<void> {
        await this.set(key, value, seconds);
    }

    async del(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async exists(key: string): Promise<number> {
        const item = this.cache.get(key);
        if (!item) return 0;

        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return 0;
        }

        return 1;
    }

    async setNX(key: string, value: string): Promise<boolean> {
        if (this.cache.has(key)) return false;
        await this.set(key, value);
        return true;
    }

    async expire(key: string, seconds: number): Promise<void> {
        const item = this.cache.get(key);
        if (item) {
            item.expiry = Date.now() + (seconds * 1000);
        }
    }

    // Batch operations for better performance
    async mget(keys: string[]): Promise<Map<string, string>> {
        const results = new Map<string, string>();
        
        for (const key of keys) {
            const value = await this.get(key);
            if (value !== null) {
                results.set(key, value);
            }
        }
        
        return results;
    }

    async mset(entries: Map<string, string>, ttl?: number): Promise<void> {
        const promises = Array.from(entries.entries()).map(([key, value]) => 
            this.set(key, value, ttl)
        );
        
        await Promise.all(promises);
    }

    // Pattern-based invalidation
    async invalidate(pattern: string): Promise<number> {
        let deletedCount = 0;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        
        return deletedCount;
    }

    // Cache warming - preload frequently accessed data
    async warm(entries: Map<string, string>, ttl?: number): Promise<void> {
        await this.mset(entries, ttl);
    }

    // Get cache statistics
    getStats(): CacheStats {
        const total = this.hitCount + this.missCount;
        const memoryUsage = this.estimateMemoryUsage();
        
        return {
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRatio: total > 0 ? this.hitCount / total : 0,
            totalKeys: this.cache.size,
            memoryUsage
        };
    }

    // Clear all cache entries
    clear(): void {
        this.cache.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }

    // Get all keys matching a pattern
    keys(pattern?: string): string[] {
        if (!pattern) {
            return Array.from(this.cache.keys());
        }
        
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return Array.from(this.cache.keys()).filter(key => regex.test(key));
    }

    // Clean up expired items
    private cleanup(): void {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (item.expiry && now > item.expiry) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
        }
    }

    // Evict least recently used items when cache is full
    private evictLRU(): void {
        if (this.cache.size <= this.maxSize) return;
        
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        const toEvict = Math.floor(this.maxSize * 0.1); // Evict 10% of max size
        for (let i = 0; i < toEvict && entries.length > 0; i++) {
            const [key] = entries[i];
            this.cache.delete(key);
        }
        
        console.log(`🗑️  Cache LRU eviction: removed ${toEvict} items`);
    }

    // Estimate memory usage (rough calculation)
    private estimateMemoryUsage(): number {
        let totalSize = 0;
        
        for (const [key, item] of this.cache.entries()) {
            totalSize += key.length * 2; // UTF-16 characters
            totalSize += item.value.length * 2;
            totalSize += 32; // Approximate overhead for object structure
        }
        
        return totalSize;
    }
}

// Enhanced memory cache instance (replaces Redis for now)
export const memoryCache = new EnhancedMemoryCache(10000, 300); // 10k items, 5min default TTL

import { QueryMetrics, CacheStats } from '../types/performance';

// Query performance monitoring

class QueryPerformanceMonitor {
    private slowQueries: QueryMetrics[] = [];
    private readonly SLOW_QUERY_THRESHOLD = 100; // 100ms threshold
    private readonly MAX_SLOW_QUERIES = 100; // Keep last 100 slow queries

    logQuery(query: string, duration: number, params?: any[]): void {
        if (duration > this.SLOW_QUERY_THRESHOLD) {
            const metric: QueryMetrics = {
                query: query.substring(0, 200), // Truncate long queries
                duration,
                timestamp: new Date(),
                params: params?.slice(0, 5) // Only log first 5 params for privacy
            };

            this.slowQueries.push(metric);
            
            // Keep only the most recent slow queries
            if (this.slowQueries.length > this.MAX_SLOW_QUERIES) {
                this.slowQueries.shift();
            }

            console.warn(`🐌 Slow query detected (${duration}ms):`, {
                query: metric.query,
                duration: metric.duration,
                timestamp: metric.timestamp
            });
        }
    }

    getSlowQueries(): QueryMetrics[] {
        return [...this.slowQueries];
    }

    getAverageQueryTime(): number {
        if (this.slowQueries.length === 0) return 0;
        const total = this.slowQueries.reduce((sum, q) => sum + q.duration, 0);
        return total / this.slowQueries.length;
    }
}

export const queryMonitor = new QueryPerformanceMonitor();

// Enhanced query execution with performance monitoring
export const executeQuery = async (query: string, params?: any[]): Promise<any> => {
    const startTime = Date.now();
    
    try {
        const result = await pool.query(query, params);
        const duration = Date.now() - startTime;
        
        queryMonitor.logQuery(query, duration, params);
        
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        queryMonitor.logQuery(query, duration, params);
        throw error;
    }
};

// Prepared statement cache
class PreparedStatementCache {
    private statements = new Map<string, string>();
    private hitCount = 0;
    private missCount = 0;

    getOrCreate(key: string, query: string): string {
        if (this.statements.has(key)) {
            this.hitCount++;
            return this.statements.get(key)!;
        }

        this.missCount++;
        this.statements.set(key, query);
        return query;
    }

    getStats(): { hitCount: number; missCount: number; hitRatio: number } {
        const total = this.hitCount + this.missCount;
        return {
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRatio: total > 0 ? this.hitCount / total : 0
        };
    }

    clear(): void {
        this.statements.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }
}

export const preparedStatementCache = new PreparedStatementCache();

// Connection pool monitoring
export const getPoolStats = () => {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        utilization: pool.totalCount > 0 ? (pool.totalCount - pool.idleCount) / pool.totalCount : 0
    };
};

// Initialize database connections
export const initializeDatabase = async (): Promise<void> => {
    try {
        console.log('🌐 Using external database:', process.env.DATABASE_URL?.includes('render.com') ? 'Yes' : 'No');
        
        // Test PostgreSQL connection
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        
        // Log initial pool configuration
        console.log('🔧 Database pool configuration:', {
            max: 25,
            min: 5,
            idleTimeoutMillis: 60000,
            connectionTimeoutMillis: 15000
        });
        
        client.release();

        console.log('✅ Memory cache initialized (Redis replacement)');
        console.log('✅ Query performance monitoring enabled');
        console.log('✅ Prepared statement caching enabled');

        // Set up periodic pool monitoring
        setInterval(() => {
            const stats = getPoolStats();
            if (stats.utilization > 0.8) {
                console.warn('⚠️  High database pool utilization:', stats);
            }
        }, 30000); // Check every 30 seconds

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        process.exit(1);
    }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};

// Automatic reconnection with exponential backoff
export const ensureDatabaseConnection = async (maxRetries = 3): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const isHealthy = await checkDatabaseHealth();
            if (isHealthy) {
                return;
            }
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt} failed:`, error);
        }

        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`⏳ Retrying database connection in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Failed to establish database connection after maximum retries');
};

// Enhanced query execution with automatic retry
export const executeQueryWithRetry = async (query: string, params?: any[], maxRetries = 2): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await executeQuery(query, params);
        } catch (error: any) {
            // Check if it's a connection error
            if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                console.warn(`🔄 Database connection error on attempt ${attempt}, retrying...`);
                
                if (attempt < maxRetries) {
                    await ensureDatabaseConnection();
                    continue;
                }
            }
            throw error;
        }
    }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
};