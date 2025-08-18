"""fix purchases table

Revision ID: fix_purchases_table
Revises: 7b574d379658
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_purchases_table'
down_revision = '7b574d379658'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    # Check if purchases table exists, if not create it
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    tables = inspector.get_table_names()
    
    if 'purchases' not in tables:
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
        op.create_index(op.f('ix_purchases_id'), 'purchases', ['id'], unique=False)
        op.create_index(op.f('ix_purchases_user_id'), 'purchases', ['user_id'], unique=False)
        op.create_index(op.f('ix_purchases_razorpay_order_id'), 'purchases', ['razorpay_order_id'], unique=True)
        print("Created purchases table")
    else:
        print("Purchases table already exists")
    
    # Create achievements table if it doesn't exist
    if 'achievements' not in tables:
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
        op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
        print("Created achievements table")
    else:
        print("Achievements table already exists")
    
    # Create user_achievements table if it doesn't exist
    if 'user_achievements' not in tables:
        op.create_table('user_achievements',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('achievement_id', sa.Integer(), nullable=False),
            sa.Column('current_progress', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
            sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)
        op.create_index(op.f('ix_user_achievements_user_id'), 'user_achievements', ['user_id'], unique=False)
        op.create_index(op.f('ix_user_achievements_achievement_id'), 'user_achievements', ['achievement_id'], unique=False)
        print("Created user_achievements table")
    else:
        print("User_achievements table already exists")
    
    # Insert default achievements if achievements table is empty
    try:
        achievement_count = op.get_bind().execute(sa.text("SELECT COUNT(*) FROM achievements")).scalar()
        if achievement_count == 0:
            op.execute("""
                INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
                                    ('First Trade', 'Complete your first trade', 'trading_milestone', '🎯', 1, 'trades', 1000, 'Trader', true),
                                    ('Profit Master', 'Make 10% profit on a trade', 'profit_achievement', '💰', 10, 'profit_percent', 2000, 'Profit Hunter', true),
                    ('Diversifier', 'Hold 5 different cryptocurrencies', 'diversification', '📊', 5, 'coins_held', 1500, 'Diversifier', true),
                    ('Login Streak', 'Login for 7 consecutive days', 'login_streak', '🔥', 7, 'days_streak', 3000, 'Loyal Trader', true),
                    ('Volume Trader', 'Trade 1000 coins in total', 'volume_reward', '📈', 1000, 'volume', 5000, 'Volume Master', true)
            """)
            print("Inserted default achievements")
    except Exception as e:
        print(f"Error inserting default achievements: {e}")

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_achievements_achievement_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_user_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_table('user_achievements')
    op.drop_index(op.f('ix_achievements_id'), table_name='achievements')
    op.drop_table('achievements')
    op.drop_index(op.f('ix_purchases_razorpay_order_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_user_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_id'), table_name='purchases')
    op.drop_table('purchases') 