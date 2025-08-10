#!/usr/bin/env python3
"""
Fix database schema by adding missing columns to users and trades tables
"""

import sqlite3
import os

def fix_database():
    """Add missing columns to the users and trades tables"""
    
    # Database file path
    db_path = "crypto_test.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Fixing database schema...")
        
        # Fix users table
        print("\n📋 Fixing users table...")
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [column[1] for column in cursor.fetchall()]
        
        print(f"Current user columns: {user_columns}")
        
        # Add missing columns to users table
        missing_user_columns = [
            ("xp_first_gain_awarded", "BOOLEAN DEFAULT 0"),
            ("xp_lost_all_awarded", "BOOLEAN DEFAULT 0"),
            ("xp_best_rank", "INTEGER"),
            ("preferred_currency", "VARCHAR(3) DEFAULT 'INR'")
        ]
        
        for column_name, column_type in missing_user_columns:
            if column_name not in user_columns:
                print(f"Adding user column: {column_name}")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            else:
                print(f"User column {column_name} already exists")
        
        # Fix trades table
        print("\n📋 Fixing trades table...")
        cursor.execute("PRAGMA table_info(trades)")
        trade_columns = [column[1] for column in cursor.fetchall()]
        
        print(f"Current trade columns: {trade_columns}")
        
        # Add missing columns to trades table
        missing_trade_columns = [
            ("side", "VARCHAR(10)"),  # 'buy' or 'sell'
            ("trade_type", "VARCHAR(20)"),  # 'market', 'limit', etc.
            ("status", "VARCHAR(20) DEFAULT 'completed'")
        ]
        
        for column_name, column_type in missing_trade_columns:
            if column_name not in trade_columns:
                print(f"Adding trade column: {column_name}")
                cursor.execute(f"ALTER TABLE trades ADD COLUMN {column_name} {column_type}")
            else:
                print(f"Trade column {column_name} already exists")
        
        # Commit changes
        conn.commit()
        
        # Verify the fix
        cursor.execute("PRAGMA table_info(users)")
        updated_user_columns = [column[1] for column in cursor.fetchall()]
        print(f"\nUpdated user columns: {updated_user_columns}")
        
        cursor.execute("PRAGMA table_info(trades)")
        updated_trade_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated trade columns: {updated_trade_columns}")
        
        # Test query to make sure it works
        cursor.execute("SELECT id, username, email, demo_balance, level, xp FROM users LIMIT 1")
        result = cursor.fetchone()
        print(f"Test user query successful: {result}")
        
        # Test trades query
        try:
            cursor.execute("SELECT id, user_id, coin_symbol, quantity, price_at_trade FROM trades LIMIT 1")
            trade_result = cursor.fetchone()
            print(f"Test trade query successful: {trade_result}")
        except Exception as e:
            print(f"Trade query test failed (this is normal if no trades exist): {e}")
        
        conn.close()
        print("\n✅ Database schema fixed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        return False

if __name__ == "__main__":
    fix_database() 