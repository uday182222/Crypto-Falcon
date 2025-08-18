"""create_complete_schema_from_scratch

Revision ID: 730bb323edf7
Revises: 
Create Date: 2025-08-18 15:31:13.082405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '730bb323edf7'
down_revision: Union[str, Sequence[str], None] = '2e2cd2f8b62c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema - create complete database from scratch."""
    # Defensive: make idempotent by safely dropping any pre-existing objects using IF EXISTS
    # Use CASCADE to handle foreign keys; this avoids transaction-aborting errors.
    op.execute("DROP TABLE IF EXISTS purchases CASCADE;")
    op.execute("DROP TABLE IF EXISTS demo_coin_packages CASCADE;")
    op.execute("DROP TABLE IF EXISTS user_login_streaks CASCADE;")
    op.execute("DROP TABLE IF EXISTS leaderboard_entries CASCADE;")
    op.execute("DROP TABLE IF EXISTS user_achievements CASCADE;")
    op.execute("DROP TABLE IF EXISTS achievements CASCADE;")
    op.execute("DROP TABLE IF EXISTS wallet_transactions CASCADE;")
    op.execute("DROP TABLE IF EXISTS trades CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")

    # Postgres-specific: ensure enum type does not pre-exist to avoid duplicate type errors
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievementtype') THEN
                DROP TYPE achievementtype;
            END IF;
        END
        $$;
        """
    )

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('demo_balance', sa.Numeric(precision=20, scale=8), nullable=False, server_default='100000'),
        sa.Column('preferred_currency', sa.String(length=3), nullable=False, server_default='USD'),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('xp_first_gain_awarded', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('xp_lost_all_awarded', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('xp_best_rank', sa.Integer(), nullable=True),
        sa.Column('bio', sa.String(length=500), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('website', sa.String(length=200), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('preferences', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for users
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create trades table
    op.create_table('trades',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('coin_symbol', sa.String(length=10), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('price_at_trade', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('total_cost', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('trade_type', sa.String(length=10), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for trades
    op.create_index(op.f('ix_trades_id'), 'trades', ['id'], unique=False)
    op.create_index(op.f('ix_trades_user_id'), 'trades', ['user_id'], unique=False)
    op.create_index(op.f('ix_trades_coin_symbol'), 'trades', ['coin_symbol'], unique=False)
    op.create_index(op.f('ix_trades_timestamp'), 'trades', ['timestamp'], unique=False)
    
    # Create wallet_transactions table
    op.create_table('wallet_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=True),
        sa.Column('payment_id', sa.String(length=255), nullable=True),
        sa.Column('order_id', sa.String(length=255), nullable=True),
        sa.Column('package_id', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for wallet_transactions
    op.create_index(op.f('ix_wallet_transactions_id'), 'wallet_transactions', ['id'], unique=False)
    
    # Create achievements table
    op.create_table('achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('type', sa.Enum('trading_milestone', 'profit_achievement', 'diversification', 'login_streak', 'volume_reward', name='achievementtype'), nullable=False),
        sa.Column('icon', sa.String(length=255), nullable=False),
        sa.Column('requirement_value', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('requirement_type', sa.String(length=50), nullable=False),
        sa.Column('reward_coins', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
        sa.Column('reward_title', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for achievements
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
    
    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_id', sa.Integer(), nullable=False),
        sa.Column('current_progress', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for user_achievements
    op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)
    op.create_index(op.f('ix_user_achievements_user_id'), 'user_achievements', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_achievements_achievement_id'), 'user_achievements', ['achievement_id'], unique=False)
    
    # Create leaderboard_entries table
    op.create_table('leaderboard_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('total_portfolio_value', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_invested', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_profit_loss', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_profit_loss_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        sa.Column('current_demo_balance', sa.Numeric(20, 8), nullable=False, server_default='100000'),
        sa.Column('initial_balance', sa.Numeric(20, 8), nullable=False, server_default='100000'),
        sa.Column('portfolio_performance_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        sa.Column('total_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('winning_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('losing_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('win_rate_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        sa.Column('global_rank', sa.Integer(), nullable=True),
        sa.Column('weekly_rank', sa.Integer(), nullable=True),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('week_start', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for leaderboard_entries
    op.create_index(op.f('ix_leaderboard_entries_id'), 'leaderboard_entries', ['id'], unique=False)
    op.create_index(op.f('ix_leaderboard_entries_user_id'), 'leaderboard_entries', ['user_id'], unique=True)
    op.create_index(op.f('ix_leaderboard_entries_global_rank'), 'leaderboard_entries', ['global_rank'], unique=False)
    op.create_index(op.f('ix_leaderboard_entries_weekly_rank'), 'leaderboard_entries', ['weekly_rank'], unique=False)
    
    # Create user_login_streaks table
    op.create_table('user_login_streaks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_login_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for user_login_streaks
    op.create_index(op.f('ix_user_login_streaks_id'), 'user_login_streaks', ['id'], unique=False)
    op.create_index(op.f('ix_user_login_streaks_user_id'), 'user_login_streaks', ['user_id'], unique=True)
    
    # Create demo_coin_packages table
    op.create_table('demo_coin_packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('coins_per_inr', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('bonus_percentage', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create purchases table
    op.create_table('purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('coins_received', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('razorpay_order_id', sa.String(), nullable=False),
        sa.Column('razorpay_payment_id', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['package_id'], ['demo_coin_packages.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for purchases
    op.create_index(op.f('ix_purchases_id'), 'purchases', ['id'], unique=False)
    op.create_index(op.f('ix_purchases_user_id'), 'purchases', ['user_id'], unique=False)
    op.create_index(op.f('ix_purchases_razorpay_order_id'), 'purchases', ['razorpay_order_id'], unique=True)
    
    # Insert default achievements
    op.execute("""
        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
        ('First Trade', 'Complete your first trade', 'trading_milestone', '🎯', 1, 'trades', 1000, 'Trader', true),
        ('Profit Master', 'Make 10% profit on a trade', 'profit_achievement', '💰', 10, 'profit_percent', 2000, 'Profit Hunter', true),
        ('Diversifier', 'Hold 5 different cryptocurrencies', 'diversification', '📊', 5, 'coins_held', 1500, 'Diversifier', true),
        ('Login Streak', 'Login for 7 consecutive days', 'login_streak', '🔥', 7, 'days_streak', 3000, 'Loyal Trader', true),
        ('Volume Trader', 'Trade 1000 coins in total', 'volume_reward', '📈', 1000, 'volume', 5000, 'Volume Master', true)
    """)
    
    print("=== Complete Database Schema Created Successfully ===")

def downgrade() -> None:
    """Downgrade schema - drop all tables."""
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_table('purchases')
    op.drop_table('demo_coin_packages')
    op.drop_table('user_login_streaks')
    op.drop_table('leaderboard_entries')
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('wallet_transactions')
    op.drop_table('trades')
    op.drop_table('users')
    
    print("=== All Tables Dropped Successfully ===")
