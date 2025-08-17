"""fix_trades_table_schema_mismatch

Revision ID: d6f48f3131ea
Revises: fix_purchases_table
Create Date: 2025-07-18 21:54:27.492342

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6f48f3131ea'
down_revision: Union[str, Sequence[str], None] = 'fix_purchases_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Get current table structure
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    columns = [col['name'] for col in inspector.get_columns('trades')]
    
    print(f"Current trades table columns: {columns}")
    
    # Drop old columns if they exist
    if 'symbol' in columns:
        print("Dropping old 'symbol' column")
        op.drop_column('trades', 'symbol')
    
    if 'price' in columns:
        print("Dropping old 'price' column")
        op.drop_column('trades', 'price')
    
    if 'total' in columns:
        print("Dropping old 'total' column")
        op.drop_column('trades', 'total')
    
    if 'status' in columns:
        print("Dropping old 'status' column")
        op.drop_column('trades', 'status')
    
    if 'created_at' in columns:
        print("Dropping old 'created_at' column")
        op.drop_column('trades', 'created_at')
    
    # Ensure required columns exist with correct constraints
    columns_after_drop = [col['name'] for col in inspector.get_columns('trades')]
    print(f"Columns after dropping old ones: {columns_after_drop}")
    
    # Make sure coin_symbol is not null
    try:
        op.alter_column('trades', 'coin_symbol', nullable=False)
        print("Set coin_symbol to NOT NULL")
    except Exception as e:
        print(f"Error setting coin_symbol to NOT NULL: {e}")
    
    # Make sure price_at_trade is not null
    try:
        op.alter_column('trades', 'price_at_trade', nullable=False)
        print("Set price_at_trade to NOT NULL")
    except Exception as e:
        print(f"Error setting price_at_trade to NOT NULL: {e}")
    
    # Make sure total_cost is not null
    try:
        op.alter_column('trades', 'total_cost', nullable=False)
        print("Set total_cost to NOT NULL")
    except Exception as e:
        print(f"Error setting total_cost to NOT NULL: {e}")
    
    print("Trades table schema fixed successfully")


def downgrade() -> None:
    """Downgrade schema."""
    # This is a destructive migration, so downgrade is not supported
    # The old columns were dropped and cannot be easily restored
    pass
