from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Tuple
from sqlalchemy import func, and_, or_, desc

from app.models.user import User
from app.models.trade import Trade, TradeType
from app.models.leaderboard import LeaderboardEntry
from app.services.price_service import get_multiple_crypto_prices

class LeaderboardService:
    """Service for calculating and managing leaderboard rankings"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_global_leaderboard(self, limit: int = 100) -> List[Dict]:
        """Get global leaderboard entries with real data"""
        # Get all users with their calculated performance
        users = self.db.query(User).all()
        
        leaderboard_entries = []
        for user in users:
            # Calculate real performance for each user
            performance = await self.calculate_user_portfolio_performance(user)
            
            entry = {
                'user_id': user.id,
                'username': user.username,
                'total_portfolio_value': performance['total_portfolio_value'],
                'total_invested': performance['total_invested'],
                'total_profit_loss': performance['total_profit_loss'],
                'total_profit_loss_percent': performance['total_profit_loss_percent'],
                'current_demo_balance': user.demo_balance,
                'initial_balance': Decimal('100000'),
                'portfolio_performance_percent': performance['portfolio_performance_percent'],
                'total_trades': performance['total_trades'],
                'winning_trades': performance['winning_trades'],
                'losing_trades': performance['losing_trades'],
                'win_rate_percent': performance['win_rate_percent'],
                'last_updated': datetime.utcnow(),
                'week_start': self._get_week_start()
            }
            leaderboard_entries.append(entry)
        
        # Sort by portfolio performance (highest first)
        leaderboard_entries.sort(key=lambda x: x['portfolio_performance_percent'], reverse=True)
        
        # Add ranks
        for i, entry in enumerate(leaderboard_entries[:limit], 1):
            entry['global_rank'] = i
            entry['weekly_rank'] = i  # For now, same as global
        
        return leaderboard_entries[:limit]
    
    async def get_weekly_leaderboard(self, limit: int = 100) -> List[Dict]:
        """Get weekly leaderboard entries"""
        return await self.get_global_leaderboard(limit)
    
    def get_user_global_rank(self, user_id: int) -> Optional[int]:
        """Get user's global rank"""
        entry = self.db.query(LeaderboardEntry).filter(
            LeaderboardEntry.user_id == user_id
        ).first()
        return entry.global_rank if entry else None
    
    def get_user_weekly_rank(self, user_id: int) -> Optional[int]:
        """Get user's weekly rank"""
        entry = self.db.query(LeaderboardEntry).filter(
            LeaderboardEntry.user_id == user_id
        ).first()
        return entry.weekly_rank if entry else None
    
    async def get_leaderboard_stats(self) -> Dict:
        """Get leaderboard statistics with real data"""
        total_users = self.db.query(User).count()
        
        # Get today's trades
        today = datetime.utcnow().date()
        trades_today = self.db.query(Trade).filter(
            func.date(Trade.timestamp) == today
        ).count()
        
        # Get unique users who traded today
        active_today = self.db.query(Trade.user_id).filter(
            func.date(Trade.timestamp) == today
        ).distinct().count()
        
        # Get top performer from leaderboard
        top_leaderboard = await self.get_global_leaderboard(limit=1)
        top_performer = top_leaderboard[0] if top_leaderboard else {
            'username': 'No traders yet',
            'portfolio_performance_percent': Decimal('0')
        }
        
        # Calculate average portfolio value
        all_users = self.db.query(User).all()
        total_portfolio_value = Decimal('0')
        for user in all_users:
            performance = await self.calculate_user_portfolio_performance(user)
            total_portfolio_value += performance['total_portfolio_value']
        
        avg_portfolio_value = total_portfolio_value / len(all_users) if all_users else Decimal('0')
        
        return {
            'total_traders': total_users,
            'active_today': active_today,
            'top_performer': {
                'username': top_performer['username'],
                'portfolio_performance_percent': float(top_performer['portfolio_performance_percent'])
            },
            'average_portfolio_value': float(avg_portfolio_value),
            'total_trades_today': trades_today
        }
    
    def update_all_rankings(self):
        """Update all leaderboard rankings"""
        # This would update the rankings in a real implementation
        pass

    async def calculate_user_portfolio_performance(self, user: User) -> Dict:
        """Calculate comprehensive portfolio performance for a user"""
        
        # Get all user trades
        trades = self.db.query(Trade).filter(Trade.user_id == user.id).all()
        
        if not trades:
            return {
                'total_portfolio_value': Decimal('0'),
                'total_invested': Decimal('0'),
                'total_profit_loss': Decimal('0'),
                'total_profit_loss_percent': Decimal('0'),
                'portfolio_performance_percent': Decimal('0'),
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate_percent': Decimal('0')
            }
        
        # Calculate holdings by coin (same logic as portfolio endpoint)
        holdings_data = {}
        
        for trade in trades:
            coin = trade.coin_symbol
            if coin not in holdings_data:
                holdings_data[coin] = {
                    'total_bought': Decimal('0'),
                    'total_sold': Decimal('0'),
                    'total_spent': Decimal('0'),
                    'total_received': Decimal('0')
                }
            
            if trade.side == TradeType.BUY:
                holdings_data[coin]['total_bought'] += trade.quantity
                holdings_data[coin]['total_spent'] += trade.total_cost
            else:  # SELL
                holdings_data[coin]['total_sold'] += trade.quantity
                holdings_data[coin]['total_received'] += trade.total_cost
        
        # Get current prices for all coins
        coin_symbols = list(holdings_data.keys())
        if not coin_symbols:
            return {
                'total_portfolio_value': Decimal('0'),
                'total_invested': Decimal('0'),
                'total_profit_loss': Decimal('0'),
                'total_profit_loss_percent': Decimal('0'),
                'portfolio_performance_percent': Decimal('0'),
                'total_trades': len(trades),
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate_percent': Decimal('0')
            }
        
        current_prices = await get_multiple_crypto_prices(coin_symbols)
        
        total_portfolio_value = Decimal('0')
        total_invested = Decimal('0')
        total_received = Decimal('0')
        winning_trades = 0
        losing_trades = 0
        
        for coin, data in holdings_data.items():
            current_holding = data['total_bought'] - data['total_sold']
            
            if current_holding > 0:
                current_price = Decimal(str(current_prices.get(coin, 0)))
                total_portfolio_value += current_holding * current_price
            
            total_invested += data['total_spent']
            total_received += data['total_received']
            
            # Calculate win/loss for this coin
            if data['total_sold'] > 0:
                avg_buy_price = data['total_spent'] / data['total_bought'] if data['total_bought'] > 0 else Decimal('0')
                avg_sell_price = data['total_received'] / data['total_sold']
                
                if avg_sell_price > avg_buy_price:
                    winning_trades += 1
                else:
                    losing_trades += 1
        
        # Add cash back from sales
        total_portfolio_value += total_received
        
        # Calculate metrics
        total_profit_loss = total_portfolio_value - total_invested
        total_profit_loss_percent = (total_profit_loss / total_invested * 100) if total_invested > 0 else Decimal('0')
        
        # Portfolio performance relative to initial balance
        initial_balance = Decimal('100000')  # Default initial balance
        portfolio_performance_percent = ((total_portfolio_value - initial_balance) / initial_balance * 100) if initial_balance > 0 else Decimal('0')
        
        # Win rate
        total_trade_positions = winning_trades + losing_trades
        win_rate_percent = (Decimal(winning_trades) / total_trade_positions * 100) if total_trade_positions > 0 else Decimal('0')
        
        return {
            'total_portfolio_value': total_portfolio_value,
            'total_invested': total_invested,
            'total_profit_loss': total_profit_loss,
            'total_profit_loss_percent': total_profit_loss_percent,
            'portfolio_performance_percent': portfolio_performance_percent,
            'total_trades': len(trades),
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate_percent': win_rate_percent
        }
    
    async def update_user_leaderboard_entry(self, user: User) -> Optional[LeaderboardEntry]:
        """Update or create leaderboard entry for a user"""
        
        # Calculate performance metrics
        performance = await self.calculate_user_portfolio_performance(user)
        
        # Find existing entry or create new one
        entry = self.db.query(LeaderboardEntry).filter(
            LeaderboardEntry.user_id == user.id
        ).first()
        
        if not entry:
            entry = LeaderboardEntry(
                user_id=user.id,
                rank=0,  # Set default rank to fix NOT NULL constraint
                score=Decimal('0'),  # Set default score to fix NOT NULL constraint
                period='global'  # Set default period to fix NOT NULL constraint
            )
            self.db.add(entry)
        
        # Update entry with calculated metrics
        entry.username = user.username  # Set username to fix NOT NULL constraint
        entry.total_portfolio_value = performance['total_portfolio_value']
        entry.total_invested = performance['total_invested']
        entry.total_profit_loss = performance['total_profit_loss']
        entry.total_profit_loss_percent = performance['total_profit_loss_percent']
        entry.current_demo_balance = user.demo_balance
        entry.initial_balance = Decimal('100000')  # Default initial balance
        entry.portfolio_performance_percent = performance['portfolio_performance_percent']
        entry.total_trades = performance['total_trades']
        entry.winning_trades = performance['winning_trades']
        entry.losing_trades = performance['losing_trades']
        entry.win_rate_percent = performance['win_rate_percent']
        entry.last_updated = datetime.utcnow()
        
        # Update score field (using portfolio performance as score)
        entry.score = performance['portfolio_performance_percent']
        
        self.db.commit()
        return entry
    
    def _get_week_start(self) -> datetime:
        """Get the start of the current week (Monday)"""
        today = datetime.utcnow().date()
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        return datetime.combine(week_start, datetime.min.time())
    
    async def update_all_rankings(self):
        """Update global and weekly rankings for all users"""
        
        # Get all users with trades
        users_with_trades = self.db.query(User).join(Trade).distinct().all()
        
        # Update leaderboard entries for all users
        entries = []
        for user in users_with_trades:
            entry = await self.update_user_leaderboard_entry(user)
            if entry:
                entries.append(entry)
        
        # Sort by portfolio performance for global ranking
        entries.sort(key=lambda x: x.portfolio_performance_percent, reverse=True)
        
        # Update global ranks
        for i, entry in enumerate(entries, 1):
            entry.global_rank = i
        
        # Sort by weekly performance (using same metric for now)
        # In a real implementation, this would be weekly-specific performance
        entries.sort(key=lambda x: x.total_profit_loss_percent, reverse=True)
        
        # Update weekly ranks
        week_start = self._get_week_start()
        for i, entry in enumerate(entries, 1):
            entry.weekly_rank = i
            entry.week_start = week_start
        
        self.db.commit()
    
    def get_user_rank(self, user_id: int) -> Optional[LeaderboardEntry]:
        """Get leaderboard entry for a specific user"""
        return self.db.query(LeaderboardEntry).filter(
            LeaderboardEntry.user_id == user_id
        ).first() 