"""add wallets table

Revision ID: add_wallets_table
Revises: add_currency_preference_123
Create Date: 2024-12-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_wallets_table'
down_revision = 'add_currency_preference_123'
branch_labels = None
depends_on = None

def upgrade():
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
    
    # Create index on user_id for faster lookups
    op.create_index(op.f('ix_wallets_user_id'), 'wallets', ['user_id'], unique=True)
    
    # Create index on id for primary key lookups
    op.create_index(op.f('ix_wallets_id'), 'wallets', ['id'], unique=False)

def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_wallets_id'), table_name='wallets')
    op.drop_index(op.f('ix_wallets_user_id'), table_name='wallets')
    
    # Drop wallets table
    op.drop_table('wallets') 