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
    # The enum values should match the model definition (lowercase)
    # No need to update existing data since the values are already correct
    
    # Drop the old enum type and recreate with correct lowercase values
    op.execute("DROP TYPE IF EXISTS achievementtype CASCADE")
    
    # Create the enum with correct lowercase values (matching the model)
    achievement_type = postgresql.ENUM('trading_milestone', 'profit_achievement', 'diversification', 'login_streak', 'volume_reward', name='achievementtype')
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
    # Since we're using lowercase values in both versions, no data update needed
    
    # Drop the current enum type
    op.execute("DROP TYPE IF EXISTS achievementtype CASCADE")
    
    # Recreate the enum with the same lowercase values
    achievement_type = postgresql.ENUM('trading_milestone', 'profit_achievement', 'diversification', 'login_streak', 'volume_reward', name='achievementtype')
    achievement_type.create(op.get_bind())
    
    # Update the achievements table to use the enum
    op.execute("""
        ALTER TABLE achievements 
        ALTER COLUMN type TYPE achievementtype 
        USING type::text::achievementtype
    """)
    
    print("Reverted achievement enum type") 