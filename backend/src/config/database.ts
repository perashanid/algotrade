import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - backend .env takes precedence
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env'), override: false });

// Override DATABASE_URL if it's still pointing to localhost
if (process.env.DATABASE_URL?.includes('localhost')) {
  process.env.DATABASE_URL = 'postgresql://test_ndo2_user:vAOUnFxDqVJxnNQLVuXGMaQhdABHqQqV@dpg-d358vt33fgac73b8tv5g-a.singapore-postgres.render.com/test_ndo2';
}

// PostgreSQL connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
});

// Simple in-memory cache to replace Redis temporarily
class MemoryCache {
    private cache = new Map<string, { value: string; expiry?: number }>();

    async get(key: string): Promise<string | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: string): Promise<void> {
        this.cache.set(key, { value });
    }

    async setEx(key: string, seconds: number, value: string): Promise<void> {
        const expiry = Date.now() + (seconds * 1000);
        this.cache.set(key, { value, expiry });
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
        this.cache.set(key, { value });
        return true;
    }

    async expire(key: string, seconds: number): Promise<void> {
        const item = this.cache.get(key);
        if (item) {
            item.expiry = Date.now() + (seconds * 1000);
        }
    }

    // Clean up expired items periodically
    private cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.expiry && now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    constructor() {
        // Clean up expired items every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
}

// Memory cache instance (replaces Redis for now)
export const memoryCache = new MemoryCache();

// Initialize database connections
export const initializeDatabase = async (): Promise<void> => {
    try {
        // Debug: Log the DATABASE_URL (without showing the full URL for security)
        const dbUrl = process.env.DATABASE_URL;
        console.log('🔗 Database URL loaded:', dbUrl ? 'Yes' : 'No');
        console.log('🌐 Using external database:', dbUrl?.includes('render.com') ? 'Yes' : 'No');
        
        // Test PostgreSQL connection
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();

        console.log('✅ Memory cache initialized (Redis replacement)');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        process.exit(1);
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