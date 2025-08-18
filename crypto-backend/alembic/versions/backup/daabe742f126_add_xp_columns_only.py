"""Add XP columns only

Revision ID: daabe742f126
Revises: 23f382e180c8
Create Date: 2025-07-23 04:21:21.386553

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'daabe742f126'
down_revision: Union[str, Sequence[str], None] = '23f382e180c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Check if XP columns already exist before adding them
    connection = op.get_bind()
    
    # Check if level column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'level'
    """))
    if not result.fetchone():
        op.add_column('users', sa.Column('level', sa.Integer(), nullable=False, server_default='1'))
    
    # Check if xp column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'xp'
    """))
    if not result.fetchone():
        op.add_column('users', sa.Column('xp', sa.Integer(), nullable=False, server_default='0'))
    
    # Check if xp_first_gain_awarded column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'xp_first_gain_awarded'
    """))
    if not result.fetchone():
        op.add_column('users', sa.Column('xp_first_gain_awarded', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    
    # Check if xp_lost_all_awarded column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'xp_lost_all_awarded'
    """))
    if not result.fetchone():
        op.add_column('users', sa.Column('xp_lost_all_awarded', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    
    # Check if xp_best_rank column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'xp_best_rank'
    """))
    if not result.fetchone():
        op.add_column('users', sa.Column('xp_best_rank', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove XP columns from users table (only if they exist)
    connection = op.get_bind()
    
    # Check if columns exist before dropping them
    columns_to_drop = ['xp_best_rank', 'xp_lost_all_awarded', 'xp_first_gain_awarded', 'xp', 'level']
    
    for column in columns_to_drop:
        result = connection.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = '{column}'
        """))
        if result.fetchone():
            op.drop_column('users', column)
