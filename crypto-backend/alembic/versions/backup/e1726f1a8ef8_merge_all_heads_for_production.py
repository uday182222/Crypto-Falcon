"""merge_all_heads_for_production

Revision ID: e1726f1a8ef8
Revises: 2e2cd2f8b62c, reset_and_create_all_tables, update_trades_table
Create Date: 2025-08-18 15:27:58.405223

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1726f1a8ef8'
down_revision: Union[str, Sequence[str], None] = ('2e2cd2f8b62c', 'reset_and_create_all_tables', 'update_trades_table')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
