from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    demo_balance = Column(Numeric(20, 8), default=100000.0, nullable=False)
    preferred_currency = Column(String(3), default='USD', nullable=False)
    is_active = Column(Boolean, default=True)
    level = Column(Integer, default=1, nullable=False)  # XP system: user level
    xp = Column(Integer, default=0, nullable=False)     # XP system: experience points
    xp_first_gain_awarded = Column(Boolean, default=False, nullable=False)  # XP milestone: first gain
    xp_lost_all_awarded = Column(Boolean, default=False, nullable=False)    # XP milestone: lost all demo
    xp_best_rank = Column(Integer, nullable=True)                          # XP milestone: best leaderboard rank
    
    # Additional profile fields
    bio = Column(String(500), nullable=True)
    location = Column(String(100), nullable=True)
    website = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # User preferences (stored as JSON)
    preferences = Column(String(1000), nullable=True)  # JSON string for storing preferences
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to trades
    trades = relationship("Trade", back_populates="user")
    
    # Relationship to leaderboard entries
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user")
    
    # Relationship to purchases
    purchases = relationship("Purchase", back_populates="user")
    
    # Relationship to achievements
    user_achievements = relationship("UserAchievement", back_populates="user")
    login_streak = relationship("UserLoginStreak", back_populates="user", uselist=False)
    
    # Relationship to wallet
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    
    # Relationship to wallet transactions
    wallet_transactions = relationship("WalletTransaction", back_populates="user") 