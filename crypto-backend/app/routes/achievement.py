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
    try:
        # First, check if achievements table exists and setup if needed
        from sqlalchemy import text
        
        # Reset any failed transaction
        try:
            db.rollback()
        except:
            pass
        
        try:
            db.execute(text("SELECT 1 FROM achievements LIMIT 1"))
        except Exception:
            print("Achievements table doesn't exist, setting up database...")
            # Call the setup endpoint logic directly
            try:
                # Create achievements table
                db.execute(text("""
                    CREATE TABLE IF NOT EXISTS achievements (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        icon VARCHAR(255) NOT NULL,
                        requirement_value NUMERIC(20, 8) NOT NULL,
                        requirement_type VARCHAR(50) NOT NULL,
                        reward_coins NUMERIC(20, 8) NOT NULL DEFAULT 0,
                        reward_title VARCHAR(255),
                        is_active BOOLEAN NOT NULL DEFAULT true,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                
                # Create user_achievements table
                db.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_achievements (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
                        current_progress NUMERIC(20, 8) NOT NULL DEFAULT 0,
                        is_completed BOOLEAN NOT NULL DEFAULT false,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        completed_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                
                # Create user_login_streaks table
                db.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_login_streaks (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        current_streak INTEGER NOT NULL DEFAULT 0,
                        longest_streak INTEGER NOT NULL DEFAULT 0,
                        last_login_date TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                
                # Insert default achievements if table is empty
                result = db.execute(text("SELECT COUNT(*) FROM achievements")).scalar()
                if result == 0:
                    db.execute(text("""
                        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
                        ('First Trade', 'Complete your first trade', 'TRADING_MILESTONE', '🎯', 1, 'trades', 1000, 'Trader', true),
                        ('Profit Master', 'Make 10% profit on a trade', 'PROFIT_ACHIEVEMENT', '💰', 10, 'profit_percent', 2000, 'Profit Hunter', true),
                        ('Diversifier', 'Hold 5 different cryptocurrencies', 'DIVERSIFICATION', '📊', 5, 'coins_held', 1500, 'Diversifier', true),
                        ('Login Streak', 'Login for 7 consecutive days', 'LOGIN_STREAK', '🔥', 7, 'days_streak', 3000, 'Loyal Trader', true),
                        ('Volume Trader', 'Trade 1000 coins in total', 'VOLUME_REWARD', '📈', 1000, 'volume', 5000, 'Volume Master', true)
                    """))
                
                db.commit()
                print("Database setup completed successfully")
            except Exception as setup_error:
                print(f"Error setting up database: {setup_error}")
                try:
                    db.rollback()
                except:
                    pass
        
        achievement_service = AchievementService(db)
        
        # Initialize achievements for user if not exists
        print(f"Initializing achievements for user {current_user.id}")
        achievement_service.initialize_user_achievements(current_user)
        
        # Get comprehensive achievement summary
        summary = achievement_service.get_user_achievements_summary(current_user)
        print(f"User {current_user.id} has {len(summary.get('achievements', []))} achievements")
        
        return UserAchievementsResponse(**summary)
    except Exception as e:
        print(f"Error in get_user_achievements: {e}")
        # Return default response if there's an error
        from datetime import datetime
        return UserAchievementsResponse(
            user_id=current_user.id,
            username=current_user.username,
            total_achievements=0,
            completed_achievements=0,
            completion_percentage=0,
            total_reward_coins_earned=0,
            login_streak={
                'user_id': current_user.id,
                'current_streak': 0,
                'longest_streak': 0,
                'last_login_date': None,
                'created_at': datetime.utcnow(),
                'updated_at': None
            },
            achievements=[]
        )

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
    try:
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
    except Exception as e:
        print(f"Error in get_achievement_stats: {e}")
        # Return default stats if there's an error
        return AchievementStatsResponse(
            total_achievements=0,
            total_users_with_achievements=0,
            most_earned_achievement=None,
            rarest_achievement=None,
            average_completion_rate=0,
            total_rewards_distributed=0
        )

@router.post("/initialize")
async def initialize_achievements(
    db: Session = Depends(get_db)
):
    """Initialize default achievements in database"""
    try:
        # Reset any failed transaction
        try:
            db.rollback()
        except:
            pass
        
        from sqlalchemy import text
        
        # Insert default achievements directly
        db.execute(text("""
            INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
            ('First Trade', 'Complete your first trade', 'TRADING_MILESTONE', '🎯', 1, 'trades', 1000, 'Trader', true),
            ('Trading Novice', 'Complete 10 trades', 'TRADING_MILESTONE', '📈', 10, 'trades', 2000, 'Novice Trader', true),
            ('Active Trader', 'Complete 50 trades', 'TRADING_MILESTONE', '🚀', 50, 'trades', 5000, 'Active Trader', true),
            ('Expert Trader', 'Complete 100 trades', 'TRADING_MILESTONE', '💎', 100, 'trades', 10000, 'Expert Trader', true),
            ('First Profit', 'Achieve your first profitable trade', 'PROFIT_ACHIEVEMENT', '💰', 0.01, 'profit_percentage', 1500, 'Profit Maker', true),
            ('Rising Star', 'Achieve 5% portfolio profit', 'PROFIT_ACHIEVEMENT', '⭐', 5, 'profit_percentage', 3000, 'Rising Star', true),
            ('Profit Master', 'Achieve 25% portfolio profit', 'PROFIT_ACHIEVEMENT', '🏆', 25, 'profit_percentage', 7500, 'Profit Master', true),
            ('Diversified Portfolio', 'Hold 5 different cryptocurrencies', 'DIVERSIFICATION', '🎨', 5, 'coins_held', 2000, 'Diversifier', true),
            ('Login Streak', 'Login for 7 consecutive days', 'LOGIN_STREAK', '🔥', 7, 'days_streak', 1000, 'Loyal Trader', true),
            ('High Volume', 'Trade over 100,000 DemoCoins in value', 'VOLUME_REWARD', '📊', 100000, 'volume', 3000, 'Volume Trader', true),
            ('Whale Trader', 'Trade over 1,000,000 DemoCoins in value', 'VOLUME_REWARD', '🐋', 1000000, 'volume', 10000, 'Whale Trader', true)
        ON CONFLICT (name) DO NOTHING
        """))
        
        db.commit()
        return {"message": "Achievements initialized successfully"}
    except Exception as e:
        try:
            db.rollback()
        except:
            pass
        print(f"Error in initialize_achievements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize achievements: {str(e)}"
        )

@router.post("/setup-database")
async def setup_achievement_database(
    db: Session = Depends(get_db)
):
    """Setup achievement database tables and data"""
    try:
        # Reset any failed transaction
        try:
            db.rollback()
        except:
            pass
        
        # Create tables if they don't exist
        from sqlalchemy import text
        
        # Create achievements table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS achievements (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                icon VARCHAR(255) NOT NULL,
                requirement_value NUMERIC(20, 8) NOT NULL,
                requirement_type VARCHAR(50) NOT NULL,
                reward_coins NUMERIC(20, 8) NOT NULL DEFAULT 0,
                reward_title VARCHAR(255),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        
        # Create user_achievements table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS user_achievements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
                current_progress NUMERIC(20, 8) NOT NULL DEFAULT 0,
                is_completed BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                completed_at TIMESTAMP WITH TIME ZONE
            )
        """))
        
        # Create user_login_streaks table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS user_login_streaks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                current_streak INTEGER NOT NULL DEFAULT 0,
                longest_streak INTEGER NOT NULL DEFAULT 0,
                last_login_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        
        # Insert default achievements if table is empty
        result = db.execute(text("SELECT COUNT(*) FROM achievements")).scalar()
        if result == 0:
            db.execute(text("""
                INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
                ('First Trade', 'Complete your first trade', 'TRADING_MILESTONE', '🎯', 1, 'trades', 1000, 'Trader', true),
                                        ('Profit Master', 'Make 10% profit on a trade', 'PROFIT_ACHIEVEMENT', '💰', 10, 'profit_percent', 2000, 'Profit Hunter', true),
                        ('Diversifier', 'Hold 5 different cryptocurrencies', 'DIVERSIFICATION', '📊', 5, 'coins_held', 1500, 'Diversifier', true),
                        ('Login Streak', 'Login for 7 consecutive days', 'LOGIN_STREAK', '🔥', 7, 'days_streak', 3000, 'Loyal Trader', true),
                        ('Volume Trader', 'Trade 1000 coins in total', 'VOLUME_REWARD', '📈', 1000, 'volume', 5000, 'Volume Master', true)
            """))
        
        db.commit()
        return {"message": "Achievement database setup completed successfully"}
    except Exception as e:
        try:
            db.rollback()
        except:
            pass
        print(f"Error in setup_achievement_database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup achievement database: {str(e)}"
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