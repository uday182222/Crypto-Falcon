"""Merge dummy patch and main head

Revision ID: 23f382e180c8
Revises: 080547417010, d6f48f3131ea
Create Date: 2025-07-22 21:13:22.554131

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '23f382e180c8'
down_revision: Union[str, Sequence[str], None] = ('080547417010', 'd6f48f3131ea')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
