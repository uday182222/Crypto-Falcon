"""stub_missing_revision

Revision ID: 2e2cd2f8b62c
Revises: 
Create Date: 2025-08-18 16:05:00.000000

This is a no-op stub migration to satisfy a missing revision reference
observed in production logs on Render. It allows the migration chain to
proceed by providing a valid starting point for subsequent revisions.
"""

from typing import Sequence, Union

from alembic import op  # noqa: F401  (imported for Alembic API completeness)
import sqlalchemy as sa  # noqa: F401

# revision identifiers, used by Alembic.
revision: str = '2e2cd2f8b62c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Intentionally no-op. This stub only exists to bridge a missing revision.
    pass


def downgrade() -> None:
    # Intentionally no-op to mirror upgrade.
    pass


