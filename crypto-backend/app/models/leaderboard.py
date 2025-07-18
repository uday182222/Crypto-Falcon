from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String, nullable=False)  # Denormalized for faster queries
    
    # Portfolio metrics
    total_portfolio_value = Column(Numeric(20, 8), nullable=False)
    total_invested = Column(Numeric(20, 8), nullable=False)
    total_profit_loss = Column(Numeric(20, 8), nullable=False)
    total_profit_loss_percent = Column(Numeric(10, 4), nullable=False)
    
    # Additional metrics
    current_demo_balance = Column(Numeric(20, 8), nullable=False)
    initial_balance = Column(Numeric(20, 8), default=100000.0, nullable=False)
    portfolio_performance_percent = Column(Numeric(10, 4), nullable=False)  # ((current_demo_balance + total_portfolio_value) / initial_balance - 1) * 100
    
    # Trading stats
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    win_rate_percent = Column(Numeric(10, 4), default=0.0)
    
    # Ranking
    global_rank = Column(Integer, nullable=True)
    weekly_rank = Column(Integer, nullable=True)
    
    # Timestamps
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    week_start = Column(DateTime(timezone=True), nullable=True)  # For weekly leaderboard
    
    # Relationship to user
    user = relationship("User", back_populates="leaderboard_entries")
    
    def __repr__(self):
        return f"<LeaderboardEntry(user_id={self.user_id}, username={self.username}, performance={self.portfolio_performance_percent}%)>" 