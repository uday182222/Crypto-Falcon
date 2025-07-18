"""Fix achievement enum type

Revision ID: fix_achievement_enum
Revises: fix_purchases_table
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_achievement_enum'
down_revision = 'fix_purchases_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""
    # First, update existing data to use uppercase values
    op.execute("""
        UPDATE achievements 
        SET type = CASE 
            WHEN type = 'trading_milestone' THEN 'TRADING_MILESTONE'
            WHEN type = 'profit_achievement' THEN 'PROFIT_ACHIEVEMENT'
            WHEN type = 'diversification' THEN 'DIVERSIFICATION'
            WHEN type = 'login_streak' THEN 'LOGIN_STREAK'
            WHEN type = 'volume_reward' THEN 'VOLUME_REWARD'
            ELSE type
        END
    """)
    
    # Drop the old enum type and recreate with correct values
    op.execute("DROP TYPE IF EXISTS achievementtype CASCADE")
    
    # Create the enum with correct uppercase values
    achievement_type = postgresql.ENUM('TRADING_MILESTONE', 'PROFIT_ACHIEVEMENT', 'DIVERSIFICATION', 'LOGIN_STREAK', 'VOLUME_REWARD', name='achievementtype')
    achievement_type.create(op.get_bind())
    
    # Update the achievements table to use the new enum
    op.execute("""
        ALTER TABLE achievements 
        ALTER COLUMN type TYPE achievementtype 
        USING type::text::achievementtype
    """)
    
    print("Fixed achievement enum type")


def downgrade() -> None:
    """Downgrade schema."""
    # First, update existing data to use lowercase values
    op.execute("""
        UPDATE achievements 
        SET type = CASE 
            WHEN type = 'TRADING_MILESTONE' THEN 'trading_milestone'
            WHEN type = 'PROFIT_ACHIEVEMENT' THEN 'profit_achievement'
            WHEN type = 'DIVERSIFICATION' THEN 'diversification'
            WHEN type = 'LOGIN_STREAK' THEN 'login_streak'
            WHEN type = 'VOLUME_REWARD' THEN 'volume_reward'
            ELSE type
        END
    """)
    
    # Recreate the old enum type
    op.execute("DROP TYPE IF EXISTS achievementtype CASCADE")
    
    # Create the old enum with lowercase values
    achievement_type = postgresql.ENUM('trading_milestone', 'profit_achievement', 'diversification', 'login_streak', 'volume_reward', name='achievementtype')
    achievement_type.create(op.get_bind())
    
    # Update the achievements table to use the old enum
    op.execute("""
        ALTER TABLE achievements 
        ALTER COLUMN type TYPE achievementtype 
        USING type::text::achievementtype
    """)
    
    print("Reverted achievement enum type") 