#!/usr/bin/env python3
"""
Script to fix alembic migration issues
"""

import os
from sqlalchemy import create_engine, text

def fix_migration():
    """Fix the alembic migration issue"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL not found in environment")
            return
        
        # Create engine
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check current version
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            current_version = result.scalar()
            print(f"Current version in database: {current_version}")
            
            # Update to the correct version
            if current_version == "080547417010":
                conn.execute(text("UPDATE alembic_version SET version_num = '4b21ee4b95d9'"))
                conn.commit()
                print("✅ Updated alembic version to 4b21ee4b95d9")
            else:
                print(f"Current version is {current_version}, no update needed")
                
    except Exception as e:
        print(f"❌ Error fixing migration: {e}")

if __name__ == "__main__":
    print("🔧 Fixing alembic migration issue...")
    fix_migration() 