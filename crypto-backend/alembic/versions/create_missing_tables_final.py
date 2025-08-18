"""Create all missing tables and fix schema issues

Revision ID: create_missing_tables_final
Revises: 23f382e180c8
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_missing_tables_final'
down_revision = '23f382e180c8'
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
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_achievements_achievement_id ON user_achievements (id)")
    
    # Create user_login_streaks table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_login_streaks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_login_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Create indexes for user_login_streaks if they don't exist
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_login_streaks_id ON user_login_streaks (id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_user_login_streaks_user_id ON user_login_streaks (user_id)")
    
    # Create demo_coin_packages table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS demo_coin_packages (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            description VARCHAR,
            price NUMERIC(10, 2) NOT NULL,
            coins_per_inr NUMERIC(10, 2) NOT NULL,
            bonus_percentage INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Create indexes for demo_coin_packages if they don't exist
    op.execute("CREATE INDEX IF NOT EXISTS ix_demo_coin_packages_id ON demo_coin_packages (id)")
    
    # Create purchases table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS purchases (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            package_id INTEGER REFERENCES demo_coin_packages(id) ON DELETE SET NULL,
            amount NUMERIC(10, 2) NOT NULL,
            coins_received NUMERIC(20, 8),
            razorpay_order_id VARCHAR NOT NULL,
            razorpay_payment_id VARCHAR,
            status VARCHAR NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Create indexes for purchases if they don't exist
    op.execute("CREATE INDEX IF NOT EXISTS ix_purchases_id ON purchases (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_purchases_user_id ON purchases (user_id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_purchases_razorpay_order_id ON purchases (razorpay_order_id)")
    
    # Insert default demo coin packages if they don't exist
    op.execute("""
        INSERT INTO demo_coin_packages (name, description, price, coins_per_inr, bonus_percentage, is_active) VALUES
        ('Starter Pack', 'Perfect for beginners', 99.00, 1000.00, 0, true),
        ('Pro Pack', 'Great value for active traders', 499.00, 5500.00, 10, true),
        ('Elite Pack', 'Maximum value for serious traders', 999.00, 12000.00, 20, true)
        ON CONFLICT (name) DO NOTHING
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
    op.execute("DROP INDEX IF EXISTS ix_purchases_razorpay_order_id")
    op.execute("DROP INDEX IF EXISTS ix_purchases_user_id")
    op.execute("DROP INDEX IF EXISTS ix_purchases_id")
    op.execute("DROP INDEX IF EXISTS ix_demo_coin_packages_id")
    op.execute("DROP INDEX IF EXISTS ix_user_login_streaks_user_id")
    op.execute("DROP INDEX IF EXISTS ix_user_login_streaks_id")
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_achievement_id")
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_user_id")
    op.execute("DROP INDEX IF EXISTS ix_user_achievements_id")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_weekly_rank")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_global_rank")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_user_id")
    op.execute("DROP INDEX IF EXISTS ix_leaderboard_entries_id")
    
    # Drop tables
    op.execute("DROP TABLE IF EXISTS purchases")
    op.execute("DROP TABLE IF EXISTS demo_coin_packages")
    op.execute("DROP TABLE IF EXISTS user_login_streaks")
    op.execute("DROP TABLE IF EXISTS user_achievements")
    op.execute("DROP TABLE IF EXISTS leaderboard_entries")
