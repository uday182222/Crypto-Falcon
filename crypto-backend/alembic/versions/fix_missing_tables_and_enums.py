"""fix missing tables and enums

Revision ID: fix_missing_tables_and_enums
Revises: add_missing_tables
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_missing_tables_and_enums'
down_revision = 'add_missing_tables'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    
    # Create leaderboard_entries table
    op.create_table('leaderboard_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        
        # Portfolio metrics
        sa.Column('total_portfolio_value', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_invested', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_profit_loss', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('total_profit_loss_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        
        # Additional metrics
        sa.Column('current_demo_balance', sa.Numeric(20, 8), nullable=False, server_default='100000'),
        sa.Column('initial_balance', sa.Numeric(20, 8), nullable=False, server_default='100000'),
        sa.Column('portfolio_performance_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        
        # Trading stats
        sa.Column('total_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('winning_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('losing_trades', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('win_rate_percent', sa.Numeric(10, 4), nullable=False, server_default='0'),
        
        # Ranking
        sa.Column('global_rank', sa.Integer(), nullable=True),
        sa.Column('weekly_rank', sa.Integer(), nullable=True),
        
        # Timestamps
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
        
        # Progress tracking
        sa.Column('current_progress', sa.Numeric(20, 8), nullable=False, server_default='0'),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        
        # Timestamps
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
    
    # Insert default achievements with correct enum values
    op.execute("""
        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
        ('First Trade', 'Complete your first trade', 'trading_milestone', 'first-trade', 1, 'trades', 1000, 'Trader', true),
        ('Profit Maker', 'Make your first profit', 'profit_achievement', 'profit', 1, 'profit_percent', 2000, 'Profit Seeker', true),
        ('Diversified Portfolio', 'Hold 5 different cryptocurrencies', 'diversification', 'diversify', 5, 'coins_held', 3000, 'Diversifier', true),
        ('Login Streak', 'Login for 7 consecutive days', 'login_streak', 'streak', 7, 'days_streak', 1500, 'Dedicated', true),
        ('Volume Trader', 'Trade with total volume of 10000', 'volume_reward', 'volume', 10000, 'volume', 5000, 'Volume Master', true)
    """)
    
    # Fix the user_login_streaks table to use DateTime instead of Date for last_login_date
    # First drop the existing table if it exists
    op.execute("DROP TABLE IF EXISTS user_login_streaks CASCADE")
    
    # Recreate with correct column types
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
    op.create_index(op.f('ix_user_login_streaks_user_id'), 'user_login_streaks', ['user_id'], unique=True)
    op.create_index(op.f('ix_user_login_streaks_id'), 'user_login_streaks', ['id'], unique=False)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_login_streaks_id'), table_name='user_login_streaks')
    op.drop_index(op.f('ix_user_login_streaks_user_id'), table_name='user_login_streaks')
    op.drop_table('user_login_streaks')
    
    op.drop_index(op.f('ix_user_achievements_achievement_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_user_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_table('user_achievements')
    
    op.drop_index(op.f('ix_leaderboard_entries_weekly_rank'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_global_rank'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_user_id'), table_name='leaderboard_entries')
    op.drop_index(op.f('ix_leaderboard_entries_id'), table_name='leaderboard_entries')
    op.drop_table('leaderboard_entries')
