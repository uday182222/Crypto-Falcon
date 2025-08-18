"""update trades table structure

Revision ID: update_trades_table
Revises: fix_purchases_table
Create Date: 2024-12-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_trades_table'
down_revision = 'fix_purchases_table'
branch_labels = None
depends_on = None

def upgrade():
    # Add any missing columns to trades table
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    columns = [col['name'] for col in inspector.get_columns('trades')]
    
    # Add coin_symbol column if it doesn't exist
    if 'coin_symbol' not in columns:
        op.add_column('trades', sa.Column('coin_symbol', sa.String(length=10), nullable=True))
        # Update existing records to set coin_symbol to 'BTC' as default
        op.execute("UPDATE trades SET coin_symbol = 'BTC' WHERE coin_symbol IS NULL")
        op.alter_column('trades', 'coin_symbol', nullable=False)
    
    # Add price_at_trade column if it doesn't exist
    if 'price_at_trade' not in columns:
        op.add_column('trades', sa.Column('price_at_trade', sa.Numeric(precision=20, scale=8), nullable=True))
        # Update existing records to set price_at_trade to price as default
        op.execute("UPDATE trades SET price_at_trade = price WHERE price_at_trade IS NULL")
        op.alter_column('trades', 'price_at_trade', nullable=False)
    
    # Add total_cost column if it doesn't exist
    if 'total_cost' not in columns:
        op.add_column('trades', sa.Column('total_cost', sa.Numeric(precision=20, scale=8), nullable=True))
        # Update existing records to calculate total_cost
        op.execute("UPDATE trades SET total_cost = quantity * price_at_trade WHERE total_cost IS NULL")
        op.alter_column('trades', 'total_cost', nullable=False)
    
    # Add timestamp column if it doesn't exist
    if 'timestamp' not in columns:
        op.add_column('trades', sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    
    # Add indexes if they don't exist
    indexes = [idx['name'] for idx in inspector.get_indexes('trades')]
    
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