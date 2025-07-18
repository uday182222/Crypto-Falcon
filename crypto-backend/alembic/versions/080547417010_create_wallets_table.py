"""create_wallets_table

Revision ID: 080547417010
Revises: 82816b7c7440
Create Date: 2025-07-18 05:18:58.667778

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '080547417010'
down_revision: Union[str, Sequence[str], None] = '82816b7c7440'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
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


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index(op.f('ix_wallets_id'), table_name='wallets')
    op.drop_index(op.f('ix_wallets_user_id'), table_name='wallets')
    
    # Drop wallets table
    op.drop_table('wallets')
