-- Create portfolio_history table for tracking portfolio performance over time
CREATE TABLE IF NOT EXISTS portfolio_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_gain_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_gain_loss_percent DECIMAL(8,4) NOT NULL DEFAULT 0,
    position_count INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_history_user_timestamp ON portfolio_history (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_timestamp ON portfolio_history (timestamp DESC);

-- Create a function to automatically create portfolio snapshots
CREATE OR REPLACE FUNCTION create_portfolio_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    portfolio_summary RECORD;
BEGIN
    -- Get the user_id from the modified position
    IF TG_OP = 'DELETE' THEN
        user_record := OLD;
    ELSE
        user_record := NEW;
    END IF;

    -- Calculate current portfolio summary for this user
    SELECT 
        COALESCE(SUM(quantity * COALESCE(current_price, average_cost)), 0) as total_value,
        COALESCE(SUM((quantity * COALESCE(current_price, average_cost)) - (quantity * average_cost)), 0) as total_gain_loss,
        COUNT(*) as position_count
    INTO portfolio_summary
    FROM positions 
    WHERE user_id = user_record.user_id AND quantity > 0;

    -- Calculate percentage
    DECLARE
        total_cost DECIMAL(15,2);
        gain_loss_percent DECIMAL(8,4) := 0;
    BEGIN
        SELECT COALESCE(SUM(quantity * average_cost), 0) INTO total_cost
        FROM positions 
        WHERE user_id = user_record.user_id AND quantity > 0;
        
        IF total_cost > 0 THEN
            gain_loss_percent := (portfolio_summary.total_gain_loss / total_cost) * 100;
        END IF;
    END;

    -- Insert snapshot (but limit frequency to avoid too many records)
    INSERT INTO portfolio_history (user_id, total_value, total_gain_loss, total_gain_loss_percent, position_count)
    SELECT 
        user_record.user_id,
        portfolio_summary.total_value,
        portfolio_summary.total_gain_loss,
        gain_loss_percent,
        portfolio_summary.position_count
    WHERE NOT EXISTS (
        SELECT 1 FROM portfolio_history 
        WHERE user_id = user_record.user_id 
        AND timestamp > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically create snapshots when positions change
DROP TRIGGER IF EXISTS portfolio_snapshot_trigger ON positions;
CREATE TRIGGER portfolio_snapshot_trigger
    AFTER INSERT OR UPDATE OR DELETE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION create_portfolio_snapshot();

-- Create index for better performance on portfolio queries
CREATE INDEX IF NOT EXISTS idx_positions_user_symbol ON positions(user_id, stock_symbol);
CREATE INDEX IF NOT EXISTS idx_positions_user_quantity ON positions(user_id) WHERE quantity > 0;