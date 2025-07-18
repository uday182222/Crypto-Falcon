"""create_initial_tables

Revision ID: 4b21ee4b95d9
Revises: 
Create Date: 2025-07-18 18:54:23.578508

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b21ee4b95d9'
down_revision: Union[str, Sequence[str], None] = '080547417010'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('demo_balance', sa.Numeric(precision=20, scale=8), nullable=False, server_default='100000.0'),
        sa.Column('preferred_currency', sa.String(3), nullable=False, server_default='INR'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for users
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create wallets table
    op.create_table('wallets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('balance', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for wallets
    op.create_index(op.f('ix_wallets_user_id'), 'wallets', ['user_id'], unique=True)
    op.create_index(op.f('ix_wallets_id'), 'wallets', ['id'], unique=False)
    
    # Create trades table
    op.create_table('trades',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=False),
        sa.Column('side', sa.String(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('price', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('total', sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for trades
    op.create_index(op.f('ix_trades_id'), 'trades', ['id'], unique=False)
    op.create_index(op.f('ix_trades_user_id'), 'trades', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes for trades
    op.drop_index(op.f('ix_trades_user_id'), table_name='trades')
    op.drop_index(op.f('ix_trades_id'), table_name='trades')
    
    # Drop indexes for wallets
    op.drop_index(op.f('ix_wallets_id'), table_name='wallets')
    op.drop_index(op.f('ix_wallets_user_id'), table_name='wallets')
    
    # Drop indexes for users
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    
    # Drop tables in reverse order (due to foreign key constraints)
    op.drop_table('trades')
    op.drop_table('wallets')
    op.drop_table('users')
