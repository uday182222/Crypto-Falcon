#!/usr/bin/env python3
"""
Simple database connection test script
Run this to test database connectivity
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_database_connection():
    """Test database connection step by step"""
    
    print("🔍 Testing Database Connection Step by Step")
    print("=" * 50)
    
    # 1. Check environment variables
    print("\n1. Environment Variables:")
    print(f"   ENVIRONMENT: {os.getenv('ENVIRONMENT', 'NOT SET')}")
    print(f"   RENDER: {os.getenv('RENDER', 'NOT SET')}")
    print(f"   DATABASE_URL: {'SET' if os.getenv('DATABASE_URL') else 'NOT SET'}")
    
    # 2. Load environment files
    print("\n2. Loading Environment Files:")
    try:
        if os.path.exists("env.local"):
            load_dotenv("env.local")
            print("   ✅ env.local loaded")
        else:
            print("   ❌ env.local not found")
            
        if os.path.exists("env.production"):
            load_dotenv("env.production")
            print("   ✅ env.production loaded")
        else:
            print("   ❌ env.production not found")
    except Exception as e:
        print(f"   ❌ Error loading env files: {e}")
    
    # 3. Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("\n❌ ERROR: DATABASE_URL not set!")
        return False
    
    print(f"\n3. Database URL: {database_url[:50]}...")
    
    # 4. Test engine creation
    print("\n4. Creating Database Engine:")
    try:
        if database_url.startswith("sqlite"):
            engine = create_engine(database_url, connect_args={"check_same_thread": False})
        else:
            engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_timeout=20,
                max_overflow=10
            )
        print("   ✅ Database engine created successfully")
    except Exception as e:
        print(f"   ❌ Error creating engine: {e}")
        return False
    
    # 5. Test connection
    print("\n5. Testing Connection:")
    try:
        with engine.connect() as conn:
            print("   ✅ Connection established")
            
            # Test simple query
            result = conn.execute(text("SELECT 1"))
            row = result.fetchone()
            print(f"   ✅ Query executed: {row}")
            
            # Test database info
            if not database_url.startswith("sqlite"):
                result = conn.execute(text("SELECT version()"))
                version = result.fetchone()
                print(f"   ✅ Database version: {version}")
            
            return True
            
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False

def test_session_creation():
    """Test if we can create database sessions"""
    print("\n6. Testing Session Creation:")
    
    try:
        from app.db import SessionLocal
        
        if SessionLocal:
            db = SessionLocal()
            print("   ✅ Session created successfully")
            db.close()
            print("   ✅ Session closed successfully")
            return True
        else:
            print("   ❌ SessionLocal not available")
            return False
            
    except Exception as e:
        print(f"   ❌ Session creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 MotionFalcon Database Connection Test")
    print("=" * 50)
    
    # Test basic connection
    connection_ok = test_database_connection()
    
    # Test session creation
    session_ok = test_session_creation()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY:")
    print(f"   Database Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"   Session Creation: {'✅ PASS' if session_ok else '❌ FAIL'}")
    
    if connection_ok and session_ok:
        print("\n🎉 All database tests passed!")
    else:
        print("\n🚨 Some database tests failed. Check the errors above.")
