import { Request, Response, NextFunction } from 'express';
import { queryMonitor, getPoolStats, preparedStatementCache } from '../config/database';
import { CacheService } from '../services/CacheService';
import { RequestMetrics, SystemMetrics } from '../types/performance';

// Request performance tracking

class PerformanceMonitor {
    private requestMetrics: RequestMetrics[] = [];
    private readonly MAX_METRICS = 1000;
    private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second

    logRequest(req: Request, res: Response, duration: number): void {
        const metric: RequestMetrics = {
            method: req.method,
            path: req.path,
            duration,
            timestamp: new Date(),
            statusCode: res.statusCode
        };

        this.requestMetrics.push(metric);

        // Keep only recent metrics
        if (this.requestMetrics.length > this.MAX_METRICS) {
            this.requestMetrics.shift();
        }

        // Log slow requests
        if (duration > this.SLOW_REQUEST_THRESHOLD) {
            console.warn(`🐌 Slow request detected (${duration}ms):`, {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode
            });
        }
    }

    getMetrics() {
        const recentMetrics = this.requestMetrics.slice(-100); // Last 100 requests
        const averageResponseTime = recentMetrics.length > 0 
            ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length 
            : 0;

        const slowRequests = recentMetrics.filter(m => m.duration > this.SLOW_REQUEST_THRESHOLD);

        return {
            totalRequests: this.requestMetrics.length,
            averageResponseTime: Math.round(averageResponseTime),
            slowRequestCount: slowRequests.length,
            slowRequestPercentage: recentMetrics.length > 0 
                ? Math.round((slowRequests.length / recentMetrics.length) * 100) 
                : 0,
            recentRequests: recentMetrics.slice(-10) // Last 10 requests
        };
    }

    getSystemMetrics(): SystemMetrics {
        const poolStats = getPoolStats();
        const queryStats = {
            slowQueries: queryMonitor.getSlowQueries().slice(-10),
            averageQueryTime: Math.round(queryMonitor.getAverageQueryTime())
        };
        const preparedStmtStats = preparedStatementCache.getStats();
        const cacheStats = CacheService.getStats();

        return {
            database: {
                poolUtilization: Math.round(poolStats.utilization * 100),
                totalConnections: poolStats.totalCount,
                idleConnections: poolStats.idleCount,
                waitingConnections: poolStats.waitingCount
            },
            queries: queryStats,
            preparedStatements: {
                hitRatio: Math.round(preparedStmtStats.hitRatio * 100),
                hitCount: preparedStmtStats.hitCount,
                missCount: preparedStmtStats.missCount
            },
            cache: {
                hitRatio: Math.round(cacheStats.hitRatio * 100),
                hitCount: cacheStats.hitCount,
                missCount: cacheStats.missCount,
                totalKeys: cacheStats.totalKeys,
                memoryUsageMB: Math.round(cacheStats.memoryUsage / 1024 / 1024 * 100) / 100
            }
        };
    }
}

export const performanceMonitor = new PerformanceMonitor();

// Express middleware for request performance monitoring
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Use res.on('finish') instead of overriding res.end
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        performanceMonitor.logRequest(req, res, duration);
    });

    next();
};

// Performance metrics endpoint
export const getPerformanceMetrics = (_req: Request, res: Response): void => {
    try {
        const requestMetrics = performanceMonitor.getMetrics();
        const systemMetrics = performanceMonitor.getSystemMetrics();

        res.json({
            timestamp: new Date(),
            requests: requestMetrics,
            system: systemMetrics
        });
    } catch (error) {
        console.error('Error getting performance metrics:', error);
        res.status(500).json({ error: 'Failed to get performance metrics' });
    }
};