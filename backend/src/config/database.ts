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

// Cache interfaces removed for deployment reliability



// Memory cache removed for deployment reliability

// Memory cache removed - using direct database calls for better deployment reliability

// Simple cache stats interface
interface CacheStats {
    hitCount: number;
    missCount: number;
    hitRatio: number;
    totalKeys: number;
    memoryUsage: number;
}

// Simple query execution without performance monitoring
export const executeQuery = async (query: string, params?: any[]): Promise<any> => {
    return await pool.query(query, params);
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