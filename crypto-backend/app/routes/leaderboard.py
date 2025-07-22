from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.leaderboard import LeaderboardEntry
from app.services.leaderboard_service import LeaderboardService
from app.schemas.leaderboard import (
    LeaderboardEntryResponse,
    GlobalLeaderboardResponse,
    WeeklyLeaderboardResponse,
    LeaderboardStatsResponse
)

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/global", response_model=GlobalLeaderboardResponse)
async def get_global_leaderboard(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get global leaderboard ranked by overall portfolio performance"""
    
    leaderboard_service = LeaderboardService(db)
    
    # Get global leaderboard entries with real data
    entries = await leaderboard_service.get_global_leaderboard(limit=limit)
    
    # Convert to response format
    leaderboard_entries = [
        LeaderboardEntryResponse(**entry) 
        for entry in entries
    ]
    
    # Get total users count
    total_users = db.query(User).count()
    
    return GlobalLeaderboardResponse(
        total_users=total_users,
        leaderboard=leaderboard_entries,
        last_updated=datetime.utcnow()
    )

@router.get("/weekly", response_model=WeeklyLeaderboardResponse)
async def get_weekly_leaderboard(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get weekly leaderboard ranked by this week's performance"""
    
    leaderboard_service = LeaderboardService(db)
    
    # Get weekly leaderboard entries
    entries = await leaderboard_service.get_weekly_leaderboard(limit=limit)
    
    # Convert to response format
    leaderboard_entries = [
        LeaderboardEntryResponse(**entry) 
        for entry in entries
    ]
    
    # Get total users count
    total_users = db.query(User).count()
    
    return WeeklyLeaderboardResponse(
        total_users=total_users,
        week_start=datetime.utcnow(),
        week_end=datetime.utcnow(),
        leaderboard=leaderboard_entries
    )

@router.get("/my-rank")
async def get_my_rank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's rank in global and weekly leaderboards"""
    
    try:
        # Get current user from database to ensure it's attached to this session
        current_user = db.query(User).filter(User.id == current_user.id).first()
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's ranks directly from database
        entry = db.query(LeaderboardEntry).filter(LeaderboardEntry.user_id == current_user.id).first()
        global_rank = entry.global_rank if entry else 1
        weekly_rank = entry.weekly_rank if entry else 1

        # XP system: Leaderboard rank up (+100 XP, only for new highest rank)
        if current_user.xp_best_rank is None or global_rank < current_user.xp_best_rank:
            current_user.xp += 100
            def xp_needed(level):
                return 100 + (level - 1) * 50
            while current_user.xp >= xp_needed(current_user.level):
                current_user.xp -= xp_needed(current_user.level)
                current_user.level += 1
            current_user.xp_best_rank = global_rank
            db.commit()
            db.refresh(current_user)
        
        return {
            "global_rank": global_rank,
            "weekly_rank": weekly_rank,
            "user_id": current_user.id
        }
    except Exception as e:
        print(f"Error in get_my_rank: {e}")
        # Return default values if there's an error
        return {
            "global_rank": 1,
            "weekly_rank": 1,
            "user_id": current_user.id if current_user else 0
        }

@router.get("/stats", response_model=LeaderboardStatsResponse)
async def get_leaderboard_stats(
    db: Session = Depends(get_db)
):
    """Get overall leaderboard statistics"""
    
    leaderboard_service = LeaderboardService(db)
    
    # Get comprehensive stats
    stats = await leaderboard_service.get_leaderboard_stats()
    
    return LeaderboardStatsResponse(
        total_traders=stats.get('total_traders', 0),
        active_today=stats.get('active_today', 0),
        top_performer=stats.get('top_performer', {
            'username': 'No data',
            'portfolio_performance_percent': 0.0
        }),
        average_portfolio_value=stats.get('average_portfolio_value', 0.0),
        total_trades_today=stats.get('total_trades_today', 0)
    )

@router.post("/update-rankings")
async def update_rankings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update leaderboard rankings (admin only or automated)"""
    
    leaderboard_service = LeaderboardService(db)
    
    try:
        # Update all rankings
        leaderboard_service.update_all_rankings()
        
        return {"message": "Rankings updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update rankings: {str(e)}"
        )

@router.get("/user-rank/{user_id}")
async def get_user_rank(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get specific user's rank information"""
    
    leaderboard_service = LeaderboardService(db)
    
    # Get user's ranks
    global_rank = leaderboard_service.get_user_global_rank(user_id)
    weekly_rank = leaderboard_service.get_user_weekly_rank(user_id)
    
    return {
        "user_id": user_id,
        "global_rank": global_rank,
        "weekly_rank": weekly_rank
    } 