-- Add support for individual stock constraints within constraint groups
-- This allows each stock in a constraint group to have its own custom constraints

CREATE TABLE IF NOT EXISTS constraint_stock_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constraint_group_id UUID NOT NULL REFERENCES constraint_groups(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    buy_trigger_percent DECIMAL(5,2),
    sell_trigger_percent DECIMAL(5,2),
    profit_trigger_percent DECIMAL(5,2),
    buy_amount DECIMAL(12,2),
    sell_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(constraint_group_id, stock_symbol)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_constraint_stock_overrides_group_stock 
ON constraint_stock_overrides(constraint_group_id, stock_symbol);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_constraint_stock_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_constraint_stock_overrides_updated_at
    BEFORE UPDATE ON constraint_stock_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_constraint_stock_overrides_updated_at();