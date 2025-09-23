import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { logger } from '../middleware/logger';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initializeSQLiteDatabase = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
    if (db) {
        return db;
    }

    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dbPath = path.join(dataDir, 'trading_platform.db');

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Initialize schema
        await initializeSchema(db);

        logger.info('SQLite database initialized successfully');
        return db;
    } catch (error) {
        logger.error('Failed to initialize SQLite database:', error);
        throw error;
    }
};

const initializeSchema = async (database: Database<sqlite3.Database, sqlite3.Statement>) => {
    const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Stock Groups table
    CREATE TABLE IF NOT EXISTS stock_groups (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      stocks TEXT NOT NULL, -- JSON array of stock symbols
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Constraint Groups table
    CREATE TABLE IF NOT EXISTS constraint_groups (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      buy_trigger_percent REAL NOT NULL,
      sell_trigger_percent REAL NOT NULL,
      profit_trigger_percent REAL,
      buy_amount REAL NOT NULL,
      sell_amount REAL NOT NULL,
      is_active BOOLEAN DEFAULT true,
      stocks TEXT NOT NULL, -- JSON array of stock symbols
      stock_groups TEXT NOT NULL DEFAULT '[]', -- JSON array of stock group IDs
      stock_overrides TEXT DEFAULT '{}', -- JSON object of stock-specific overrides
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Individual Constraints table
    CREATE TABLE IF NOT EXISTS constraints (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      stock_symbol TEXT NOT NULL,
      buy_trigger_percent REAL NOT NULL,
      sell_trigger_percent REAL NOT NULL,
      profit_trigger_percent REAL,
      buy_amount REAL NOT NULL,
      sell_amount REAL NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Positions table
    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      stock_symbol TEXT NOT NULL,
      quantity REAL NOT NULL,
      average_cost REAL NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Trade History table
    CREATE TABLE IF NOT EXISTS trade_history (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      constraint_id TEXT,
      stock_symbol TEXT NOT NULL,
      trade_type TEXT NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
      trigger_type TEXT NOT NULL CHECK (trigger_type IN ('PRICE_DROP', 'PRICE_RISE', 'PROFIT_TARGET')),
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      trigger_price REAL NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Stock Prices table (for caching)
    CREATE TABLE IF NOT EXISTS stock_prices (
      symbol TEXT PRIMARY KEY,
      price REAL NOT NULL,
      change_percent REAL,
      volume INTEGER,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_stock_groups_user_id ON stock_groups(user_id);
    CREATE INDEX IF NOT EXISTS idx_constraint_groups_user_id ON constraint_groups(user_id);
    CREATE INDEX IF NOT EXISTS idx_constraints_user_id ON constraints(user_id);
    CREATE INDEX IF NOT EXISTS idx_constraints_stock_symbol ON constraints(stock_symbol);
    CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
    CREATE INDEX IF NOT EXISTS idx_positions_stock_symbol ON positions(stock_symbol);
    CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON trade_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_trade_history_stock_symbol ON trade_history(stock_symbol);
    CREATE INDEX IF NOT EXISTS idx_trade_history_executed_at ON trade_history(executed_at);
    CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
  `;

    await database.exec(schema);

    // Insert demo stock prices
    await seedStockPrices(database);
};

const seedStockPrices = async (database: Database<sqlite3.Database, sqlite3.Statement>) => {
    const stockPrices = [
        { symbol: 'AAPL', price: 175.43, change_percent: 1.2 },
        { symbol: 'GOOGL', price: 2847.63, change_percent: -0.8 },
        { symbol: 'MSFT', price: 378.85, change_percent: 0.5 },
        { symbol: 'AMZN', price: 3342.88, change_percent: 2.1 },
        { symbol: 'TSLA', price: 248.42, change_percent: -1.5 },
        { symbol: 'META', price: 331.05, change_percent: 0.9 },
        { symbol: 'NVDA', price: 875.28, change_percent: 3.2 },
        { symbol: 'NFLX', price: 445.73, change_percent: -0.3 },
        { symbol: 'JPM', price: 147.82, change_percent: 0.7 },
        { symbol: 'JNJ', price: 160.25, change_percent: -0.2 }
    ];

    for (const stock of stockPrices) {
        await database.run(
            `INSERT OR REPLACE INTO stock_prices (symbol, price, change_percent, volume, last_updated) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [stock.symbol, stock.price, stock.change_percent, Math.floor(Math.random() * 1000000)]
        );
    }
};

export const getSQLiteDatabase = (): Database<sqlite3.Database, sqlite3.Statement> => {
    if (!db) {
        throw new Error('Database not initialized. Call initializeSQLiteDatabase first.');
    }
    return db;
};

export const closeSQLiteDatabase = async (): Promise<void> => {
    if (db) {
        await db.close();
        db = null;
        logger.info('SQLite database connection closed');
    }
};