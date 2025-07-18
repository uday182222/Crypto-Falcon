#!/usr/bin/env python3
"""
Script to check if a user exists in the database
DOES NOT reveal passwords - only checks existence and shows username
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User

def check_user_exists(email):
    """Check if user exists and show basic info (no password)"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL not found in environment")
            return
        
        # Create engine and session
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Query for user
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"✅ User found!")
            print(f"   Email: {user.email}")
            print(f"   Username: {user.username}")
            print(f"   Account created: {user.created_at}")
            print(f"   Account active: {user.is_active}")
            print(f"   Demo balance: {user.demo_balance}")
            print("\n💡 To reset password:")
            print("   1. Go to /forgot-password")
            print("   2. Enter this email")
            print("   3. Check backend logs for reset token")
        else:
            print(f"❌ No user found with email: {email}")
            print("\n💡 You can create a new account at /register")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    email = "mukhiyalegend@gmail.com"
    print(f"🔍 Checking for user: {email}")
    print("=" * 50)
    check_user_exists(email) 