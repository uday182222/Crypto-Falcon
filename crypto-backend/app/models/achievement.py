from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class AchievementType(str, enum.Enum):
    TRADING_MILESTONE = "trading_milestone"
    PROFIT_ACHIEVEMENT = "profit_achievement" 
    DIVERSIFICATION = "diversification"
    LOGIN_STREAK = "login_streak"
    VOLUME_REWARD = "volume_reward"

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(SQLEnum(AchievementType), nullable=False)
    icon = Column(String(255), nullable=False)  # Icon identifier or URL
    
    # Achievement requirements
    requirement_value = Column(Numeric(20, 8), nullable=False)  # The target value to achieve
    requirement_type = Column(String(50), nullable=False)  # "trades", "profit_percent", "coins_held", "days_streak", "volume"
    
    # Rewards
    reward_coins = Column(Numeric(20, 8), default=0, nullable=False)  # DemoCoins reward
    reward_title = Column(String(255), nullable=True)  # Special title reward
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f"<Achievement(name={self.name}, type={self.type}, requirement={self.requirement_value})>"

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Progress tracking
    current_progress = Column(Numeric(20, 8), default=0, nullable=False)
    is_completed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id}, progress={self.current_progress}, completed={self.is_completed})>"

class UserLoginStreak(Base):
    __tablename__ = "user_login_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Streak tracking
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_login_date = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="login_streak")
    
    def __repr__(self):
        return f"<UserLoginStreak(user_id={self.user_id}, current_streak={self.current_streak}, longest_streak={self.longest_streak})>" 