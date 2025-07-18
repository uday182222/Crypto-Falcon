from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import List, Optional, Dict, Any

class LeaderboardEntryResponse(BaseModel):
    """Response model for individual leaderboard entry"""
    user_id: int
    username: str
    
    # Portfolio metrics
    total_portfolio_value: Decimal
    total_invested: Decimal
    total_profit_loss: Decimal
    total_profit_loss_percent: Decimal
    
    # Performance metrics
    current_demo_balance: Decimal
    initial_balance: Decimal
    portfolio_performance_percent: Decimal
    
    # Trading stats
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_percent: Decimal
    
    # Ranking
    global_rank: Optional[int] = None
    weekly_rank: Optional[int] = None
    
    # Timestamps
    last_updated: datetime
    week_start: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class GlobalLeaderboardResponse(BaseModel):
    """Response model for global leaderboard"""
    total_users: int
    leaderboard: List[LeaderboardEntryResponse]
    last_updated: datetime
    
class WeeklyLeaderboardResponse(BaseModel):
    """Response model for weekly leaderboard"""
    total_users: int
    week_start: datetime
    week_end: datetime
    leaderboard: List[LeaderboardEntryResponse]

class LeaderboardStatsResponse(BaseModel):
    """Response model for leaderboard statistics"""
    total_traders: int
    active_today: int
    top_performer: Dict[str, Any]
    average_portfolio_value: float
    total_trades_today: int
    
class UserRankResponse(BaseModel):
    """Response model for user's ranking information"""
    user_id: int
    username: str
    global_rank: Optional[int] = None
    weekly_rank: Optional[int] = None
    portfolio_performance_percent: Decimal
    total_users: int
    percentile: Decimal  # Top X% of users 