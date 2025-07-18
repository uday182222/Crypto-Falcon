"""add currency preference

Revision ID: add_currency_preference_123
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_currency_preference_123'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add preferred_currency column to users table with a default value
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(
            sa.Column('preferred_currency', sa.String(3), nullable=False, server_default='INR')
        )

def downgrade():
    # Remove preferred_currency column from users table
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('preferred_currency') 