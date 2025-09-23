// Performance monitoring types
export interface QueryMetrics {
    query: string;
    duration: number;
    timestamp: Date;
    params?: any[];
}

export interface CacheStats {
    hitCount: number;
    missCount: number;
    hitRatio: number;
    totalKeys: number;
    memoryUsage: number;
}

export interface RequestMetrics {
    method: string;
    path: string;
    duration: number;
    timestamp: Date;
    statusCode: number;
}

export interface SystemMetrics {
    database: {
        poolUtilization: number;
        totalConnections: number;
        idleConnections: number;
        waitingConnections: number;
    };
    queries: {
        slowQueries: QueryMetrics[];
        averageQueryTime: number;
    };
    preparedStatements: {
        hitRatio: number;
        hitCount: number;
        missCount: number;
    };
    cache: {
        hitRatio: number;
        hitCount: number;
        missCount: number;
        totalKeys: number;
        memoryUsageMB: number;
    };
}