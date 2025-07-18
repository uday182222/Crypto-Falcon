"""add missing tables

Revision ID: add_missing_tables
Revises: update_trades_table
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_missing_tables'
down_revision = 'update_trades_table'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    # Create user_login_streaks table
    op.create_table('user_login_streaks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_login_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_login_streaks_user_id'), 'user_login_streaks', ['user_id'], unique=True)
    op.create_index(op.f('ix_user_login_streaks_id'), 'user_login_streaks', ['id'], unique=False)
    
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
    op.create_index(op.f('ix_demo_coin_packages_id'), 'demo_coin_packages', ['id'], unique=False)
    
    # Insert default demo coin packages
    op.execute("""
        INSERT INTO demo_coin_packages (name, description, price, coins_per_inr, bonus_percentage, is_active) VALUES
        ('Starter Pack', 'Perfect for beginners', 99.00, 1000.00, 0, true),
        ('Pro Pack', 'Great value for active traders', 499.00, 5500.00, 10, true),
        ('Elite Pack', 'Maximum value for serious traders', 999.00, 12000.00, 20, true)
    """)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_demo_coin_packages_id'), table_name='demo_coin_packages')
    op.drop_table('demo_coin_packages')
    op.drop_index(op.f('ix_user_login_streaks_id'), table_name='user_login_streaks')
    op.drop_index(op.f('ix_user_login_streaks_user_id'), table_name='user_login_streaks')
    op.drop_table('user_login_streaks') 