-- Database schema for the trading platform
-- Run this on your production database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
    average_cost DECIMAL(15,4) NOT NULL,
    current_price DECIMAL(15,4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stock_symbol)
);

-- Constraints table
CREATE TABLE IF NOT EXISTS constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    buy_trigger_percent DECIMAL(5,2) NOT NULL,
    sell_trigger_percent DECIMAL(5,2) NOT NULL,
    profit_trigger_percent DECIMAL(5,2),
    buy_amount DECIMAL(15,2) NOT NULL,
    sell_amount DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock groups table
CREATE TABLE IF NOT EXISTS stock_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    stocks TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraint groups table
CREATE TABLE IF NOT EXISTS constraint_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    buy_trigger_percent DECIMAL(5,2) NOT NULL,
    sell_trigger_percent DECIMAL(5,2) NOT NULL,
    profit_trigger_percent DECIMAL(5,2),
    buy_amount DECIMAL(15,2) NOT NULL,
    sell_amount DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    stocks TEXT[] NOT NULL DEFAULT '{}',
    stock_groups UUID[] NOT NULL DEFAULT '{}',
    stock_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade history table
CREATE TABLE IF NOT EXISTS trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    constraint_id UUID REFERENCES constraints(id) ON DELETE SET NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('PRICE_DROP', 'PRICE_RISE', 'PROFIT_TARGET')),
    quantity DECIMAL(15,4) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    trigger_price DECIMAL(15,4) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_constraints_user_id ON constraints(user_id);
CREATE INDEX IF NOT EXISTS idx_constraints_symbol ON constraints(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_constraints_active ON constraints(is_active);
CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON trade_history(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_trade_history_executed_at ON trade_history(executed_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constraints_updated_at BEFORE UPDATE ON constraints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_groups_updated_at BEFORE UPDATE ON stock_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constraint_groups_updated_at BEFORE UPDATE ON constraint_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();