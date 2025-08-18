from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Tuple
from sqlalchemy import func, and_, or_, desc

from app.models.user import User
from app.models.trade import Trade, TradeType
from app.models.leaderboard import LeaderboardEntry
from app.models.achievement import Achievement, UserAchievement, UserLoginStreak, AchievementType
from app.schemas.achievement import AchievementRewardResponse, UserAchievementSummary

class AchievementService:
    """Service for managing achievements and user progress"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def initialize_default_achievements(self):
        """Initialize default achievements in the database"""
        try:
            default_achievements = [
                # Trading Milestones
                {
                    "name": "First Trade",
                    "description": "Complete your first trade",
                    "type": "trading_milestone",
                    "icon": "🎯",
                    "requirement_value": 1,
                    "requirement_type": "trades",
                    "reward_coins": 500,
                    "reward_title": "Beginner Trader"
                },
                {
                    "name": "Trading Novice",
                    "description": "Complete 10 trades",
                    "type": "trading_milestone",
                    "icon": "📈",
                    "requirement_value": 10,
                    "requirement_type": "trades",
                    "reward_coins": 1000,
                    "reward_title": "Novice Trader"
                },
                {
                    "name": "Active Trader",
                    "description": "Complete 50 trades",
                    "type": "trading_milestone",
                    "icon": "🚀",
                    "requirement_value": 50,
                    "requirement_type": "trades",
                    "reward_coins": 2500,
                    "reward_title": "Active Trader"
                },
                {
                    "name": "Expert Trader",
                    "description": "Complete 100 trades",
                    "type": "trading_milestone",
                    "icon": "💎",
                    "requirement_value": 100,
                    "requirement_type": "trades",
                    "reward_coins": 5000,
                    "reward_title": "Expert Trader"
                },
                
                # Profit Achievements
                {
                    "name": "First Profit",
                    "description": "Achieve your first profitable trade",
                    "type": "profit_achievement",
                    "icon": "💰",
                    "requirement_value": 0.01,
                    "requirement_type": "profit_percentage",
                    "reward_coins": 750,
                    "reward_title": "Profit Maker"
                },
                {
                    "name": "Profit Enthusiast",
                    "description": "Achieve 10% total profit",
                    "type": "profit_achievement",
                    "icon": "📊",
                    "requirement_value": 10,
                    "requirement_type": "profit_percentage",
                    "reward_coins": 2000,
                    "reward_title": "Profit Enthusiast"
                },
                {
                    "name": "Profit Master",
                    "description": "Achieve 25% total profit",
                    "type": "profit_achievement",
                    "icon": "🏆",
                    "requirement_value": 25,
                    "requirement_type": "profit_percentage",
                    "reward_coins": 5000,
                    "reward_title": "Profit Master"
                },
                
                # Login Streak Achievements
                {
                    "name": "Daily Visitor",
                    "description": "Login for 3 consecutive days",
                    "type": "login_streak",
                    "icon": "📅",
                    "requirement_value": 3,
                    "requirement_type": "login_streak",
                    "reward_coins": 300,
                    "reward_title": "Daily Visitor"
                },
                {
                    "name": "Weekly Warrior",
                    "description": "Login for 7 consecutive days",
                    "type": "login_streak",
                    "icon": "🗓️",
                    "requirement_value": 7,
                    "requirement_type": "login_streak",
                    "reward_coins": 1000,
                    "reward_title": "Weekly Warrior"
                },
                {
                    "name": "Monthly Master",
                    "description": "Login for 30 consecutive days",
                    "type": "login_streak",
                    "icon": "🏅",
                    "requirement_value": 30,
                    "requirement_type": "login_streak",
                    "reward_coins": 5000,
                    "reward_title": "Monthly Master"
                }
            ]
            
            for achievement_data in default_achievements:
                try:
                    # Check if achievement already exists
                    existing = self.db.query(Achievement).filter(
                        Achievement.name == achievement_data["name"]
                    ).first()
                    
                    if not existing:
                        achievement = Achievement(
                            name=achievement_data["name"],
                            description=achievement_data["description"],
                            type=achievement_data["type"],
                            icon=achievement_data["icon"],
                            requirement_value=Decimal(str(achievement_data["requirement_value"])),
                            requirement_type=achievement_data["requirement_type"],
                            reward_coins=Decimal(str(achievement_data["reward_coins"])),
                            reward_title=achievement_data["reward_title"],
                            is_active=True
                        )
                        self.db.add(achievement)
                except Exception:
                    # Skip this achievement if there's an error
                    continue
            
            try:
                self.db.commit()
            except Exception:
                self.db.rollback()
                
        except Exception as e:
            # If everything fails, just return
            pass
    
    def get_all_achievements(self) -> List[Achievement]:
        """Get all active achievements"""
        try:
            # Reset any failed transaction
            try:
                self.db.rollback()
            except:
                pass
            
            achievements = self.db.query(Achievement).filter(
                Achievement.is_active == True
            ).all()
            
            print(f"Found {len(achievements)} achievements in database")
            
            # If no achievements exist, try to initialize default ones
            if not achievements:
                print("No achievements found, trying to initialize...")
                try:
                    from sqlalchemy import text
                    
                    # Insert default achievements directly
                    self.db.execute(text("""
                        INSERT INTO achievements (name, description, type, icon, requirement_value, requirement_type, reward_coins, reward_title, is_active) VALUES
                        ('First Trade', 'Complete your first trade', 'trading_milestone', '🎯', 1, 'trades', 1000, 'Trader', true),
                        ('Trading Novice', 'Complete 10 trades', 'trading_milestone', '📈', 10, 'trades', 2000, 'Novice Trader', true),
                        ('Active Trader', 'Complete 50 trades', 'trading_milestone', '🚀', 50, 'trades', 5000, 'Active Trader', true),
                        ('Expert Trader', 'Complete 100 trades', 'trading_milestone', '💎', 100, 'trades', 10000, 'Expert Trader', true),
                        ('First Profit', 'Achieve your first profitable trade', 'profit_achievement', '💰', 0.01, 'profit_percentage', 1500, 'Profit Maker', true),
                        ('Rising Star', 'Achieve 5% portfolio profit', 'profit_achievement', '⭐', 5, 'profit_percentage', 3000, 'Rising Star', true),
                        ('Profit Master', 'Achieve 25% portfolio profit', 'profit_achievement', '🏆', 25, 'profit_percentage', 7500, 'Profit Master', true),
                        ('Diversified Portfolio', 'Hold 5 different cryptocurrencies', 'diversification', '🎨', 5, 'coins_held', 2000, 'Diversifier', true),
                        ('Login Streak', 'Login for 7 consecutive days', 'login_streak', '🔥', 7, 'days_streak', 1000, 'Loyal Trader', true),
                        ('High Volume', 'Trade over 100,000 DemoCoins in value', 'volume_reward', '📊', 100000, 'volume', 3000, 'Volume Trader', true),
                        ('Whale Trader', 'Trade over 1,000,000 DemoCoins in value', 'volume_reward', '🐋', 1000000, 'volume', 10000, 'Whale Trader', true)
                    """))
                    
                    self.db.commit()
                    print("Default achievements inserted successfully")
                    
                    # Get achievements again
                    achievements = self.db.query(Achievement).filter(
                        Achievement.is_active == True
                    ).all()
                    print(f"Now found {len(achievements)} achievements")
                except Exception as init_error:
                    print(f"Error initializing achievements: {init_error}")
                    try:
                        self.db.rollback()
                        
                    except:
                        pass
            
            return achievements
        except Exception as e:
            print(f"Error in get_all_achievements: {e}")
            # Return empty list if there's an error
            return []
    
    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        """Get all user achievements with progress"""
        return self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).all()
    
    def initialize_user_achievements(self, user: User):
        """Initialize achievement progress for a new user"""
        try:
            # Reset any failed transaction
            try:
                self.db.rollback()
            except:
                pass
            
            print(f"Getting all achievements for user {user.id}")
            achievements = self.get_all_achievements()
            print(f"Found {len(achievements)} achievements to initialize")
            
            initialized_count = 0
            for achievement in achievements:
                try:
                    # Check if user already has this achievement
                    existing = self.db.query(UserAchievement).filter(
                        and_(
                            UserAchievement.user_id == user.id,
                            UserAchievement.achievement_id == achievement.id
                        )
                    ).first()
                    
                    if not existing:
                        user_achievement = UserAchievement(
                            user_id=user.id,
                            achievement_id=achievement.id,
                            current_progress=0,
                            is_completed=False
                        )
                        self.db.add(user_achievement)
                        initialized_count += 1
                        print(f"Initialized achievement {achievement.name} for user {user.id}")
                except Exception as e:
                    print(f"Error initializing achievement {achievement.name}: {e}")
                    # Skip this achievement if there's an error
                    continue
            
            # Initialize login streak
            try:
                login_streak = self.db.query(UserLoginStreak).filter(
                    UserLoginStreak.user_id == user.id
                ).first()
                
                if not login_streak:
                    login_streak = UserLoginStreak(
                        user_id=user.id,
                        current_streak=1,
                        longest_streak=1,
                        last_login_date=datetime.utcnow().date()
                    )
                    self.db.add(login_streak)
                    print(f"Initialized login streak for user {user.id}")
            except Exception as e:
                print(f"Error initializing login streak: {e}")
                # Skip login streak if there's an error
                pass
            
            try:
                self.db.commit()
                print(f"Successfully initialized {initialized_count} achievements for user {user.id}")
            except Exception as e:
                print(f"Error committing achievements: {e}")
                try:
                    self.db.rollback()
                except:
                    pass
                
        except Exception as e:
            print(f"Error in initialize_user_achievements: {e}")
            # If everything fails, just return without initializing
            pass
    
    async def check_and_award_achievements(self, user: User) -> List[AchievementRewardResponse]:
        """Check all achievements and award any newly completed ones"""
        rewards = []
        
        # Initialize user achievements if not exists
        self.initialize_user_achievements(user)
        
        # Check trading milestones
        trading_rewards = await self._check_trading_milestones(user)
        rewards.extend(trading_rewards)
        
        # Check profit achievements
        profit_rewards = await self._check_profit_achievements(user)
        rewards.extend(profit_rewards)
        
        # Check diversification achievements
        diversification_rewards = await self._check_diversification_achievements(user)
        rewards.extend(diversification_rewards)
        
        # Check volume achievements
        volume_rewards = await self._check_volume_achievements(user)
        rewards.extend(volume_rewards)
        
        return rewards
    
    async def update_login_streak(self, user: User) -> Optional[AchievementRewardResponse]:
        """Update login streak and check for streak achievements"""
        login_streak = self.db.query(UserLoginStreak).filter(
            UserLoginStreak.user_id == user.id
        ).first()
        
        if not login_streak:
            login_streak = UserLoginStreak(
                user_id=user.id,
                current_streak=1,
                longest_streak=1,
                last_login_date=datetime.utcnow()
            )
            self.db.add(login_streak)
        else:
            now = datetime.utcnow()
            last_login = login_streak.last_login_date
            
            if last_login:
                # Check if it's a new day
                if now.date() > last_login.date():
                    # Check if it's consecutive (yesterday)
                    if now.date() - last_login.date() == timedelta(days=1):
                        login_streak.current_streak += 1
                    else:
                        login_streak.current_streak = 1
                    
                    # Update longest streak
                    if login_streak.current_streak > login_streak.longest_streak:
                        login_streak.longest_streak = login_streak.current_streak
                    
                    login_streak.last_login_date = now
            else:
                login_streak.current_streak = 1
                login_streak.longest_streak = 1
                login_streak.last_login_date = now
        
        self.db.commit()
        
        # Check for streak achievements
        return await self._check_login_streak_achievements(user)
    
    async def _check_trading_milestones(self, user: User) -> List[AchievementRewardResponse]:
        """Check trading milestone achievements"""
        rewards = []
        
        # Get total trades count
        total_trades = self.db.query(Trade).filter(Trade.user_id == user.id).count()
        
        # Get trading milestone achievements
        trading_achievements = self.db.query(Achievement).filter(
            Achievement.type == "trading_milestone"
        ).all()
        
        for achievement in trading_achievements:
            user_achievement = self.db.query(UserAchievement).filter(
                and_(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                )
            ).first()
            
            if user_achievement and not user_achievement.is_completed:
                user_achievement.current_progress = total_trades
                
                if total_trades >= achievement.requirement_value:
                    reward = self._award_achievement(user, achievement, user_achievement)
                    if reward:
                        rewards.append(reward)
        
        return rewards
    
    async def _check_profit_achievements(self, user: User) -> List[AchievementRewardResponse]:
        """Check profit achievement milestones"""
        rewards = []
        
        # Calculate current profit percentage
        from app.services.leaderboard_service import LeaderboardService
        leaderboard_service = LeaderboardService(self.db)
        performance = await leaderboard_service.calculate_user_portfolio_performance(user)
        
        current_profit_percent = float(performance.get('portfolio_performance_percent', 0))
        
        # Get profit achievements
        profit_achievements = self.db.query(Achievement).filter(
            Achievement.type == "profit_achievement"
        ).all()
        
        for achievement in profit_achievements:
            user_achievement = self.db.query(UserAchievement).filter(
                and_(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                )
            ).first()
            
            if user_achievement and not user_achievement.is_completed:
                user_achievement.current_progress = current_profit_percent
                
                if current_profit_percent >= float(achievement.requirement_value):
                    reward = self._award_achievement(user, achievement, user_achievement)
                    if reward:
                        rewards.append(reward)
        
        return rewards
    
    async def _check_diversification_achievements(self, user: User) -> List[AchievementRewardResponse]:
        """Check diversification achievements"""
        rewards = []
        
        # Calculate current holdings diversity
        trades = self.db.query(Trade).filter(Trade.user_id == user.id).all()
        
        holdings_data = {}
        for trade in trades:
            coin = trade.coin_symbol
            if coin not in holdings_data:
                holdings_data[coin] = {
                    'total_bought': Decimal('0'),
                    'total_sold': Decimal('0')
                }
            
            if trade.trade_type == TradeType.BUY:
                holdings_data[coin]['total_bought'] += trade.quantity
            else:
                holdings_data[coin]['total_sold'] += trade.quantity
        
        # Count coins with positive holdings
        coins_held = 0
        for coin, data in holdings_data.items():
            net_quantity = data['total_bought'] - data['total_sold']
            if net_quantity > 0:
                coins_held += 1
        
        # Get diversification achievements
        diversification_achievements = self.db.query(Achievement).filter(
            Achievement.type == "diversification"
        ).all()
        
        for achievement in diversification_achievements:
            user_achievement = self.db.query(UserAchievement).filter(
                and_(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                )
            ).first()
            
            if user_achievement and not user_achievement.is_completed:
                user_achievement.current_progress = coins_held
                
                if coins_held >= achievement.requirement_value:
                    reward = self._award_achievement(user, achievement, user_achievement)
                    if reward:
                        rewards.append(reward)
        
        return rewards
    
    async def _check_volume_achievements(self, user: User) -> List[AchievementRewardResponse]:
        """Check volume trading achievements"""
        rewards = []
        
        # Calculate total trading volume
        trades = self.db.query(Trade).filter(Trade.user_id == user.id).all()
        total_volume = sum(trade.total_cost for trade in trades)
        
        # Get volume achievements
        volume_achievements = self.db.query(Achievement).filter(
            Achievement.type == "volume_reward"
        ).all()
        
        for achievement in volume_achievements:
            user_achievement = self.db.query(UserAchievement).filter(
                and_(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                )
            ).first()
            
            if user_achievement and not user_achievement.is_completed:
                user_achievement.current_progress = total_volume
                
                if total_volume >= achievement.requirement_value:
                    reward = self._award_achievement(user, achievement, user_achievement)
                    if reward:
                        rewards.append(reward)
        
        return rewards
    
    async def _check_login_streak_achievements(self, user: User) -> Optional[AchievementRewardResponse]:
        """Check login streak achievements"""
        login_streak = self.db.query(UserLoginStreak).filter(
            UserLoginStreak.user_id == user.id
        ).first()
        
        if not login_streak:
            return None
        
        # Get login streak achievements
        streak_achievements = self.db.query(Achievement).filter(
            Achievement.type == "login_streak"
        ).all()
        
        for achievement in streak_achievements:
            user_achievement = self.db.query(UserAchievement).filter(
                and_(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                )
            ).first()
            
            if user_achievement and not user_achievement.is_completed:
                user_achievement.current_progress = login_streak.current_streak
                
                if login_streak.current_streak >= achievement.requirement_value:
                    reward = self._award_achievement(user, achievement, user_achievement)
                    if reward:
                        return reward
        
        return None
    
    def _award_achievement(self, user: User, achievement: Achievement, user_achievement: UserAchievement) -> Optional[AchievementRewardResponse]:
        """Award an achievement to a user"""
        if user_achievement.is_completed:
            return None
        
        # Mark as completed
        user_achievement.is_completed = True
        user_achievement.completed_at = datetime.utcnow()
        
        # Award coins
        if achievement.reward_coins > 0:
            user.demo_balance += achievement.reward_coins
        
        self.db.commit()
        
        return AchievementRewardResponse(
            achievement_id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            reward_coins=achievement.reward_coins,
            reward_title=achievement.reward_title,
            new_balance=user.demo_balance,
            message=f"Congratulations! You've earned the '{achievement.name}' achievement!"
        )
    
    def get_user_achievements_summary(self, user: User) -> Dict:
        """Get comprehensive summary of user's achievements"""
        try:
            print(f"Getting user achievements for user {user.id}")
            user_achievements = self.db.query(UserAchievement).filter(
                UserAchievement.user_id == user.id
            ).all()
            
            print(f"Found {len(user_achievements)} user achievements")
            
            achievements_data = []
            total_achievements = 0
            completed_achievements = 0
            total_reward_coins = Decimal('0')
            
            for ua in user_achievements:
                try:
                    achievement = ua.achievement
                    progress_percentage = min(100, (float(ua.current_progress) / float(achievement.requirement_value)) * 100)
                    
                    if ua.is_completed:
                        completed_achievements += 1
                        total_reward_coins += achievement.reward_coins
                    
                    achievements_data.append(UserAchievementSummary(
                        achievement_id=achievement.id,
                        name=achievement.name,
                        description=achievement.description,
                        type=achievement.type,
                        icon=achievement.icon,
                        current_progress=ua.current_progress,
                        requirement_value=achievement.requirement_value,
                        requirement_type=achievement.requirement_type,
                        progress_percentage=Decimal(str(progress_percentage)),
                        is_completed=ua.is_completed,
                        reward_coins=achievement.reward_coins,
                        reward_title=achievement.reward_title,
                        completed_at=ua.completed_at
                    ))
                    
                    total_achievements += 1
                except Exception as e:
                    print(f"Error processing user achievement: {e}")
                    # Skip this achievement if there's an error
                    continue
            
            # Get login streak and convert to dict
            login_streak_data = None
            try:
                login_streak = self.db.query(UserLoginStreak).filter(
                    UserLoginStreak.user_id == user.id
                ).first()
                
                if login_streak:
                    login_streak_data = {
                        'user_id': login_streak.user_id,
                        'current_streak': login_streak.current_streak,
                        'longest_streak': login_streak.longest_streak,
                        'last_login_date': None,  # Set to None to avoid validation issues
                        'created_at': login_streak.created_at,
                        'updated_at': login_streak.updated_at
                    }
            except Exception:
                # If login streak table doesn't exist or has issues, use default
                login_streak_data = {
                    'user_id': user.id,
                    'current_streak': 0,
                    'longest_streak': 0,
                    'last_login_date': None,
                    'created_at': datetime.utcnow(),
                    'updated_at': None
                }
            
            completion_percentage = Decimal('0')
            if total_achievements > 0:
                completion_percentage = (Decimal(completed_achievements) / Decimal(total_achievements)) * 100
            
            # If no user achievements found, show all available achievements with 0 progress
            if total_achievements == 0:
                print("No user achievements found, showing all available achievements")
                all_achievements = self.get_all_achievements()
                for achievement in all_achievements:
                    try:
                        achievements_data.append(UserAchievementSummary(
                            achievement_id=achievement.id,
                            name=achievement.name,
                            description=achievement.description,
                            type=achievement.type,
                            icon=achievement.icon,
                            current_progress=0,
                            requirement_value=achievement.requirement_value,
                            requirement_type=achievement.requirement_type,
                            progress_percentage=Decimal('0'),
                            is_completed=False,
                            reward_coins=achievement.reward_coins,
                            reward_title=achievement.reward_title,
                            completed_at=None
                        ))
                        total_achievements += 1
                    except Exception as e:
                        print(f"Error adding achievement to fallback: {e}")
                        continue
            
            print(f"Returning {len(achievements_data)} achievements for user {user.id}")
            return {
                'user_id': user.id,
                'username': user.username,
                'total_achievements': total_achievements,
                'completed_achievements': completed_achievements,
                'completion_percentage': completion_percentage,
                'total_reward_coins_earned': total_reward_coins,
                'login_streak': login_streak_data,
                'achievements': achievements_data
            }
        except Exception as e:
            # Return default response if everything fails
            return {
                'user_id': user.id,
                'username': user.username,
                'total_achievements': 0,
                'completed_achievements': 0,
                'completion_percentage': Decimal('0'),
                'total_reward_coins_earned': Decimal('0'),
                'login_streak': {
                    'user_id': user.id,
                    'current_streak': 0,
                    'longest_streak': 0,
                    'last_login_date': None,
                    'created_at': datetime.utcnow(),
                    'updated_at': None
                },
                'achievements': []
            }
    
    def get_achievement_stats(self) -> Dict:
        """Get overall achievement statistics"""
        total_achievements = self.db.query(Achievement).filter(
            Achievement.is_active == True
        ).count()
        
        total_users_with_achievements = self.db.query(UserAchievement.user_id).distinct().count()
        
        # Most earned achievement
        most_earned_subquery = self.db.query(
            UserAchievement.achievement_id,
            func.count(UserAchievement.id).label('count')
        ).filter(
            UserAchievement.is_completed == True
        ).group_by(UserAchievement.achievement_id).subquery()
        
        most_earned_achievement = self.db.query(Achievement).join(
            most_earned_subquery,
            Achievement.id == most_earned_subquery.c.achievement_id
        ).order_by(desc(most_earned_subquery.c.count)).first()
        
        # Rarest achievement (least earned)
        rarest_achievement = self.db.query(Achievement).join(
            most_earned_subquery,
            Achievement.id == most_earned_subquery.c.achievement_id
        ).order_by(most_earned_subquery.c.count).first()
        
        # Average completion rate
        total_possible = self.db.query(UserAchievement).count()
        total_completed = self.db.query(UserAchievement).filter(
            UserAchievement.is_completed == True
        ).count()
        
        average_completion_rate = Decimal('0')
        if total_possible > 0:
            average_completion_rate = (Decimal(total_completed) / Decimal(total_possible)) * 100
        
        # Total rewards distributed
        total_rewards = self.db.query(func.sum(Achievement.reward_coins)).join(
            UserAchievement,
            and_(
                Achievement.id == UserAchievement.achievement_id,
                UserAchievement.is_completed == True
            )
        ).scalar() or Decimal('0')
        
        return {
            'total_achievements': total_achievements,
            'total_users_with_achievements': total_users_with_achievements,
            'most_earned_achievement': most_earned_achievement,
            'rarest_achievement': rarest_achievement,
            'average_completion_rate': average_completion_rate,
            'total_rewards_distributed': total_rewards
        } 