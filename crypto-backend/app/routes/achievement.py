from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.services.achievement_service import AchievementService
from app.schemas.achievement import (
    AchievementResponse,
    UserAchievementResponse,
    UserAchievementsResponse,
    AchievementRewardResponse,
    LoginStreakResponse,
    AchievementStatsResponse
)

router = APIRouter(prefix="/achievements", tags=["achievements"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[AchievementResponse])
async def get_all_achievements(
    db: Session = Depends(get_db)
):
    """Get all available achievements"""
    achievement_service = AchievementService(db)
    achievements = achievement_service.get_all_achievements()
    
    return [AchievementResponse.from_orm(achievement) for achievement in achievements]

@router.get("/user", response_model=UserAchievementsResponse)
async def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's achievement progress"""
    achievement_service = AchievementService(db)
    
    # Initialize achievements for user if not exists
    achievement_service.initialize_user_achievements(current_user)
    
    # Get comprehensive achievement summary
    summary = achievement_service.get_user_achievements_summary(current_user)
    
    return UserAchievementsResponse(**summary)

@router.post("/check", response_model=List[AchievementRewardResponse])
async def check_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check and award new achievements for user"""
    achievement_service = AchievementService(db)
    
    # Check for new achievements
    new_achievements = await achievement_service.check_and_award_achievements(current_user)
    
    return new_achievements

@router.post("/login-streak", response_model=LoginStreakResponse)
async def update_login_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's login streak"""
    achievement_service = AchievementService(db)
    
    # Update login streak
    await achievement_service.update_login_streak(current_user)
    
    # Get updated login streak
    from app.models.achievement import UserLoginStreak
    login_streak = db.query(UserLoginStreak).filter(
        UserLoginStreak.user_id == current_user.id
    ).first()
    
    if not login_streak:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update login streak"
        )
    
    return LoginStreakResponse.from_orm(login_streak)

@router.get("/stats", response_model=AchievementStatsResponse)
async def get_achievement_stats(
    db: Session = Depends(get_db)
):
    """Get overall achievement statistics"""
    achievement_service = AchievementService(db)
    stats = achievement_service.get_achievement_stats()
    
    # Convert to response format
    most_earned = None
    rarest = None
    
    if stats.get('most_earned_achievement'):
        most_earned = AchievementResponse.from_orm(stats['most_earned_achievement'])
    
    if stats.get('rarest_achievement'):
        rarest = AchievementResponse.from_orm(stats['rarest_achievement'])
    
    return AchievementStatsResponse(
        total_achievements=stats.get('total_achievements', 0),
        total_users_with_achievements=stats.get('total_users_with_achievements', 0),
        most_earned_achievement=most_earned,
        rarest_achievement=rarest,
        average_completion_rate=stats.get('average_completion_rate', 0),
        total_rewards_distributed=stats.get('total_rewards_distributed', 0)
    )

@router.post("/initialize")
async def initialize_achievements(
    db: Session = Depends(get_db)
):
    """Initialize default achievements in database"""
    achievement_service = AchievementService(db)
    
    try:
        achievement_service.initialize_default_achievements()
        return {"message": "Achievements initialized successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize achievements: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=UserAchievementsResponse)
async def get_user_achievements_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get achievement progress for a specific user (public endpoint)"""
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    achievement_service = AchievementService(db)
    
    # Get comprehensive achievement summary
    summary = achievement_service.get_user_achievements_summary(user)
    
    return UserAchievementsResponse(**summary) 