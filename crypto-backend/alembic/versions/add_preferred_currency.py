"""add preferred currency to users

Revision ID: add_preferred_currency
Revises: 
Create Date: 2024-02-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_preferred_currency'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('preferred_currency', sa.String(3), nullable=False, server_default='INR'))

def downgrade():
    op.drop_column('users', 'preferred_currency') 