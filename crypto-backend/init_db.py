#!/usr/bin/env python3
"""
Simple database initialization script for MotionFalcon
Creates basic tables needed for testing
"""

import sqlite3
import os
from datetime import datetime
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def init_database():
    """Initialize the database with basic tables"""
    
    # Database file path
    db_path = "motionfalcon_local.db"
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    # Create new database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Creating database tables...")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            demo_balance REAL DEFAULT 100000.0,
            preferred_currency TEXT DEFAULT 'USD',
            is_active BOOLEAN DEFAULT 1,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            xp_first_gain_awarded BOOLEAN DEFAULT 0,
            xp_lost_all_awarded BOOLEAN DEFAULT 0,
            xp_best_rank BOOLEAN DEFAULT 0,
            bio TEXT,
            location TEXT,
            website TEXT,
            phone TEXT,
            preferences TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✓ Created users table")
    
    # Create demo_coin_packages table
    cursor.execute("""
        CREATE TABLE demo_coin_packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            coins_per_inr REAL NOT NULL,
            bonus_percentage REAL DEFAULT 0.0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✓ Created demo_coin_packages table")
    
    # Create purchases table
    cursor.execute("""
        CREATE TABLE purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            package_id INTEGER,
            amount REAL NOT NULL,
            coins_received INTEGER NOT NULL,
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (package_id) REFERENCES demo_coin_packages (id)
        )
    """)
    print("✓ Created purchases table")
    
    # Create wallet_transactions table
    cursor.execute("""
        CREATE TABLE wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            total REAL NOT NULL,
            coin TEXT DEFAULT 'USD',
            category TEXT DEFAULT 'wallet',
            status TEXT DEFAULT 'completed',
            payment_id TEXT,
            order_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    print("✓ Created wallet_transactions table")
    
    # Insert sample data
    print("\nInserting sample data...")
    
    # Create a test user with properly hashed password
    test_password = "test123"
    hashed_password = get_password_hash(test_password)
    
    cursor.execute("""
        INSERT INTO users (username, email, hashed_password, demo_balance, level, xp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("testuser", "test@example.com", hashed_password, 731136.932, 5, 250))
    
    user_id = cursor.lastrowid
    print(f"✓ Created test user with ID: {user_id}")
    print(f"🔑 Test credentials: test@example.com / {test_password}")
    
    # Create sample packages
    cursor.execute("""
        INSERT INTO demo_coin_packages (name, description, price, coins_per_inr, bonus_percentage)
        VALUES (?, ?, ?, ?, ?)
    """, ("Starter Pack", "Get started with DemoCoins", 100000.0, 50, 10.0))
    
    cursor.execute("""
        INSERT INTO demo_coin_packages (name, description, price, coins_per_inr, bonus_percentage)
        VALUES (?, ?, ?, ?, ?)
    """, ("Premium Pack", "Premium DemoCoins package", 200000.0, 50, 20.0))
    
    print("✓ Created sample packages")
    
    # Create sample purchases
    cursor.execute("""
        INSERT INTO purchases (user_id, package_id, amount, coins_received, status, razorpay_order_id, razorpay_payment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, 1, 100000.0, 5000000, "completed", "ORD_001", "PAY_001"))
    
    cursor.execute("""
        INSERT INTO purchases (user_id, package_id, amount, coins_received, status, razorpay_order_id, razorpay_payment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, 2, 200000.0, 10000000, "completed", "ORD_002", "PAY_002"))
    
    print("✓ Created sample purchases")
    
    # Create sample wallet transactions
    cursor.execute("""
        INSERT INTO wallet_transactions (user_id, type, amount, total, coin, category, status, payment_id, order_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "package", 100000, 100000, "USD", "wallet", "completed", "PAY_001", "ORD_001"))
    
    cursor.execute("""
        INSERT INTO wallet_transactions (user_id, type, amount, total, coin, category, status, payment_id, order_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "package", 200000, 200000, "USD", "wallet", "completed", "PAY_002", "ORD_002"))
    
    cursor.execute("""
        INSERT INTO wallet_transactions (user_id, type, amount, total, coin, category, status, payment_id, order_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "package", 200000, 200000, "USD", "wallet", "completed", "PAY_003", "ORD_003"))
    
    cursor.execute("""
        INSERT INTO wallet_transactions (user_id, type, amount, total, coin, category, status, payment_id, order_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "package", 150000, 150000, "USD", "wallet", "completed", "PAY_004", "ORD_004"))
    
    print("✓ Created sample wallet transactions")
    
    # Commit changes and close
    conn.commit()
    conn.close()
    
    print(f"\n✅ Database initialized successfully: {db_path}")
    print(f"📊 Test user: testuser (ID: {user_id})")
    print(f"💰 Demo balance: $731,136.932")
    print(f"📦 Sample transactions: 4 completed")

if __name__ == "__main__":
    init_database()
