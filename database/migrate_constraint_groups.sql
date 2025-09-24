-- Migration script to update constraint_groups structure
-- This migrates from the old JSONB/array structure to normalized tables

-- Create the new tables
CREATE TABLE IF NOT EXISTS constraint_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constraint_group_id UUID NOT NULL REFERENCES constraint_groups(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(constraint_group_id, stock_symbol)
);

CREATE TABLE IF NOT EXISTS constraint_stock_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constraint_group_id UUID NOT NULL REFERENCES constraint_groups(id) ON DELETE CASCADE,
    stock_group_id UUID NOT NULL REFERENCES stock_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(constraint_group_id, stock_group_id)
);

CREATE TABLE IF NOT EXISTS constraint_stock_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constraint_group_id UUID NOT NULL REFERENCES constraint_groups(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    buy_trigger_percent DECIMAL(5,2),
    sell_trigger_percent DECIMAL(5,2),
    profit_trigger_percent DECIMAL(5,2),
    buy_amount DECIMAL(15,2),
    sell_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(constraint_group_id, stock_symbol)
);

-- Migrate existing data from constraint_groups to the new tables
DO $$
DECLARE
    cg_record RECORD;
    stocks_json JSONB;
    stock_groups_json JSONB;
    stock_overrides_json JSONB;
    stock_symbol TEXT;
    stock_group_id UUID;
    override_key TEXT;
    override_value JSONB;
BEGIN
    -- Migrate stocks JSON array to constraint_stocks table
    FOR cg_record IN SELECT id, stocks, stock_groups, stock_overrides FROM constraint_groups LOOP
        -- Parse stocks JSON
        BEGIN
            stocks_json := cg_record.stocks::JSONB;
            IF jsonb_array_length(stocks_json) > 0 THEN
                FOR i IN 0..jsonb_array_length(stocks_json)-1 LOOP
                    stock_symbol := stocks_json->>i;
                    INSERT INTO constraint_stocks (constraint_group_id, stock_symbol)
                    VALUES (cg_record.id, UPPER(stock_symbol))
                    ON CONFLICT (constraint_group_id, stock_symbol) DO NOTHING;
                END LOOP;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip if JSON parsing fails
            NULL;
        END;

        -- Parse stock_groups JSON
        BEGIN
            stock_groups_json := cg_record.stock_groups::JSONB;
            IF jsonb_array_length(stock_groups_json) > 0 THEN
                FOR i IN 0..jsonb_array_length(stock_groups_json)-1 LOOP
                    stock_group_id := (stock_groups_json->>i)::UUID;
                    INSERT INTO constraint_stock_groups (constraint_group_id, stock_group_id)
                    VALUES (cg_record.id, stock_group_id)
                    ON CONFLICT (constraint_group_id, stock_group_id) DO NOTHING;
                END LOOP;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip if JSON parsing fails
            NULL;
        END;

        -- Parse stock_overrides JSON
        BEGIN
            IF cg_record.stock_overrides IS NOT NULL AND cg_record.stock_overrides != '{}' THEN
                stock_overrides_json := cg_record.stock_overrides::JSONB;
                FOR override_key, override_value IN SELECT * FROM jsonb_each(stock_overrides_json) LOOP
                    INSERT INTO constraint_stock_overrides (
                        constraint_group_id, 
                        stock_symbol,
                        buy_trigger_percent,
                        sell_trigger_percent,
                        profit_trigger_percent,
                        buy_amount,
                        sell_amount
                    )
                    VALUES (
                        cg_record.id,
                        UPPER(override_key),
                        (override_value->>'buyTriggerPercent')::DECIMAL(5,2),
                        (override_value->>'sellTriggerPercent')::DECIMAL(5,2),
                        (override_value->>'profitTriggerPercent')::DECIMAL(5,2),
                        (override_value->>'buyAmount')::DECIMAL(15,2),
                        (override_value->>'sellAmount')::DECIMAL(15,2)
                    )
                    ON CONFLICT (constraint_group_id, stock_symbol) DO NOTHING;
                END LOOP;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip if JSON parsing fails
            NULL;
        END;
    END LOOP;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_constraint_stocks_group_id ON constraint_stocks(constraint_group_id);
CREATE INDEX IF NOT EXISTS idx_constraint_stocks_symbol ON constraint_stocks(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_constraint_stock_groups_group_id ON constraint_stock_groups(constraint_group_id);
CREATE INDEX IF NOT EXISTS idx_constraint_stock_groups_stock_group_id ON constraint_stock_groups(stock_group_id);
CREATE INDEX IF NOT EXISTS idx_constraint_stock_overrides_group_id ON constraint_stock_overrides(constraint_group_id);
CREATE INDEX IF NOT EXISTS idx_constraint_stock_overrides_symbol ON constraint_stock_overrides(stock_symbol);

-- Create update trigger for constraint_stock_overrides
CREATE TRIGGER update_constraint_stock_overrides_updated_at BEFORE UPDATE ON constraint_stock_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remove the old columns from constraint_groups (optional - uncomment if you want to clean up)
-- ALTER TABLE constraint_groups DROP COLUMN IF EXISTS stocks;
-- ALTER TABLE constraint_groups DROP COLUMN IF EXISTS stock_groups;
-- ALTER TABLE constraint_groups DROP COLUMN IF EXISTS stock_overrides;