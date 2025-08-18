"""Reset migration state and create all tables from scratch

Revision ID: reset_and_create_all_tables
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'reset_and_create_all_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema - create all tables from scratch."""
    
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
    
    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_id', sa.Integer(), nullable=False),
        sa.Column('current_progress', sa.Numeric(20, 8), nullable=False, server_default='0'),
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
    
    # Create indexes for demo_coin_packages
    op.create_index(op.f('ix_demo_coin_packages_id'), 'demo_coin_packages', ['id'], unique=False)
    
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
    
    # Insert default demo coin packages
    op.execute("""
        INSERT INTO demo_coin_packages (name, description, price, coins_per_inr, bonus_percentage, is_active) VALUES
        ('Starter Pack', 'Perfect for beginners', 99.00, 1000.00, 0, true),
        ('Pro Pack', 'Great value for active traders', 499.00, 5500.00, 10, true),
        ('Elite Pack', 'Maximum value for serious traders', 999.00, 12000.00, 20, true)
    """)
    
    # Insert default achievements with correct enum values
    op.execute("""
        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
        ('First Trade', 'Complete your first trade', 'trading_milestone', 'first-trade', 1, 'trades', 1000, 'Trader', true),
        ('Profit Maker', 'Make your first profit', 'profit_achievement', 'profit', 1, 'profit_percent', 2000, 'Profit Seeker', true),
        ('Diversified Portfolio', 'Hold 5 different cryptocurrencies', 'diversification', 'diversify', 5, 'coins_held', 3000, 'Diversifier', true),
        ('Login Streak', 'Login for 7 consecutive days', 'login_streak', 'streak', 7, 'days_streak', 1500, 'Dedicated', true),
        ('Volume Trader', 'Trade with total volume of 10000', 'volume_reward', 'volume', 10000, 'volume', 5000, 'Volume Master', true)
    """)

def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index(op.f('ix_purchases_razorpay_order_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_user_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_id'), table_name='purchases')
    op.drop_index(op.f('ix_demo_coin_packages_id'), table_name='demo_coin_packages')
    op.drop_index(op.f('ix_user_login_streaks_user_id'), table_name='user_login_streaks')
    op.drop_index(op.f('ix_user_login_streaks_id'), table_name='user_login_streaks')
    op.drop_index(op.f('ix_user_achievements_achievement_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_user_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_leaderboard_entries_weekly_rank'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_global_rank'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_user_id'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_id'), table_name='leaderboard_entries')
    
    # Drop tables
    op.drop_table('purchases')
    op.drop_table('demo_coin_packages')
    op.drop_table('user_login_streaks')
    op.drop_table('user_achievements')
    op.drop_table('leaderboard_entries')
