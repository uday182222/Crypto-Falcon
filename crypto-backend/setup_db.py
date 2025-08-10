#!/usr/bin/env python3
"""
Simple database setup script for MotionFalcon
Creates all required tables without using Alembic migrations
"""

import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crypto_test.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    demo_balance = Column(Numeric(20, 8), default=100000.0, nullable=False)
    preferred_currency = Column(String(3), default="INR", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)

# Trade Model
class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    coin_symbol = Column(String, nullable=False)
    amount = Column(Numeric(20, 8), nullable=False)
    price_usd = Column(Numeric(20, 8), nullable=False)
    trade_type = Column(String, nullable=False)  # 'buy' or 'sell'
    created_at = Column(DateTime, default=datetime.utcnow)

# Wallet Model
class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)
    balance = Column(Numeric(20, 8), default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

# Achievement Model
class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    achievement_type = Column(String, nullable=False)
    achievement_name = Column(String, nullable=False)
    description = Column(Text)
    is_completed = Column(Boolean, default=False)
    progress = Column(Integer, default=0)
    progress_target = Column(Integer, default=1)
    xp_reward = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

# Leaderboard Model
class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)
    total_value = Column(Numeric(20, 8), default=0.0)
    weekly_gain = Column(Numeric(20, 8), default=0.0)
    rank = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def create_test_user():
    """Create a test user for testing"""
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("✅ Test user already exists")
            return
        
        # Create test user
        from app.auth import get_password_hash
        test_user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpass123"),
            demo_balance=100000.0,
            level=1,
            xp=0
        )
        db.add(test_user)
        db.commit()
        print("✅ Test user created: test@example.com / testpass123")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Setting up MotionFalcon database...")
    create_tables()
    create_test_user()
    print("🎉 Database setup complete!") 