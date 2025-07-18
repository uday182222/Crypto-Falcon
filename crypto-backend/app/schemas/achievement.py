from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from app.models.achievement import AchievementType

class AchievementResponse(BaseModel):
    """Response model for individual achievement"""
    id: int
    name: str
    description: str
    type: AchievementType
    icon: str
    requirement_value: Decimal
    requirement_type: str
    reward_coins: Decimal
    reward_title: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserAchievementResponse(BaseModel):
    """Response model for user's achievement progress"""
    id: int
    user_id: int
    achievement_id: int
    current_progress: Decimal
    is_completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    # Include achievement details
    achievement: AchievementResponse
    
    class Config:
        orm_mode = True

class UserAchievementSummary(BaseModel):
    """Summary model for user's achievement progress"""
    achievement_id: int
    name: str
    description: str
    type: AchievementType
    icon: str
    current_progress: Decimal
    requirement_value: Decimal
    requirement_type: str
    progress_percentage: Decimal
    is_completed: bool
    reward_coins: Decimal
    reward_title: Optional[str] = None
    completed_at: Optional[datetime] = None

class LoginStreakResponse(BaseModel):
    """Response model for user's login streak"""
    user_id: int
    current_streak: int
    longest_streak: int
    last_login_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class UserAchievementsResponse(BaseModel):
    """Response model for user's all achievements"""
    user_id: int
    username: str
    total_achievements: int
    completed_achievements: int
    completion_percentage: Decimal
    total_reward_coins_earned: Decimal
    login_streak: Optional[LoginStreakResponse] = None
    achievements: List[UserAchievementSummary]

class AchievementRewardResponse(BaseModel):
    """Response model for achievement reward notification"""
    achievement_id: int
    name: str
    description: str
    reward_coins: Decimal
    reward_title: Optional[str] = None
    new_balance: Decimal
    message: str

class AchievementStatsResponse(BaseModel):
    """Response model for achievement statistics"""
    total_achievements: int
    total_users_with_achievements: int
    most_earned_achievement: Optional[AchievementResponse] = None
    rarest_achievement: Optional[AchievementResponse] = None
    average_completion_rate: Decimal
    total_rewards_distributed: Decimal 