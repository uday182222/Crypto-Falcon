"""merge heads

Revision ID: 82816b7c7440
Revises: update_trades_table, add_preferred_currency
Create Date: 2025-07-18 05:17:40.869718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82816b7c7440'
down_revision: Union[str, Sequence[str], None] = ('update_trades_table', 'add_preferred_currency')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
