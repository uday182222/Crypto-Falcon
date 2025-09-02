from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import httpx
import os
import re
from decimal import Decimal
from app.db import SessionLocal
from app.models.user import User
from app.models.trade import Trade
from app.models.wallet import Wallet
from app.services.price_service import CoinGeckoService
from sqlalchemy.orm import Session

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    status: str = "success"

# Initialize price service
price_service = CoinGeckoService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    try:
        # For now, we'll use a simple token validation
        # In production, you'd validate the JWT token properly
        token = credentials.credentials
        
        # Simple token validation - in production, use proper JWT validation
        if token == "test-token-123" or "eyJ" in token:
            # Return a default user for testing
            user = db.query(User).first()
            if not user:
                # Create a test user if none exists
                user = User(
                    username="testuser",
                    email="test@example.com",
                    demo_balance=100000.0
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            return user
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def fetch_user_portfolio_data(user_id: int, db: Session):
    """Fetch user's portfolio and trade history"""
    try:
        # Get user's wallet balance
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        balance = float(wallet.balance) if wallet else 0.0
        
        # Get user's trades
        trades = db.query(Trade).filter(Trade.user_id == user_id).order_by(Trade.timestamp.desc()).limit(10).all()
        
        # Calculate portfolio holdings
        holdings = {}
        for trade in trades:
            symbol = trade.coin_symbol
            if symbol not in holdings:
                holdings[symbol] = {"quantity": 0, "total_cost": 0}
            
            if trade.trade_type.value == "buy":
                holdings[symbol]["quantity"] += float(trade.quantity)
                holdings[symbol]["total_cost"] += float(trade.quantity * trade.price_at_trade)
            else:  # sell
                if holdings[symbol]["quantity"] > 0:
                    cost_reduction = (float(trade.quantity) / holdings[symbol]["quantity"]) * holdings[symbol]["total_cost"]
                    holdings[symbol]["total_cost"] -= cost_reduction
                holdings[symbol]["quantity"] -= float(trade.quantity)
        
        # Filter positive holdings and add current prices
        positive_holdings = {}
        for symbol, data in holdings.items():
            if data["quantity"] > 0:
                # Try to get current price for this symbol
                try:
                    from app.services.price_service import CoinGeckoService
                    price_service = CoinGeckoService()
                    current_price_data = await price_service.get_price(symbol)
                    if current_price_data:
                        data["current_price"] = float(current_price_data.price_usd)
                        data["price_change_24h"] = float(current_price_data.change_24h_percent)
                    else:
                        data["current_price"] = 0.0
                        data["price_change_24h"] = 0.0
                except Exception as e:
                    logger.error(f"Error fetching current price for {symbol}: {e}")
                    data["current_price"] = 0.0
                    data["price_change_24h"] = 0.0
                
                positive_holdings[symbol] = data
        
        # Format recent trades with profit/loss calculation
        recent_trades = []
        for trade in trades[:5]:  # Last 5 trades
            trade_data = {
                "type": trade.trade_type.value,
                "coin": trade.coin_symbol,
                "quantity": float(trade.quantity),
                "price": float(trade.price_at_trade),
                "date": trade.timestamp.isoformat() if trade.timestamp else "Unknown"
            }
            
            # Calculate profit/loss if we have current price
            if trade.coin_symbol in positive_holdings:
                current_price = positive_holdings[trade.coin_symbol].get("current_price", 0)
                if current_price > 0:
                    if trade.trade_type.value == "buy":
                        trade_data["profit_loss"] = (current_price - float(trade.price_at_trade)) * float(trade.quantity)
                    else:  # sell
                        trade_data["profit_loss"] = (float(trade.price_at_trade) - current_price) * float(trade.quantity)
            
            recent_trades.append(trade_data)
        
        return {
            "balance": balance,
            "holdings": positive_holdings,
            "recent_trades": recent_trades,
            "total_trades": len(trades)
        }
    except Exception as e:
        logger.error(f"Error fetching portfolio data: {e}")
        return {
            "balance": 0.0,
            "holdings": {},
            "recent_trades": [],
            "total_trades": 0
        }

async def fetch_market_data():
    """Fetch current market data for top cryptocurrencies"""
    try:
        # Get prices for top coins
        top_coins = ["BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "AVAX", "DOT", "MATIC"]
        market_data = {}
        
        for coin in top_coins:
            try:
                price_response = await price_service.get_price(coin)
                if price_response:
                    market_data[coin] = {
                        "price": float(price_response.price_usd),
                        "change_24h": float(price_response.price_change_percentage_24h)
                    }
            except Exception as e:
                logger.warning(f"Could not fetch price for {coin}: {e}")
                continue
        
        return market_data
    except Exception as e:
        logger.error(f"Error fetching market data: {e}")
        return {}

async def simulate_trade(entry_price: float, exit_price: float, position_size: float, leverage: float = 1.0) -> Dict[str, Any]:
    """Simulate a trade and calculate profit/loss"""
    try:
        # Calculate position value
        position_value = position_size * entry_price
        
        # Calculate leveraged position value
        leveraged_position_value = position_value * leverage
        
        # Calculate profit/loss
        price_change = exit_price - entry_price
        price_change_percent = (price_change / entry_price) * 100
        
        # Calculate leveraged profit/loss
        leveraged_pnl = price_change * position_size * leverage
        leveraged_pnl_percent = (leveraged_pnl / position_value) * 100
        
        # Calculate fees (assuming 0.1% per trade)
        entry_fee = position_value * 0.001
        exit_fee = (position_size * exit_price) * 0.001
        total_fees = entry_fee + exit_fee
        
        # Net profit/loss after fees
        net_pnl = leveraged_pnl - total_fees
        net_pnl_percent = (net_pnl / position_value) * 100
        
        # Risk metrics
        risk_reward_ratio = abs(leveraged_pnl / total_fees) if total_fees > 0 else 0
        
        return {
            "entry_price": entry_price,
            "exit_price": exit_price,
            "position_size": position_size,
            "leverage": leverage,
            "position_value": position_value,
            "leveraged_position_value": leveraged_position_value,
            "price_change": price_change,
            "price_change_percent": price_change_percent,
            "gross_pnl": leveraged_pnl,
            "gross_pnl_percent": leveraged_pnl_percent,
            "entry_fee": entry_fee,
            "exit_fee": exit_fee,
            "total_fees": total_fees,
            "net_pnl": net_pnl,
            "net_pnl_percent": net_pnl_percent,
            "risk_reward_ratio": risk_reward_ratio,
            "is_profitable": net_pnl > 0
        }
    except Exception as e:
        logger.error(f"Error simulating trade: {e}")
        return {}

def extract_trade_parameters(message: str) -> Optional[Dict[str, float]]:
    """Extract trade parameters from user message using regex"""
    try:
        # Common patterns for trade simulation requests
        patterns = {
            'entry_price': [
                r'entry[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'buy[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'enter[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'entry[:\s]*price[:\s]*\$?([0-9,]+\.?[0-9]*)'
            ],
            'exit_price': [
                r'exit[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'sell[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'target[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'exit[:\s]*price[:\s]*\$?([0-9,]+\.?[0-9]*)'
            ],
            'position_size': [
                r'position[:\s]*size[:\s]*([0-9,]+\.?[0-9]*)',
                r'amount[:\s]*([0-9,]+\.?[0-9]*)',
                r'quantity[:\s]*([0-9,]+\.?[0-9]*)',
                r'([0-9,]+\.?[0-9]*)\s*(?:btc|bitcoin|eth|ethereum|coins?|tokens?)'
            ],
            'leverage': [
                r'leverage[:\s]*([0-9]+\.?[0-9]*)x?',
                r'([0-9]+\.?[0-9]*)x\s*leverage',
                r'([0-9]+\.?[0-9]*)x'
            ]
        }
        
        extracted = {}
        message_lower = message.lower()
        
        for param, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, message_lower)
                if match:
                    value_str = match.group(1).replace(',', '')
                    try:
                        extracted[param] = float(value_str)
                        break
                    except ValueError:
                        continue
        
        # If we have at least entry and exit prices, we can simulate
        if 'entry_price' in extracted and 'exit_price' in extracted:
            # Set defaults for missing parameters
            if 'position_size' not in extracted:
                extracted['position_size'] = 1.0  # Default to 1 unit
            if 'leverage' not in extracted:
                extracted['leverage'] = 1.0  # Default to no leverage
            
            return extracted
        
        return None
    except Exception as e:
        logger.error(f"Error extracting trade parameters: {e}")
        return None

def format_trade_simulation_result(result: Dict[str, Any]) -> str:
    """Format trade simulation result into conversational text"""
    if not result:
        return "I couldn't calculate the trade simulation. Please provide clear entry and exit prices."
    
    entry_price = result['entry_price']
    exit_price = result['exit_price']
    position_size = result['position_size']
    leverage = result['leverage']
    net_pnl = result['net_pnl']
    net_pnl_percent = result['net_pnl_percent']
    total_fees = result['total_fees']
    is_profitable = result['is_profitable']
    
    # Determine trade direction
    direction = "long" if exit_price > entry_price else "short"
    
    # Create conversational explanation
    explanation = f"Let me walk you through this {direction} trade simulation:\n\n"
    
    explanation += f"📊 **Trade Setup:**\n"
    explanation += f"• Entry Price: ${entry_price:,.2f}\n"
    explanation += f"• Exit Price: ${exit_price:,.2f}\n"
    explanation += f"• Position Size: {position_size:,.4f} units\n"
    if leverage > 1.0:
        explanation += f"• Leverage: {leverage:.1f}x\n"
    
    explanation += f"\n💰 **Results:**\n"
    if is_profitable:
        explanation += f"• ✅ **Profit: ${net_pnl:,.2f}** ({net_pnl_percent:+.2f}%)\n"
        explanation += f"• 🎯 Great trade! You made a {net_pnl_percent:.1f}% return on your position.\n"
    else:
        explanation += f"• ❌ **Loss: ${abs(net_pnl):,.2f}** ({net_pnl_percent:+.2f}%)\n"
        explanation += f"• ⚠️ This trade would result in a {abs(net_pnl_percent):.1f}% loss.\n"
    
    explanation += f"\n📈 **Breakdown:**\n"
    explanation += f"• Price Change: {((exit_price - entry_price) / entry_price * 100):+.2f}%\n"
    explanation += f"• Trading Fees: ${total_fees:.2f}\n"
    if leverage > 1.0:
        explanation += f"• Leveraged Effect: {leverage:.1f}x multiplier applied\n"
    
    # Add coaching advice
    explanation += f"\n🎓 **Trading Coach Tips:**\n"
    if is_profitable:
        if net_pnl_percent > 10:
            explanation += f"• Excellent trade! This is a strong {net_pnl_percent:.1f}% gain.\n"
        elif net_pnl_percent > 5:
            explanation += f"• Good trade! A solid {net_pnl_percent:.1f}% profit.\n"
        else:
            explanation += f"• Decent trade, but consider if the risk was worth the {net_pnl_percent:.1f}% gain.\n"
    else:
        explanation += f"• This trade shows a {abs(net_pnl_percent):.1f}% loss. Consider:\n"
        explanation += f"  - Setting stop-losses to limit downside\n"
        explanation += f"  - Position sizing to manage risk\n"
        explanation += f"  - Market conditions before entering\n"
    
    if leverage > 1.0:
        explanation += f"• ⚠️ Remember: {leverage:.1f}x leverage amplifies both gains AND losses!\n"
    
    explanation += f"• Always do your own research and never risk more than you can afford to lose."
    
    return explanation

async def calculate_position_size(account_balance: float, risk_percentage: float, entry_price: float, stop_loss_price: float) -> Dict[str, Any]:
    """Calculate safe position size based on risk management principles"""
    try:
        # Calculate risk per unit (price difference between entry and stop loss)
        risk_per_unit = abs(entry_price - stop_loss_price)
        
        # Calculate maximum amount to risk (percentage of account balance)
        max_risk_amount = account_balance * (risk_percentage / 100)
        
        # Calculate maximum position size (risk amount divided by risk per unit)
        max_position_size = max_risk_amount / risk_per_unit if risk_per_unit > 0 else 0
        
        # Calculate position value
        position_value = max_position_size * entry_price
        
        # Calculate risk-to-reward ratio (assuming 2:1 reward target)
        reward_target = entry_price + (2 * risk_per_unit) if entry_price > stop_loss_price else entry_price - (2 * risk_per_unit)
        potential_reward = abs(reward_target - entry_price) * max_position_size
        risk_reward_ratio = potential_reward / max_risk_amount if max_risk_amount > 0 else 0
        
        # Calculate percentage of account used
        account_percentage_used = (position_value / account_balance) * 100 if account_balance > 0 else 0
        
        # Risk assessment
        risk_level = "Low" if risk_percentage <= 1 else "Medium" if risk_percentage <= 3 else "High"
        
        return {
            "account_balance": account_balance,
            "risk_percentage": risk_percentage,
            "entry_price": entry_price,
            "stop_loss_price": stop_loss_price,
            "risk_per_unit": risk_per_unit,
            "max_risk_amount": max_risk_amount,
            "max_position_size": max_position_size,
            "position_value": position_value,
            "account_percentage_used": account_percentage_used,
            "risk_reward_ratio": risk_reward_ratio,
            "reward_target": reward_target,
            "potential_reward": potential_reward,
            "risk_level": risk_level,
            "is_safe": account_percentage_used <= 20  # Safe if using less than 20% of account
        }
    except Exception as e:
        logger.error(f"Error calculating position size: {e}")
        return {}

def extract_position_sizing_parameters(message: str) -> Optional[Dict[str, float]]:
    """Extract position sizing parameters from user message"""
    try:
        patterns = {
            'account_balance': [
                r'balance[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'account[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'portfolio[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'capital[:\s]*\$?([0-9,]+\.?[0-9]*)'
            ],
            'risk_percentage': [
                r'risk[:\s]*([0-9]+\.?[0-9]*)\s*%?',
                r'([0-9]+\.?[0-9]*)\s*%\s*risk',
                r'risk[:\s]*percentage[:\s]*([0-9]+\.?[0-9]*)',
                r'([0-9]+\.?[0-9]*)\s*percent[:\s]*risk'
            ],
            'entry_price': [
                r'entry[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'buy[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'enter[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'entry[:\s]*price[:\s]*\$?([0-9,]+\.?[0-9]*)'
            ],
            'stop_loss_price': [
                r'stop[:\s]*loss[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'stop[:\s]*at[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'sl[:\s]*\$?([0-9,]+\.?[0-9]*)',
                r'stop[:\s]*loss[:\s]*price[:\s]*\$?([0-9,]+\.?[0-9]*)'
            ]
        }
        
        extracted = {}
        message_lower = message.lower()
        
        for param, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, message_lower)
                if match:
                    value_str = match.group(1).replace(',', '')
                    try:
                        extracted[param] = float(value_str)
                        break
                    except ValueError:
                        continue
        
        # Check if we have all required parameters
        required_params = ['account_balance', 'risk_percentage', 'entry_price', 'stop_loss_price']
        if all(param in extracted for param in required_params):
            return extracted
        
        return None
    except Exception as e:
        logger.error(f"Error extracting position sizing parameters: {e}")
        return None

def format_position_sizing_result(result: Dict[str, Any]) -> str:
    """Format position sizing result into beginner-friendly explanation"""
    if not result:
        return "I couldn't calculate the position size. Please provide your account balance, risk percentage, entry price, and stop loss price."
    
    account_balance = result['account_balance']
    risk_percentage = result['risk_percentage']
    entry_price = result['entry_price']
    stop_loss_price = result['stop_loss_price']
    max_position_size = result['max_position_size']
    position_value = result['position_value']
    max_risk_amount = result['max_risk_amount']
    account_percentage_used = result['account_percentage_used']
    risk_reward_ratio = result['risk_reward_ratio']
    risk_level = result['risk_level']
    is_safe = result['is_safe']
    
    # Determine trade direction
    direction = "long" if entry_price > stop_loss_price else "short"
    
    explanation = f"Let me calculate the safest position size for your {direction} trade:\n\n"
    
    explanation += f"📊 **Your Trade Setup:**\n"
    explanation += f"• Account Balance: ${account_balance:,.2f}\n"
    explanation += f"• Risk Tolerance: {risk_percentage:.1f}% of account\n"
    explanation += f"• Entry Price: ${entry_price:,.2f}\n"
    explanation += f"• Stop Loss: ${stop_loss_price:,.2f}\n"
    
    explanation += f"\n🛡️ **Safe Position Size Calculation:**\n"
    explanation += f"• Maximum Risk Amount: ${max_risk_amount:,.2f}\n"
    explanation += f"• Risk Per Unit: ${result['risk_per_unit']:,.2f}\n"
    explanation += f"• **Recommended Position Size: {max_position_size:,.4f} units**\n"
    explanation += f"• Position Value: ${position_value:,.2f}\n"
    explanation += f"• Account Usage: {account_percentage_used:.1f}%\n"
    
    explanation += f"\n📈 **Risk Analysis:**\n"
    explanation += f"• Risk Level: {risk_level}\n"
    explanation += f"• Risk-to-Reward Ratio: 1:{risk_reward_ratio:.1f}\n"
    explanation += f"• Potential Reward: ${result['potential_reward']:,.2f}\n"
    
    # Safety assessment
    if is_safe:
        explanation += f"\n✅ **Safety Assessment:**\n"
        explanation += f"• This position size is SAFE for your account\n"
        explanation += f"• You're only using {account_percentage_used:.1f}% of your balance\n"
        explanation += f"• Even if you lose, you'll only lose {risk_percentage:.1f}% of your account\n"
    else:
        explanation += f"\n⚠️ **Safety Warning:**\n"
        explanation += f"• This position uses {account_percentage_used:.1f}% of your account\n"
        explanation += f"• Consider reducing position size for better risk management\n"
        explanation += f"• Recommended: Use no more than 20% of account per trade\n"
    
    # Beginner-friendly explanation
    explanation += f"\n🎓 **Why This Size is Safe (Beginner's Guide):**\n"
    explanation += f"• **Risk Management**: You're only risking {risk_percentage:.1f}% of your account\n"
    explanation += f"• **Position Sizing**: The math ensures you can't lose more than you're comfortable with\n"
    explanation += f"• **Stop Loss Protection**: If price hits ${stop_loss_price:,.2f}, you'll exit and lose only ${max_risk_amount:,.2f}\n"
    explanation += f"• **Account Preservation**: Even if this trade fails, you'll still have ${account_balance - max_risk_amount:,.2f} left\n"
    
    if risk_reward_ratio >= 2:
        explanation += f"• **Good Risk-Reward**: You're risking ${max_risk_amount:,.2f} to potentially make ${result['potential_reward']:,.2f}\n"
    else:
        explanation += f"• **Risk-Reward Note**: Consider if the potential reward justifies the risk\n"
    
    explanation += f"\n💡 **Pro Tips:**\n"
    explanation += f"• Never risk more than 1-2% per trade as a beginner\n"
    explanation += f"• Always set your stop loss before entering the trade\n"
    explanation += f"• This calculation assumes you'll stick to your stop loss\n"
    explanation += f"• Consider market volatility when setting stop loss levels\n"
    
    return explanation

async def create_journal_entry(user_message: str, user_id: int, db: Session) -> Dict[str, Any]:
    """Create a structured journal entry from user's reflection"""
    try:
        # Extract key information from the user's message
        journal_data = {
            "user_id": user_id,
            "raw_reflection": user_message,
            "trade_idea": "",
            "emotions": "",
            "outcome": "",
            "lessons_learned": "",
            "created_at": None
        }
        
        # Use simple keyword extraction to identify components
        message_lower = user_message.lower()
        
        # Extract trade idea (mentions of buying, selling, trading, etc.)
        trade_keywords = ['bought', 'sold', 'traded', 'bought', 'sold', 'trade', 'position', 'entry', 'exit', 'bitcoin', 'btc', 'ethereum', 'eth']
        if any(keyword in message_lower for keyword in trade_keywords):
            # Extract the trade-related part
            trade_idea = user_message
            journal_data["trade_idea"] = trade_idea[:200] + "..." if len(trade_idea) > 200 else trade_idea
        
        # Extract emotions (mentions of feelings, emotions, etc.)
        emotion_keywords = ['felt', 'feeling', 'excited', 'nervous', 'confident', 'worried', 'happy', 'sad', 'frustrated', 'proud', 'anxious', 'calm']
        emotions = []
        for keyword in emotion_keywords:
            if keyword in message_lower:
                emotions.append(keyword)
        if emotions:
            journal_data["emotions"] = ", ".join(emotions)
        
        # Extract outcome (mentions of profit, loss, results, etc.)
        outcome_keywords = ['profit', 'loss', 'gained', 'lost', 'won', 'lost', 'successful', 'failed', 'result', 'outcome']
        if any(keyword in message_lower for keyword in outcome_keywords):
            journal_data["outcome"] = "Mentioned in reflection"
        
        # Extract lessons learned (mentions of learn, lesson, realize, understand, etc.)
        lesson_keywords = ['learned', 'lesson', 'realize', 'understand', 'know', 'discover', 'insight', 'takeaway']
        if any(keyword in message_lower for keyword in lesson_keywords):
            journal_data["lessons_learned"] = "Mentioned in reflection"
        
        return journal_data
    except Exception as e:
        logger.error(f"Error creating journal entry: {e}")
        return {}

def format_journal_summary(journal_data: Dict[str, Any]) -> str:
    """Format journal entry into a motivating summary"""
    if not journal_data:
        return "I couldn't process your journal entry. Please try again with more details about your trading experience."
    
    raw_reflection = journal_data.get("raw_reflection", "")
    trade_idea = journal_data.get("trade_idea", "")
    emotions = journal_data.get("emotions", "")
    outcome = journal_data.get("outcome", "")
    lessons_learned = journal_data.get("lessons_learned", "")
    
    summary = f"📝 **Your Trading Journal Entry**\n\n"
    
    summary += f"**Reflection:** {raw_reflection}\n\n"
    
    if trade_idea:
        summary += f"🎯 **Trade Idea:** {trade_idea}\n\n"
    
    if emotions:
        summary += f"💭 **Emotions:** {emotions}\n\n"
    
    if outcome:
        summary += f"📊 **Outcome:** {outcome}\n\n"
    
    if lessons_learned:
        summary += f"🎓 **Lessons Learned:** {lessons_learned}\n\n"
    
    # Add motivating feedback
    summary += f"🌟 **Coach's Reflection:**\n"
    
    # Analyze the tone and provide appropriate feedback
    if any(word in raw_reflection.lower() for word in ['profit', 'gained', 'won', 'successful', 'happy']):
        summary += f"• Great job on this trade! It's wonderful to see you learning and growing.\n"
        summary += f"• Remember to analyze what went right so you can repeat it.\n"
    elif any(word in raw_reflection.lower() for word in ['loss', 'lost', 'failed', 'mistake', 'wrong']):
        summary += f"• Every trader faces losses - it's part of the learning process.\n"
        summary += f"• The important thing is that you're reflecting and learning from this experience.\n"
    else:
        summary += f"• Thank you for sharing your trading experience with me.\n"
        summary += f"• Reflection is one of the most powerful tools for improving as a trader.\n"
    
    summary += f"• Keep journaling your trades - it will help you identify patterns and improve.\n"
    summary += f"• Consider what you learned and how you can apply it to future trades.\n"
    
    return summary

def extract_journal_parameters(message: str) -> bool:
    """Check if the message is a journal entry/reflection"""
    try:
        message_lower = message.lower()
        
        # Strong indicators of journaling (must contain these)
        strong_journal_indicators = [
            'i bought', 'i sold', 'i traded', 'i learned', 'i realized', 'i felt',
            'my trade', 'today i', 'yesterday i', 'this week i', 'i was',
            'journal', 'reflection', 'reflecting'
        ]
        
        # Check for strong indicators first
        if any(indicator in message_lower for indicator in strong_journal_indicators):
            return True
        
        # Check for combination of keywords that suggest reflection
        emotion_words = ['felt', 'feeling', 'excited', 'nervous', 'confident', 'worried', 'happy', 'sad', 'frustrated', 'proud', 'anxious', 'calm']
        trade_words = ['bought', 'sold', 'traded', 'trade', 'bitcoin', 'btc', 'ethereum', 'eth']
        learning_words = ['learned', 'lesson', 'realize', 'understand', 'know', 'discover', 'insight', 'takeaway']
        
        # Must have at least 2 categories and be a substantial message
        categories_found = 0
        if any(word in message_lower for word in emotion_words):
            categories_found += 1
        if any(word in message_lower for word in trade_words):
            categories_found += 1
        if any(word in message_lower for word in learning_words):
            categories_found += 1
        
        # If we have 2+ categories and message is substantial, likely a journal entry
        if categories_found >= 2 and len(message) > 80:
            return True
        
        return False
    except Exception as e:
        logger.error(f"Error extracting journal parameters: {e}")
        return False

async def get_onboarding_status(user_id: int, db: Session) -> Dict[str, Any]:
    """Get user's onboarding progress"""
    try:
        # Check if user has made any trades
        trades_count = db.query(Trade).filter(Trade.user_id == user_id).count()
        
        # Check if user has any journal entries (we'll store this in a simple way)
        # For now, we'll use a simple approach - in production, you'd have a proper journal table
        
        return {
            "user_id": user_id,
            "has_made_trades": trades_count > 0,
            "trades_count": trades_count,
            "onboarding_step": "welcome" if trades_count == 0 else "trading" if trades_count < 3 else "advanced",
            "needs_journaling": trades_count > 0,
            "is_new_user": trades_count == 0
        }
    except Exception as e:
        logger.error(f"Error getting onboarding status: {e}")
        # If database error, assume user is not new to avoid aggressive onboarding
        return {
            "user_id": user_id,
            "has_made_trades": True,  # Assume they have trades to avoid onboarding
            "trades_count": 5,  # Assume some experience
            "onboarding_step": "advanced",
            "needs_journaling": True,
            "is_new_user": False  # Don't treat as new user if DB error
        }

def format_onboarding_response(onboarding_status: Dict[str, Any], user_message: str) -> str:
    """Format onboarding response based on user's progress"""
    step = onboarding_status.get("onboarding_step", "welcome")
    is_new_user = onboarding_status.get("is_new_user", True)
    trades_count = onboarding_status.get("trades_count", 0)
    
    if step == "welcome" and is_new_user:
        return f"""🎉 **Welcome to BitcoinPro.in!** I'm your personal trading mentor.

I'm here to guide you through your crypto trading journey step by step. Let's start with the basics:

📚 **Step 1: Understanding the Platform**
• You're on a demo trading platform - no real money at risk
• You can practice trading with virtual funds
• Learn risk management before using real money

🎯 **Step 2: Your First Trade**
• Go to the Trading page
• Choose a cryptocurrency (I recommend starting with Bitcoin)
• Start with a small position size
• Set a stop loss to limit your risk

💡 **What would you like to do first?**
• Say "help me make my first trade" for step-by-step guidance
• Ask "what is risk management?" to learn the basics
• Or just start exploring the platform!

Remember: I'm here to help you learn safely. What questions do you have?"""

    elif step == "trading" and trades_count > 0:
        return f"""🚀 **Great job on your first trade!** You're making progress.

📊 **You've made {trades_count} trade(s) so far. Here's what's next:**

🎓 **Step 3: Learning from Your Trades**
• Reflect on what happened in your trade
• What did you learn? How did you feel?
• Journaling helps you improve faster

📝 **Try journaling your experience:**
• Tell me about your trade: "I bought Bitcoin at $100k and sold at $105k. I felt excited but nervous. I learned that I need to be more patient."

💡 **Next Steps:**
• Continue practicing with small positions
• Learn about position sizing and risk management
• Start building your trading journal

What would you like to work on next?"""

    elif step == "advanced":
        return f"""🌟 **You're becoming a more experienced trader!** 

📈 **You've made {trades_count} trades - that's great practice!**

🎯 **Advanced Topics:**
• Position sizing and risk management
• Market analysis and timing
• Emotional control and discipline
• Building a consistent strategy

📝 **Keep Journaling:**
• Continue reflecting on your trades
• Look for patterns in your successes and failures
• Use your journal to improve your strategy

💡 **I'm here to help with:**
• Trade simulations and analysis
• Position sizing calculations
• Risk management advice
• Strategy development

What aspect of trading would you like to focus on today?"""

    else:
        return f"""👋 **Hello! I'm your trading mentor.**

I'm here to help you with:
• Trade simulations and analysis
• Position sizing calculations
• Risk management advice
• Journaling your trading experiences
• Learning and improving your skills

What would you like to work on today?"""

async def call_openai_api(user_message: str, context: str):
    """Call OpenAI API with user message and context"""
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            logger.warning("OpenAI API key not found, using fallback response")
            return "I'm here to help with your crypto trading questions! However, I'm currently unable to access advanced AI features. Please ask me about trading strategies, portfolio management, or platform navigation."
        
        system_prompt = """You are an expert crypto trading assistant with access to the user's real portfolio data. You can execute actual trades when requested.

**Your capabilities:**
- Analyze user's portfolio and trading performance
- Provide market insights and recommendations
- Execute buy/sell orders when user requests
- Give personalized trading advice based on their balance and holdings

**Response style:**
- Be conversational and helpful
- Use **bold** for important numbers and crypto symbols
- Keep responses concise but informative
- Always consider the user's actual balance and holdings
- If they have money, suggest specific trades
- If they're new, guide them step by step

**Format examples:**
- Crypto symbols: **BTC**, **ETH**, **SOL**
- Prices: **$50,000**, **$3,500**
- Percentages: **+2.5%**, **-1.2%**
- User balance: **$2,144,111** (use their actual balance)

**Key rules:**
- If user asks to buy crypto, you can execute the trade
- Always check their balance before suggesting trades
- Provide specific, actionable advice
- Be encouraging but realistic about risks"""
        
        user_prompt = f"""User: {user_message}
        
        Context: {context}
        
        Respond quickly and concisely.provide a helpful response based on the user's portfolio and current market."""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 150,
                    "temperature": 0.3,
                    "stream": False
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return "I'm having trouble processing your request right now. Please try again in a moment."
                
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}")
        return "I'm experiencing technical difficulties. Please try again later or contact support if the issue persists."

@router.post("/api/chatbot", response_model=ChatResponse)
async def chatbot_endpoint(
    message_data: ChatMessage,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enhanced chatbot endpoint with OpenAI integration, personalized responses, and trade simulation
    """
    try:
        user_message = message_data.message.strip()
        
        # Get user's onboarding status
        onboarding_status = await get_onboarding_status(user.id, db)
        
        # Check if user wants to buy crypto - ACT AS TRADING AGENT
        if any(keyword in user_message.lower() for keyword in ['buy', 'purchase', 'get bitcoin', 'get btc', 'buy bitcoin', 'buy btc', 'buy ethereum', 'buy eth', 'buy solana', 'buy sol']):
            try:
                # Extract amount from message (default to $100 if not specified)
                amount_match = re.search(r'\$?(\d+(?:\.\d+)?)', user_message)
                amount_usd = float(amount_match.group(1)) if amount_match else 100.0
                
                # Detect which cryptocurrency to buy
                crypto_symbol = "BTC"  # Default to Bitcoin
                crypto_name = "Bitcoin"
                
                if any(coin in user_message.lower() for coin in ['ethereum', 'eth']):
                    crypto_symbol = "ETH"
                    crypto_name = "Ethereum"
                elif any(coin in user_message.lower() for coin in ['solana', 'sol']):
                    crypto_symbol = "SOL"
                    crypto_name = "Solana"
                elif any(coin in user_message.lower() for coin in ['bitcoin', 'btc']):
                    crypto_symbol = "BTC"
                    crypto_name = "Bitcoin"
                
                # Get current crypto price
                logger.info(f"Attempting to get price for {crypto_symbol}")
                crypto_price = await price_service.get_price(crypto_symbol)
                logger.info(f"Price service returned: {crypto_price}")
                if not crypto_price:
                    # Use fallback prices if API fails
                    fallback_prices = {
                        "BTC": 110000.0,
                        "ETH": 3500.0,
                        "SOL": 200.0
                    }
                    fallback_price = fallback_prices.get(crypto_symbol, 100.0)
                    crypto_price = type('PriceResponse', (), {
                        'price_usd': fallback_price,
                        'change_24h_percent': 0.0
                    })()
                    logger.warning(f"Using fallback price for {crypto_symbol}: ${fallback_price} (API failed)")
                
                # Calculate how much crypto user can buy
                crypto_amount = amount_usd / float(crypto_price.price_usd)
                
                # Check user's wallet balance
                user_wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
                if not user_wallet or user_wallet.balance < amount_usd:
                    return ChatResponse(reply=f"❌ **Insufficient balance!**\n\nYou need ${amount_usd:.2f} but only have ${user_wallet.balance if user_wallet else 0:.2f}.\n\n💡 **Top up your wallet first!**")
                
                # Execute the actual buy order by creating trade directly
                from app.models.trade import Trade
                from decimal import Decimal
                from datetime import datetime
                
                # Create the trade record directly
                new_trade = Trade(
                    user_id=user.id,
                    coin_symbol=crypto_symbol,
                    trade_type="buy",
                    quantity=Decimal(str(crypto_amount)),
                    price_at_trade=Decimal(str(crypto_price.price_usd)),
                    total_cost=Decimal(str(amount_usd))
                )
                
                # Add to database
                db.add(new_trade)
                db.commit()
                db.refresh(new_trade)
                
                # Update user's wallet balance
                if user_wallet:
                    user_wallet.balance -= Decimal(str(amount_usd))
                    db.commit()
                
                if new_trade:
                    reply = f"✅ **{crypto_name} Purchase Executed!**\n\n"
                    reply += f"**Amount:** ${amount_usd:.2f}\n"
                    reply += f"**{crypto_name} Received:** {crypto_amount:.8f} {crypto_symbol}\n"
                    reply += f"**Price:** ${crypto_price.price_usd:,.2f}\n"
                    reply += f"**24h Change:** {crypto_price.change_24h_percent:+.2f}%\n\n"
                    reply += f"🎉 **Your {crypto_name} is now in your portfolio!**"
                else:
                    reply = f"❌ **Purchase failed!** Please try again or contact support."
                
                logger.info(f"{crypto_name} purchase executed for user {user.id}: ${amount_usd} -> {crypto_amount:.8f} {crypto_symbol}")
                return ChatResponse(reply=reply)
                
            except Exception as e:
                logger.error(f"Error executing crypto purchase: {e}")
                return ChatResponse(reply=f"❌ **Purchase failed!** Error: {str(e)}")

        # Check if user is writing a journal entry/reflection
        if extract_journal_parameters(user_message):
            # Create journal entry
            journal_data = await create_journal_entry(user_message, user.id, db)
            if journal_data:
                # Format journal summary
                reply = format_journal_summary(journal_data)
                
                # Add onboarding guidance if user is new
                if onboarding_status.get("is_new_user", True):
                    reply += f"\n\n🎓 **Mentor's Note:**\n"
                    reply += f"Great job on your first journal entry! This is an excellent habit for improving your trading skills. "
                    reply += f"Keep reflecting on your trades and you'll see your skills grow faster."
                
                logger.info(f"Journal entry created for user {user.id}: {user_message[:50]}...")
                return ChatResponse(reply=reply)
        
        # Check if user is asking for position sizing (check this first)
        position_params = extract_position_sizing_parameters(user_message)
        if position_params:
            # Calculate safe position size
            position_result = await calculate_position_size(
                position_params['account_balance'],
                position_params['risk_percentage'],
                position_params['entry_price'],
                position_params['stop_loss_price']
            )
            
            if position_result:
                # Format the result conversationally
                reply = format_position_sizing_result(position_result)
                
                # Add onboarding context if user is new
                if onboarding_status.get("is_new_user", True):
                    reply += f"\n\n🎓 **Mentor's Note:**\n"
                    reply += f"This is excellent risk management! You're learning to protect your capital. "
                    reply += f"After you make your first trade, come back and journal about your experience."
                
                logger.info(f"Position sizing completed for user {user.id}: {user_message[:50]}...")
                return ChatResponse(reply=reply)
        
        # Get user's portfolio data for context
        portfolio_data = await fetch_user_portfolio_data(user.id, db)
        
        # Quick responses for common questions (faster than API calls)
        if any(keyword in user_message.lower() for keyword in ['hello', 'hi', 'hey']):
            balance = portfolio_data.get("balance", 0)
            if balance > 1000:
                return ChatResponse(reply=f"👋 **Welcome back!** You have **${balance:,.0f}** ready to trade.\n\n**What can I help you with?**\n• **Portfolio analysis** - Review your holdings\n• **Market opportunities** - Find the best buys\n• **Risk management** - Protect your profits\n• **Trading strategies** - Optimize your approach")
            else:
                return ChatResponse(reply="👋 **Hello!** I'm your AI Trading Assistant.\n\n**Ready to start trading?**\n• **Top up wallet** - Add funds to begin\n• **Market analysis** - See current opportunities\n• **Learn trading** - Get expert guidance\n• **Portfolio tracking** - Monitor your progress")
        
        if any(keyword in user_message.lower() for keyword in ['what is bitcoin', 'what is btc', 'explain bitcoin']):
            # Get current BTC price
            try:
                btc_price = await price_service.get_price("BTC")
                if btc_price:
                    return ChatResponse(reply=f"**Bitcoin (BTC)** - The king of crypto!\n\n**Current Price:** **${btc_price.price_usd:,.2f}** ({btc_price.change_24h_percent:+.2f}%)\n\n**Why Bitcoin?**\n• **Store of value** - Digital gold\n• **Limited supply** - Only 21M will ever exist\n• **Institutional adoption** - Major companies buying\n\n**Trading tip:** Perfect for long-term holds!")
                else:
                    return ChatResponse(reply="**Bitcoin (BTC)** - The original cryptocurrency!\n\n**Key facts:**\n• **Digital gold** - Store of value\n• **Limited supply** - Only 21M coins\n• **High volatility** - Big gains, big risks\n\n**Trading tip:** Start with small amounts to learn!")
            except:
                return ChatResponse(reply="**Bitcoin (BTC)** - The original cryptocurrency!\n\n**Key facts:**\n• **Digital gold** - Store of value\n• **Limited supply** - Only 21M coins\n• **High volatility** - Big gains, big risks\n\n**Trading tip:** Start with small amounts to learn!")
        
        if any(keyword in user_message.lower() for keyword in ['how to buy', 'how to trade', 'how to start trading']):
            balance = portfolio_data.get("balance", 0)
            if balance > 0:
                return ChatResponse(reply=f"**Ready to trade with ${balance:,.2f}!**\n\n**Quick Start:**\n1. **Choose crypto** - BTC, ETH, SOL available\n2. **Set amount** - Start with $100-500\n3. **Place order** - I can execute it for you!\n\n**Just say:** \"Buy $200 of Bitcoin\" and I'll do it!")
            else:
                return ChatResponse(reply="**How to start trading:**\n\n1. **Top up wallet** - Add funds first\n2. **Choose crypto** - BTC, ETH, SOL available\n3. **Set amount** - Start with $100-500\n4. **Place order** - Use trading page\n\n**💡 Tip:** Start with $100-500 to learn!")
        
        # Market analysis and crypto recommendations
        if any(keyword in user_message.lower() for keyword in ['best crypto', 'which crypto', 'what to buy', 'market analysis', 'crypto recommendation', 'best investment']):
            try:
                # Get current prices for top cryptos
                btc_price = await price_service.get_price("BTC")
                eth_price = await price_service.get_price("ETH")
                sol_price = await price_service.get_price("SOL")
                
                recommendations = ["**🚀 Top Crypto Opportunities:**\n"]
                
                if btc_price:
                    btc_trend = "📈" if btc_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"• **Bitcoin (BTC):** ${btc_price.price_usd:,.0f} {btc_trend} {btc_price.change_24h_percent:+.2f}%")
                    recommendations.append("  - **Best for:** Long-term holds, stability")
                
                if eth_price:
                    eth_trend = "📈" if eth_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"• **Ethereum (ETH):** ${eth_price.price_usd:,.0f} {eth_trend} {eth_price.change_24h_percent:+.2f}%")
                    recommendations.append("  - **Best for:** DeFi, smart contracts, growth")
                
                if sol_price:
                    sol_trend = "📈" if sol_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"• **Solana (SOL):** ${sol_price.price_usd:,.0f} {sol_trend} {sol_price.change_24h_percent:+.2f}%")
                    recommendations.append("  - **Best for:** Fast transactions, NFTs")
                
                recommendations.append(f"\n**💡 My Recommendation:**")
                balance = portfolio_data.get("balance", 0)
                if balance > 10000:
                    recommendations.append("• **Diversify:** Split between BTC (40%), ETH (40%), SOL (20%)")
                    recommendations.append("• **Amount:** Start with $1,000-2,000 per coin")
                elif balance > 1000:
                    recommendations.append("• **Focus:** Choose 1-2 coins to start")
                    recommendations.append("• **Amount:** $500-1,000 per position")
                else:
                    recommendations.append("• **Start small:** Pick one coin you believe in")
                    recommendations.append("• **Amount:** $100-500 to learn")
                
                recommendations.append(f"\n**Ready to buy?** Just say: \"Buy $500 of Bitcoin\"")
                
                return ChatResponse(reply="\n".join(recommendations))
                
            except Exception as e:
                logger.error(f"Error getting market analysis: {e}")
                return ChatResponse(reply="**Market Analysis:**\n\n**Top Picks:**\n• **Bitcoin (BTC)** - Digital gold, store of value\n• **Ethereum (ETH)** - Smart contracts, DeFi leader\n• **Solana (SOL)** - Fast, cheap transactions\n\n**💡 Tip:** Start with Bitcoin for stability!")
        
        # Portfolio analysis requests
        if any(keyword in user_message.lower() for keyword in ['analyze my portfolio', 'portfolio analysis', 'analyze portfolio', 'portfolio review', 'my portfolio', 'portfolio performance']):
            try:
                # Get user's actual portfolio data
                portfolio_data = await fetch_user_portfolio_data(user.id, db)
                
                if portfolio_data["balance"] <= 0 and not portfolio_data["holdings"]:
                    return ChatResponse(reply="**Portfolio Analysis:**\n\n📊 **Current Status:** Empty portfolio\n\n**Recommendations:**\n• **Start with $100-500** for learning\n• **Consider BTC** for stability\n• **Diversify gradually** with ETH, SOL\n\n**💡 Tip:** Begin with small amounts to learn the market!")
                
                # Build portfolio analysis
                analysis_parts = ["**📊 Portfolio Analysis:**\n"]
                
                # Balance analysis
                if portfolio_data["balance"] > 0:
                    analysis_parts.append(f"**💰 Available Balance:** ${portfolio_data['balance']:,.2f}")
                
                # Holdings analysis
                if portfolio_data["holdings"]:
                    analysis_parts.append(f"\n**📈 Current Holdings:** {len(portfolio_data['holdings'])} coins")
                    
                    total_value = 0
                    for coin, data in portfolio_data["holdings"].items():
                        quantity = data['quantity']
                        current_price = data.get('current_price', 0)
                        value = quantity * current_price
                        total_value += value
                        
                        # Get price change if available
                        price_change = data.get('price_change_24h', 0)
                        change_color = "🟢" if price_change >= 0 else "🔴"
                        
                        analysis_parts.append(f"• **{coin}:** {quantity:.4f} coins (${value:,.2f}) {change_color} {price_change:+.2f}%")
                    
                    analysis_parts.append(f"\n**💎 Total Portfolio Value:** ${total_value:,.2f}")
                    
                    # Performance analysis
                    if portfolio_data["recent_trades"]:
                        profitable_trades = sum(1 for trade in portfolio_data["recent_trades"] if trade.get('profit_loss', 0) > 0)
                        total_trades = len(portfolio_data["recent_trades"])
                        win_rate = (profitable_trades / total_trades * 100) if total_trades > 0 else 0
                        
                        analysis_parts.append(f"\n**📊 Trading Performance:**")
                        analysis_parts.append(f"• **Win Rate:** {win_rate:.1f}% ({profitable_trades}/{total_trades} trades)")
                        analysis_parts.append(f"• **Total Trades:** {total_trades}")
                    
                    # Recommendations
                    analysis_parts.append(f"\n**💡 Recommendations:**")
                    if total_value < 1000:
                        analysis_parts.append("• **Consider increasing position sizes** gradually")
                    if len(portfolio_data["holdings"]) < 3:
                        analysis_parts.append("• **Diversify** with more cryptocurrencies")
                    analysis_parts.append("• **Monitor market trends** regularly")
                    analysis_parts.append("• **Set stop-losses** for risk management")
                else:
                    analysis_parts.append(f"\n**📈 Holdings:** None")
                    analysis_parts.append(f"\n**💡 Recommendations:**")
                    analysis_parts.append("• **Start trading** with available balance")
                    analysis_parts.append("• **Begin with BTC** for stability")
                    analysis_parts.append("• **Learn gradually** with small amounts")
                
                reply = "\n".join(analysis_parts)
                logger.info(f"Portfolio analysis completed for user {user.id}")
                return ChatResponse(reply=reply)
                
            except Exception as e:
                logger.error(f"Error analyzing portfolio: {e}")
                return ChatResponse(reply="❌ **Unable to analyze portfolio right now.** Please try again later.")
        
        # Check if user is asking for onboarding help (only for specific onboarding messages)
        if any(keyword in user_message.lower() for keyword in ['help me', 'guide me', 'mentor', 'onboarding', 'new to trading', 'first trade', 'start trading', 'begin trading', 'how to start', 'i am new', 'beginner', 'getting started']):
            
            # Provide onboarding guidance
            reply = format_onboarding_response(onboarding_status, user_message)
            
            # Add specific guidance based on user's message
            if 'first trade' in user_message.lower() or 'make trade' in user_message.lower():
                reply += f"\n\n🎯 **Step-by-Step First Trade Guide:**\n"
                reply += f"1. Go to the Trading page\n"
                reply += f"2. Select Bitcoin (BTC) - it's the most stable for beginners\n"
                reply += f"3. Choose a small amount (like $100-500)\n"
                reply += f"4. Set a stop loss at 5-10% below entry price\n"
                reply += f"5. Click 'Buy' and watch your trade\n"
                reply += f"6. Come back and journal about your experience!\n\n"
                reply += f"Need help with any of these steps? Just ask!"
            
            elif 'risk management' in user_message.lower():
                reply += f"\n\n🛡️ **Risk Management Basics:**\n"
                reply += f"• Never risk more than 1-2% of your account per trade\n"
                reply += f"• Always set stop losses to limit losses\n"
                reply += f"• Use position sizing to control risk\n"
                reply += f"• Start small and learn before increasing size\n\n"
                reply += f"Want me to calculate a safe position size for you? Just tell me your account balance and risk tolerance!"
            
            logger.info(f"Onboarding guidance provided for user {user.id}: {user_message[:50]}...")
            return ChatResponse(reply=reply)
        
        # Check if user is asking for trade simulation
        trade_params = extract_trade_parameters(user_message)
        if trade_params:
            # Simulate the trade
            simulation_result = await simulate_trade(
                trade_params['entry_price'],
                trade_params['exit_price'],
                trade_params['position_size'],
                trade_params['leverage']
            )
            
            if simulation_result:
                # Format the result conversationally
                reply = format_trade_simulation_result(simulation_result)
                
                # Add context about user's portfolio for additional insights
                portfolio_data = await fetch_user_portfolio_data(user.id, db)
                if portfolio_data["balance"] > 0:
                    reply += f"\n\n💡 **Portfolio Context:**\n"
                    reply += f"With your current balance of ${portfolio_data['balance']:,.2f}, "
                    
                    position_value = simulation_result['position_value']
                    if position_value <= portfolio_data['balance']:
                        reply += f"this ${position_value:,.2f} position represents {((position_value / portfolio_data['balance']) * 100):.1f}% of your portfolio. "
                        if simulation_result['net_pnl_percent'] > 0:
                            reply += f"A {simulation_result['net_pnl_percent']:.1f}% gain would add ${simulation_result['net_pnl']:,.2f} to your balance."
                        else:
                            reply += f"A {abs(simulation_result['net_pnl_percent']):.1f}% loss would reduce your balance by ${abs(simulation_result['net_pnl']):,.2f}."
                    else:
                        reply += f"this ${position_value:,.2f} position exceeds your current balance. Consider position sizing!"
                
                # Add onboarding context if user is new
                if onboarding_status.get("is_new_user", True):
                    reply += f"\n\n🎓 **Mentor's Note:**\n"
                    reply += f"Great job exploring trade scenarios! This is how you learn before risking real money. "
                    reply += f"Try making your first actual trade, then come back and journal about your experience."
                
                logger.info(f"Trade simulation completed for user {user.id}: {user_message[:50]}...")
                return ChatResponse(reply=reply)
        
        # Regular chatbot flow for non-simulation requests
        # Fetch user's portfolio and trade data
        portfolio_data = await fetch_user_portfolio_data(user.id, db)
        
        # Fetch current market data
        market_data = await fetch_market_data()
        
        # Build comprehensive context for intelligent responses
        context_parts = []
        
        # User portfolio context
        balance = portfolio_data.get("balance", 0)
        holdings = portfolio_data.get("holdings", {})
        recent_trades = portfolio_data.get("recent_trades", [])
        
        if balance > 0:
            context_parts.append(f"User has ${balance:,.0f} available balance")
            if holdings:
                holdings_list = []
                total_value = 0
                for coin, data in holdings.items():
                    quantity = data.get("quantity", 0)
                    current_price = data.get("current_price", 0)
                    value = quantity * current_price
                    total_value += value
                    holdings_list.append(f"{coin}: {quantity:.4f} coins (${value:,.0f})")
                
                context_parts.append(f"Portfolio: {len(holdings)} coins, total value ${total_value:,.0f}")
                context_parts.append(f"Holdings: {', '.join(holdings_list)}")
            else:
                context_parts.append("No current holdings - ready to start trading")
        else:
            context_parts.append("New user with no balance - needs to top up wallet")
        
        # Recent trading activity
        if recent_trades:
            context_parts.append(f"Recent activity: {len(recent_trades)} trades")
            profitable_trades = sum(1 for trade in recent_trades if trade.get('profit_loss', 0) > 0)
            if len(recent_trades) > 0:
                win_rate = (profitable_trades / len(recent_trades)) * 100
                context_parts.append(f"Trading performance: {win_rate:.1f}% win rate")
        
        # Market context
        try:
            btc_price = await price_service.get_price("BTC")
            eth_price = await price_service.get_price("ETH")
            if btc_price:
                context_parts.append(f"BTC: ${btc_price.price_usd:,.0f} ({btc_price.change_24h_percent:+.1f}%)")
            if eth_price:
                context_parts.append(f"ETH: ${eth_price.price_usd:,.0f} ({eth_price.change_24h_percent:+.1f}%)")
        except:
            pass
        
        context = " | ".join(context_parts)
        
        # Call OpenAI API
        reply = await call_openai_api(user_message, context)
        
        logger.info(f"Chatbot response generated for user {user.id}: {user_message[:50]}...")
        
        return ChatResponse(reply=reply)
        
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/api/chatbot/health")
async def chatbot_health():
    """
    Health check endpoint for the chatbot service
    """
    return {"status": "healthy", "service": "chatbot"}
