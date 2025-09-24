import { Pool } from 'pg';

// Create a connection pool for the API functions
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
      max: 5, // Smaller pool for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

export const executeQuery = async (query: string, params?: any[]): Promise<any> => {
  const pool = getPool();
  return await pool.query(query, params);
};