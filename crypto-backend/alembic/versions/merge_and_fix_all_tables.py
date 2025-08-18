"""merge and fix all tables

Revision ID: merge_and_fix_all_tables
Revises: add_missing_tables
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'merge_and_fix_all_tables'
down_revision = 'add_missing_tables'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    
    # Create leaderboard_entries table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard_entries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            username VARCHAR NOT NULL,
            total_portfolio_value NUMERIC(20, 8) NOT NULL DEFAULT 0,
            total_invested NUMERIC(20, 8) NOT NULL DEFAULT 0,
            total_profit_loss NUMERIC(20, 8) NOT NULL DEFAULT 0,
            total_profit_loss_percent NUMERIC(10, 4) NOT NULL DEFAULT 0,
            current_demo_balance NUMERIC(20, 8) NOT NULL DEFAULT 100000,
            initial_balance NUMERIC(20, 8) NOT NULL DEFAULT 100000,
            portfolio_performance_percent NUMERIC(10, 4) NOT NULL DEFAULT 0,
            total_trades INTEGER NOT NULL DEFAULT 0,
            winning_trades INTEGER NOT NULL DEFAULT 0,
            losing_trades INTEGER NOT NULL DEFAULT 0,
            win_rate_percent NUMERIC(10, 4) NOT NULL DEFAULT 0,
            global_rank INTEGER,
            weekly_rank INTEGER,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            week_start TIMESTAMP WITH TIME ZONE
        )
    """)
    
    # Create indexes for leaderboard_entries if they don't exist
    op.execute("CREATE INDEX IF NOT EXISTS ix_leaderboard_entries_id ON leaderboard_entries (id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_leaderboard_entries_user_id ON leaderboard_entries (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_leaderboard_entries_global_rank ON leaderboard_entries (global_rank)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_leaderboard_entries_weekly_rank ON leaderboard_entries (weekly_rank)")
    
    # Create user_achievements table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_achievements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
            current_progress NUMERIC(20, 8) NOT NULL DEFAULT 0,
            is_completed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
        )
    """)
    
    # Create indexes for user_achievements if they don't exist
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_achievements_id ON user_achievements (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_achievements_user_id ON user_achievements (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_achievements_achievement_id ON user_achievements (achievement_id)")
    
    # Update user_login_streaks table to use DateTime instead of Date for last_login_date
    # First check if the column exists and what type it is
    op.execute("""
        DO $$
        BEGIN
            -- Check if last_login_date column exists and is of type DATE
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_login_streaks' 
                AND column_name = 'last_login_date' 
                AND data_type = 'date'
            ) THEN
                -- Alter the column type from DATE to TIMESTAMP WITH TIME ZONE
                ALTER TABLE user_login_streaks 
                ALTER COLUMN last_login_date TYPE TIMESTAMP WITH TIME ZONE 
                USING last_login_date::TIMESTAMP WITH TIME ZONE;
            END IF;
        END $$;
    """)
    
    # Insert default achievements with correct enum values (only if they don't exist)
    op.execute("""
        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
        ('First Trade', 'Complete your first trade', 'trading_milestone', 'first-trade', 1, 'trades', 1000, 'Trader', true),
        ('Profit Maker', 'Make your first profit', 'profit_achievement', 'profit', 1, 'profit_percent', 2000, 'Profit Seeker', true),
        ('Diversified Portfolio', 'Hold 5 different cryptocurrencies', 'diversification', 'diversify', 5, 'coins_held', 3000, 'Diversifier', true),
        ('Login Streak', 'Login for 7 consecutive days', 'login_streak', 'streak', 7, 'days_streak', 1500, 'Dedicated', true),
        ('Volume Trader', 'Trade with total volume of 10000', 'volume_reward', 'volume', 10000, 'volume', 5000, 'Volume Master', true)
        ON CONFLICT (name) DO NOTHING
    """)

def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_weekly_rank")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_global_rank")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_user_id")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_id")
    
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_achievement_id")
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_user_id")
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_id")
    
    # Drop tables
    op.execute("DROP TABLE IF EXISTS leaderboard_entries")
    op.execute("DROP TABLE IF EXISTS user_achievements")
