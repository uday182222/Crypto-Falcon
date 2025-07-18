"""update trades table structure

Revision ID: update_trades_table
Revises: add_wallets_table
Create Date: 2024-12-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_trades_table'
down_revision = 'add_wallets_table'
branch_labels = None
depends_on = None

def upgrade():
    # Check if trades table exists, if not create it
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    if 'trades' not in inspector.get_table_names():
        # Create trades table with all required fields
        op.create_table('trades',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('coin_symbol', sa.String(length=10), nullable=False),
            sa.Column('side', sa.Enum('BUY', 'SELL', name='tradetype'), nullable=False),
            sa.Column('quantity', sa.Numeric(precision=20, scale=8), nullable=False),
            sa.Column('price_at_trade', sa.Numeric(precision=20, scale=8), nullable=False),
            sa.Column('total_cost', sa.Numeric(precision=20, scale=8), nullable=False),
            sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        
        # Create indexes
        op.create_index(op.f('ix_trades_id'), 'trades', ['id'], unique=False)
        op.create_index(op.f('ix_trades_user_id'), 'trades', ['user_id'], unique=False)
        op.create_index(op.f('ix_trades_coin_symbol'), 'trades', ['coin_symbol'], unique=False)
        op.create_index(op.f('ix_trades_timestamp'), 'trades', ['timestamp'], unique=False)
    else:
        # Add any missing columns if table exists
        columns = [col['name'] for col in inspector.get_columns('trades')]
        
        if 'total_cost' not in columns:
            op.add_column('trades', sa.Column('total_cost', sa.Numeric(precision=20, scale=8), nullable=True))
            # Update existing records to calculate total_cost
            op.execute("UPDATE trades SET total_cost = quantity * price_at_trade WHERE total_cost IS NULL")
            op.alter_column('trades', 'total_cost', nullable=False)
        
        if 'timestamp' not in columns:
            op.add_column('trades', sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
        
        # Add indexes if they don't exist
        indexes = [idx['name'] for idx in inspector.get_indexes('trades')]
        
        if 'ix_trades_user_id' not in indexes:
            op.create_index(op.f('ix_trades_user_id'), 'trades', ['user_id'], unique=False)
        
        if 'ix_trades_coin_symbol' not in indexes:
            op.create_index(op.f('ix_trades_coin_symbol'), 'trades', ['coin_symbol'], unique=False)
        
        if 'ix_trades_timestamp' not in indexes:
            op.create_index(op.f('ix_trades_timestamp'), 'trades', ['timestamp'], unique=False)

def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_trades_timestamp'), table_name='trades')
    op.drop_index(op.f('ix_trades_coin_symbol'), table_name='trades')
    op.drop_index(op.f('ix_trades_user_id'), table_name='trades')
    op.drop_index(op.f('ix_trades_id'), table_name='trades')
    
    # Drop trades table
    op.drop_table('trades') 