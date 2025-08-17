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
    # Check if the achievements table exists and has the correct enum type
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    tables = inspector.get_table_names()
    
    if 'achievements' in tables:
        # Check if the column type needs to be updated
        columns = inspector.get_columns('achievements')
        type_column = next((col for col in columns if col['name'] == 'type'), None)
        
        if type_column and 'achievementtype' in str(type_column['type']):
            # The enum type already exists and is correct, no action needed
            print("Achievement enum type is already correct")
        else:
            # Need to update the column type
            # Drop the old enum type if it exists
            op.execute("DROP TYPE IF EXISTS achievementtype CASCADE")
            
            # Create the enum with correct lowercase values
            achievement_type = postgresql.ENUM('trading_milestone', 'profit_achievement', 'diversification', 'login_streak', 'volume_reward', name='achievementtype')
            achievement_type.create(op.get_bind())
            
            # Update the achievements table to use the new enum
            op.execute("""
                ALTER TABLE achievements 
                ALTER COLUMN type TYPE achievementtype 
                USING type::text::achievementtype
            """)
            print("Updated achievement enum type")
    else:
        print("Achievements table does not exist, skipping enum fix")


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