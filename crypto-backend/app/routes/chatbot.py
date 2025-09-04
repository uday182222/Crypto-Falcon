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
from app.auth import get_current_user as auth_get_current_user
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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user using real webapp authentication - connects to actual user data"""
    try:
        # Use the real webapp authentication system
        user = auth_get_current_user(credentials)
        
        # Log current user info
        logger.info(f"Chatbot using real user: {user.id} ({user.username})")
        
        return user
        
    except Exception as e:
        logger.error(f"Error in chatbot get_current_user: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def fetch_user_portfolio_data(user_id: int, db: Session):
    """Fetch user's portfolio and trade history"""
    try:
        # Get user's wallet balance
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        balance = float(wallet.balance) if wallet else 0.0
        
        # Debug logging
        logger.info(f"Portfolio fetch for user {user_id}: wallet={wallet}, balance={balance}")
        if wallet:
            logger.info(f"Wallet details: user_id={wallet.user_id}, balance={wallet.balance}")
        
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
                        data["price_change_24h"] = float(getattr(current_price_data, 'price_change_percentage_24h', 0))
                        logger.info(f"Successfully fetched price for {symbol}: ${data['current_price']}")
                    else:
                        data["current_price"] = 0.0
                        data["price_change_24h"] = 0.0
                        logger.warning(f"No price data returned for {symbol}")
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

async def analyze_portfolio_for_coaching(user_id: int, db: Session) -> Dict[str, Any]:
    """Comprehensive portfolio analysis for coaching purposes"""
    try:
        # Get user's portfolio data
        portfolio_data = await fetch_user_portfolio_data(user_id, db)
        
        # Get user's wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        balance = float(wallet.balance) if wallet else 0.0
        
        # Get all user's trades for analysis
        all_trades = db.query(Trade).filter(Trade.user_id == user_id).order_by(Trade.timestamp.desc()).all()
        
        # Analyze trading patterns
        trading_analysis = {
            "total_trades": len(all_trades),
            "buy_trades": len([t for t in all_trades if t.trade_type.value == "buy"]),
            "sell_trades": len([t for t in all_trades if t.trade_type.value == "sell"]),
            "unique_coins_traded": len(set([t.coin_symbol for t in all_trades])),
            "avg_trade_size": 0,
            "total_volume": 0,
            "trading_frequency": "new" if len(all_trades) < 3 else "active" if len(all_trades) < 10 else "experienced"
        }
        
        if all_trades:
            total_volume = sum(float(t.quantity * t.price_at_trade) for t in all_trades)
            trading_analysis["total_volume"] = total_volume
            trading_analysis["avg_trade_size"] = total_volume / len(all_trades)
        
        # Analyze current holdings
        holdings_analysis = {
            "diversification_score": 0,
            "concentration_risk": "low",
            "portfolio_balance": "balanced",
            "learning_opportunities": []
        }
        
        holdings = portfolio_data.get("holdings", {})
        if holdings:
            num_holdings = len(holdings)
            holdings_analysis["diversification_score"] = min(num_holdings * 20, 100)  # Max 100
            
            # Calculate concentration
            total_value = sum(data.get("quantity", 0) * data.get("current_price", 0) for data in holdings.values())
            if total_value > 0:
                max_holding_value = max(data.get("quantity", 0) * data.get("current_price", 0) for data in holdings.values())
                concentration_percentage = (max_holding_value / total_value) * 100
                
                if concentration_percentage > 70:
                    holdings_analysis["concentration_risk"] = "high"
                elif concentration_percentage > 50:
                    holdings_analysis["concentration_risk"] = "medium"
                else:
                    holdings_analysis["concentration_risk"] = "low"
            
            # Determine portfolio balance
            if num_holdings == 1:
                holdings_analysis["portfolio_balance"] = "concentrated"
            elif num_holdings <= 3:
                holdings_analysis["portfolio_balance"] = "moderate"
            else:
                holdings_analysis["portfolio_balance"] = "diversified"
        
        # Generate learning opportunities based on analysis
        learning_opportunities = []
        
        if balance > 0 and not holdings:
            learning_opportunities.append("Start with your first crypto investment")
            learning_opportunities.append("Learn about different cryptocurrencies")
            learning_opportunities.append("Understand risk management basics")
        
        if holdings_analysis["concentration_risk"] == "high":
            learning_opportunities.append("Learn about portfolio diversification")
            learning_opportunities.append("Understand concentration risk")
        
        if trading_analysis["trading_frequency"] == "new":
            learning_opportunities.append("Learn about trading strategies")
            learning_opportunities.append("Understand market analysis")
        
        if trading_analysis["total_trades"] > 0:
            learning_opportunities.append("Analyze your trading performance")
            learning_opportunities.append("Learn from past trades")
        
        holdings_analysis["learning_opportunities"] = learning_opportunities
        
        # Risk assessment
        risk_assessment = {
            "overall_risk": "low",
            "balance_utilization": 0,
            "recommendations": []
        }
        
        if balance > 0:
            # Calculate how much of balance is being used
            total_holdings_value = sum(data.get("quantity", 0) * data.get("current_price", 0) for data in holdings.values())
            risk_assessment["balance_utilization"] = (total_holdings_value / balance) * 100 if balance > 0 else 0
            
            if risk_assessment["balance_utilization"] > 80:
                risk_assessment["overall_risk"] = "high"
                risk_assessment["recommendations"].append("Consider keeping some cash reserves")
            elif risk_assessment["balance_utilization"] > 50:
                risk_assessment["overall_risk"] = "medium"
                risk_assessment["recommendations"].append("Good balance between investments and cash")
            else:
                risk_assessment["overall_risk"] = "low"
                risk_assessment["recommendations"].append("You have good cash reserves for opportunities")
        
        return {
            "portfolio_data": portfolio_data,
            "trading_analysis": trading_analysis,
            "holdings_analysis": holdings_analysis,
            "risk_assessment": risk_assessment,
            "coaching_level": "beginner" if trading_analysis["total_trades"] < 3 else "intermediate" if trading_analysis["total_trades"] < 10 else "advanced"
        }
        
    except Exception as e:
        logger.error(f"Error analyzing portfolio for coaching: {e}")
        return {
            "portfolio_data": {"balance": 0, "holdings": {}, "recent_trades": []},
            "trading_analysis": {"total_trades": 0, "trading_frequency": "new"},
            "holdings_analysis": {"diversification_score": 0, "concentration_risk": "low"},
            "risk_assessment": {"overall_risk": "low", "balance_utilization": 0},
            "coaching_level": "beginner"
        }

def format_coaching_analysis(analysis: Dict[str, Any]) -> str:
    """Format portfolio analysis into educational coaching content"""
    try:
        portfolio_data = analysis.get("portfolio_data", {})
        trading_analysis = analysis.get("trading_analysis", {})
        holdings_analysis = analysis.get("holdings_analysis", {})
        risk_assessment = analysis.get("risk_assessment", {})
        coaching_level = analysis.get("coaching_level", "beginner")
        
        balance = portfolio_data.get("balance", 0)
        holdings = portfolio_data.get("holdings", {})
        
        # Start with personalized greeting based on their situation
        if balance > 0 and holdings:
            greeting = f"🎯 **Portfolio Coaching Analysis**\n\nI've analyzed your portfolio with **${balance:,.2f}** balance and **{len(holdings)}** holdings. Let me share some insights to help you learn and improve!"
        elif balance > 0:
            greeting = f"💰 **Ready to Start Your Trading Journey!**\n\nYou have **${balance:,.2f}** ready to invest. Let me guide you through your first steps as a trader."
        else:
            greeting = f"🚀 **Welcome to Crypto Trading!**\n\nYou're starting fresh - perfect for learning the fundamentals. Let me help you understand the basics before you begin."
        
        coaching_content = [greeting]
        
        # Portfolio Analysis Section
        if holdings:
            coaching_content.append(f"\n📊 **Your Current Portfolio:**")
            
            total_value = 0
            for coin, data in holdings.items():
                quantity = data.get("quantity", 0)
                current_price = data.get("current_price", 0)
                value = quantity * current_price
                total_value += value
                
                price_change = data.get("price_change_24h", 0)
                change_emoji = "🟢" if price_change >= 0 else "🔴"
                
                coaching_content.append(f"• **{coin}:** {quantity:.4f} coins (${value:,.2f}) {change_emoji} {price_change:+.2f}%")
            
            coaching_content.append(f"\n**Total Portfolio Value:** ${total_value:,.2f}")
            
            # Educational insights about their holdings
            coaching_content.append(f"\n🎓 **What This Tells Us:**")
            
            if len(holdings) == 1:
                coaching_content.append(f"• You're **concentrated** in one asset - this can be risky but also rewarding")
                coaching_content.append(f"• **Learning opportunity:** Research portfolio diversification")
            elif len(holdings) <= 3:
                coaching_content.append(f"• You have a **moderate** level of diversification")
                coaching_content.append(f"• **Learning opportunity:** Consider adding more assets for better risk distribution")
            else:
                coaching_content.append(f"• You have **good diversification** across multiple assets")
                coaching_content.append(f"• **Learning opportunity:** Focus on optimizing your allocation strategy")
        
        # Trading Analysis Section
        total_trades = trading_analysis.get("total_trades", 0)
        if total_trades > 0:
            coaching_content.append(f"\n📈 **Your Trading Activity:**")
            coaching_content.append(f"• **Total Trades:** {total_trades}")
            coaching_content.append(f"• **Buy Orders:** {trading_analysis.get('buy_trades', 0)}")
            coaching_content.append(f"• **Sell Orders:** {trading_analysis.get('sell_trades', 0)}")
            coaching_content.append(f"• **Coins Traded:** {trading_analysis.get('unique_coins_traded', 0)}")
            
            if trading_analysis.get("avg_trade_size", 0) > 0:
                coaching_content.append(f"• **Average Trade Size:** ${trading_analysis['avg_trade_size']:,.2f}")
            
            # Educational insights about trading patterns
            coaching_content.append(f"\n🎓 **Trading Pattern Analysis:**")
            
            trading_frequency = trading_analysis.get("trading_frequency", "new")
            if trading_frequency == "new":
                coaching_content.append(f"• You're **new to trading** - focus on learning the basics")
                coaching_content.append(f"• **Learning opportunity:** Study market analysis and trading strategies")
            elif trading_frequency == "active":
                coaching_content.append(f"• You're an **active trader** - great for learning through experience")
                coaching_content.append(f"• **Learning opportunity:** Analyze your trading performance and refine your strategy")
            else:
                coaching_content.append(f"• You're an **experienced trader** - focus on advanced strategies")
                coaching_content.append(f"• **Learning opportunity:** Optimize your approach and explore new opportunities")
        
        # Risk Assessment Section
        coaching_content.append(f"\n🛡️ **Risk Assessment:**")
        
        overall_risk = risk_assessment.get("overall_risk", "low")
        balance_utilization = risk_assessment.get("balance_utilization", 0)
        
        if balance > 0:
            coaching_content.append(f"• **Balance Utilization:** {balance_utilization:.1f}% of your funds are invested")
            
            if overall_risk == "low":
                coaching_content.append(f"• **Risk Level:** Low - You have good cash reserves")
                coaching_content.append(f"• **Learning opportunity:** Consider increasing your investment allocation gradually")
            elif overall_risk == "medium":
                coaching_content.append(f"• **Risk Level:** Medium - Good balance between investments and cash")
                coaching_content.append(f"• **Learning opportunity:** Learn about rebalancing strategies")
            else:
                coaching_content.append(f"• **Risk Level:** High - Most of your funds are invested")
                coaching_content.append(f"• **Learning opportunity:** Understand the importance of cash reserves")
        
        # Personalized Profit-Focused Learning Path
        coaching_content.append(f"\n🎯 **Profit-Boosting Learning Path:**")
        
        # Generate profit-focused recommendations based on user's situation
        profit_recommendations = []
        
        if balance > 0 and holdings:
            # User has both balance and holdings - focus on optimization
            profit_recommendations.extend([
                "**Diversification Strategy** - Spread risk across 3-5 quality assets",
                "**Position Sizing** - Never risk more than 2-5% per trade",
                "**Take Profit Levels** - Set 2:1 or 3:1 risk-reward ratios",
                "**Portfolio Rebalancing** - Trim winners, add to losers monthly",
                "**Market Timing** - Learn to identify high-probability entry points"
            ])
        elif balance > 0 and not holdings:
            # User has balance but no holdings - focus on first profitable moves
            profit_recommendations.extend([
                "**Dollar-Cost Averaging** - Invest fixed amounts weekly/monthly",
                "**Blue-Chip Strategy** - Start with BTC/ETH for stability",
                "**Risk Management** - Never invest more than you can afford to lose",
                "**Market Research** - Learn fundamental analysis for better picks",
                "**Entry Timing** - Buy dips, not peaks - patience pays"
            ])
        else:
            # User has no balance - focus on learning before investing
            profit_recommendations.extend([
                "**Paper Trading** - Practice with virtual money first",
                "**Market Education** - Learn crypto fundamentals and trends",
                "**Risk Psychology** - Understand your risk tolerance",
                "**Strategy Development** - Create your personal trading plan",
                "**Capital Building** - Start with small, consistent amounts"
            ])
        
        # Add specific recommendations based on trading level
        if coaching_level == "beginner":
            profit_recommendations.extend([
                "**Start Small** - Begin with $100-500 positions",
                "**Learn Stop Losses** - Protect capital with 5-10% stops"
            ])
        elif coaching_level == "intermediate":
            profit_recommendations.extend([
                "**Advanced Analysis** - Learn technical indicators (RSI, MACD)",
                "**Portfolio Optimization** - Rebalance monthly for better returns"
            ])
        else:
            profit_recommendations.extend([
                "**Options & Derivatives** - Explore advanced profit strategies",
                "**Algorithmic Trading** - Automate profitable patterns"
            ])
        
        # Display top 5 most relevant recommendations
        for i, recommendation in enumerate(profit_recommendations[:5], 1):
            coaching_content.append(f"{i}. {recommendation}")
        
        # Coaching Level Specific Advice
        coaching_content.append(f"\n🌟 **Your Coaching Level: {coaching_level.title()}**")
        
        if coaching_level == "beginner":
            coaching_content.append(f"• **Focus on:** Learning the basics of crypto and trading")
            coaching_content.append(f"• **Next steps:** Start with small amounts and learn from each trade")
            coaching_content.append(f"• **Key concept:** Risk management is more important than profits")
        elif coaching_level == "intermediate":
            coaching_content.append(f"• **Focus on:** Refining your strategy and improving performance")
            coaching_content.append(f"• **Next steps:** Analyze your trading patterns and optimize your approach")
            coaching_content.append(f"• **Key concept:** Consistency beats perfection")
        else:
            coaching_content.append(f"• **Focus on:** Advanced strategies and portfolio optimization")
            coaching_content.append(f"• **Next steps:** Explore new opportunities and fine-tune your system")
            coaching_content.append(f"• **Key concept:** Continuous learning and adaptation")
        
        # Profit-Focused Action Items
        coaching_content.append(f"\n📝 **Your Profit Action Plan:**")
        
        if balance > 0 and holdings:
            # User has both balance and holdings - focus on optimization
            coaching_content.append(f"1. **Set Take Profit Targets** - Lock in gains at 20-50% profits")
            coaching_content.append(f"2. **Diversify Holdings** - Add 2-3 more quality assets to reduce risk")
            coaching_content.append(f"3. **Implement Stop Losses** - Protect capital with 5-10% stops")
            coaching_content.append(f"4. **Rebalance Monthly** - Trim winners, add to underperformers")
            coaching_content.append(f"5. **Track Performance** - Monitor which strategies work best")
        elif balance > 0 and not holdings:
            # User has balance but no holdings - focus on first profitable moves
            coaching_content.append(f"1. **Start with Blue Chips** - Buy BTC/ETH for stability and growth")
            coaching_content.append(f"2. **Use Dollar-Cost Averaging** - Invest $500-1000 monthly")
            coaching_content.append(f"3. **Set Entry Rules** - Only buy on 5-10% dips from recent highs")
            coaching_content.append(f"4. **Learn Technical Analysis** - Identify better entry/exit points")
            coaching_content.append(f"5. **Start Small** - Begin with $200-500 positions to learn")
        else:
            # User has no balance - focus on learning before investing
            coaching_content.append(f"1. **Paper Trade First** - Practice with virtual money for 1 month")
            coaching_content.append(f"2. **Study Market Cycles** - Learn when to buy/sell for maximum profit")
            coaching_content.append(f"3. **Build Capital** - Start with $100-200 monthly deposits")
            coaching_content.append(f"4. **Learn Risk Management** - Never risk more than 2% per trade")
            coaching_content.append(f"5. **Create Trading Plan** - Define your profit targets and risk limits")
        
        coaching_content.append(f"\n💡 **Remember:** Trading is a learning journey. Every trade teaches you something new!")
        
        return "\n".join(coaching_content)
        
    except Exception as e:
        logger.error(f"Error formatting coaching analysis: {e}")
        return "I'm having trouble analyzing your portfolio right now. Please try again later."

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
        
        system_prompt = """You are an expert crypto trading COACH and mentor with access to the user's real portfolio data. Your primary role is to EDUCATE and GUIDE users to become better traders.

**Your core mission:**
- Analyze user's balance and portfolio holdings to provide personalized coaching
- Teach trading concepts through their actual portfolio data
- Provide educational tips and learning recommendations
- Help users understand risk management and portfolio optimization
- Guide users to make informed decisions based on their current situation

**Your coaching approach:**
- Always analyze their current balance and holdings first
- Explain WHY certain strategies work based on their portfolio
- Provide educational insights about their trading patterns
- Suggest learning opportunities based on their current holdings
- Help them understand market dynamics through their portfolio

**Response style:**
- Be educational and mentoring-focused
- Use **bold** for important numbers and crypto symbols
- Explain concepts clearly for learning
- Always reference their actual balance and holdings
- Provide actionable learning steps
- Be encouraging and supportive

**Format examples:**
- Crypto symbols: **BTC**, **ETH**, **SOL**
- Prices: **$50,000**, **$3,500**
- Percentages: **+2.5%**, **-1.2%**
- User balance: **$2,144,111** (use their actual balance)

**Key coaching rules:**
- Always start by analyzing their current portfolio situation
- Explain trading concepts using their actual data
- Provide educational insights about their holdings
- Suggest learning opportunities based on their portfolio
- Help them understand risk management with their balance
- Guide them to make informed decisions, don't just execute trades"""
        
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
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7,
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
            holdings = portfolio_data.get("holdings", {})
            
            if balance > 1000 and holdings:
                return ChatResponse(reply=f"👋 **Welcome back, Trader!**\n\nI see you have **${balance:,.0f}** balance and **{len(holdings)}** holdings. Let me help you learn and improve!\n\n**🎯 What would you like to work on?**\n• **Portfolio coaching** - Analyze your holdings and learn\n• **Trading education** - Understand your patterns\n• **Risk management** - Protect and optimize your portfolio\n• **Learning path** - Personalized guidance for your level")
            elif balance > 1000:
                return ChatResponse(reply=f"💰 **Ready to start your trading journey!**\n\nYou have **${balance:,.0f}** ready to invest. Let me coach you through your first steps!\n\n**🎓 What would you like to learn?**\n• **Portfolio analysis** - Understand your current situation\n• **First investment** - Learn how to start trading\n• **Risk management** - Protect your capital\n• **Market education** - Understand crypto fundamentals")
            else:
                return ChatResponse(reply="🚀 **Welcome to Crypto Trading Education!**\n\nI'm your personal trading coach. Let me help you learn the fundamentals before you start trading!\n\n**📚 What would you like to learn?**\n• **Crypto basics** - Understand different cryptocurrencies\n• **Trading fundamentals** - Learn how markets work\n• **Risk management** - Protect your capital\n• **Portfolio strategy** - Build a solid foundation")
        
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
        
        # Add more specific question handling
        if any(keyword in user_message.lower() for keyword in ['what should i buy', 'what crypto to buy', 'recommendations']):
            balance = portfolio_data.get("balance", 0)
            holdings = portfolio_data.get("holdings", {})
            
            if balance > 0:
                if not holdings:
                    return ChatResponse(reply=f"**With ${balance:,.2f}, here's my recommendation:**\n\n**🥇 Start with Bitcoin (BTC)**\n• **Why:** Most stable, institutional backing\n• **Amount:** Use 50% of your balance\n• **Strategy:** Dollar-cost average over time\n\n**🥈 Add Ethereum (ETH)**\n• **Why:** Smart contracts, DeFi ecosystem\n• **Amount:** 30% of your balance\n• **Strategy:** Buy on dips below $3,500\n\n**🥉 Consider Solana (SOL)**\n• **Why:** Fast, cheap transactions\n• **Amount:** 20% of your balance\n• **Strategy:** High growth potential\n\n**Just say:** \"Buy $500 of Bitcoin\" and I'll execute it!")
                else:
                    return ChatResponse(reply=f"**You already have holdings! Here's how to optimize:**\n\n**📊 Current Portfolio Analysis:**\n• **Balance:** ${balance:,.2f}\n• **Holdings:** {len(holdings)} assets\n\n**🎯 Next Steps:**\n• **Diversify** - Add 2-3 more quality assets\n• **Rebalance** - Trim winners, add to losers\n• **Scale up** - Increase position sizes gradually\n\n**What specific crypto are you interested in?**")
            else:
                return ChatResponse(reply="**First, fund your account!**\n\n**Recommended starting amount:** $500-1000\n\n**Then I'll recommend:**\n• **Bitcoin** - 50% (stability)\n• **Ethereum** - 30% (growth)\n• **Solana** - 20% (potential)\n\n**Top up your wallet and ask again!**")
        
        if any(keyword in user_message.lower() for keyword in ['when to sell', 'when to buy', 'timing', 'market timing']):
            return ChatResponse(reply="**Market Timing Strategy:**\n\n**🟢 When to BUY:**\n• **Dips:** 5-10% below recent highs\n• **Support levels:** Previous resistance becomes support\n• **Fear:** When everyone's selling (contrarian)\n\n**🔴 When to SELL:**\n• **Take profits:** 20-50% gains\n• **Stop losses:** 5-10% below entry\n• **Greed:** When everyone's buying (contrarian)\n\n**💡 Pro tip:** Don't try to time perfectly - DCA works better!\n\n**What's your current situation?**")
        
        if any(keyword in user_message.lower() for keyword in ['risk management', 'how to protect', 'stop loss']):
            balance = portfolio_data.get("balance", 0)
            return ChatResponse(reply=f"**Risk Management Rules:**\n\n**🛡️ Position Sizing:**\n• **Never risk more than 2-5% per trade**\n• **With ${balance:,.2f}:** Max $1,000-2,500 per trade\n\n**📉 Stop Losses:**\n• **Set at 5-10% below entry**\n• **Protects your capital**\n• **Emotional discipline**\n\n**📊 Diversification:**\n• **Spread across 3-5 assets**\n• **Don't put all eggs in one basket**\n• **Rebalance monthly**\n\n**🎯 Risk-Reward:**\n• **Aim for 2:1 or 3:1 ratios**\n• **Risk $100 to make $200-300**\n\n**Want me to calculate your position size?**")
        
        if any(keyword in user_message.lower() for keyword in ['help', 'what can you do', 'commands']):
            return ChatResponse(reply="**I can help you with:**\n\n**💰 Trading:**\n• \"Buy $200 of Bitcoin\"\n• \"What should I buy?\"\n• \"When to sell?\"\n\n**📊 Analysis:**\n• \"Analyze my portfolio\"\n• \"Risk management\"\n• \"Market timing\"\n\n**🎓 Education:**\n• \"What is Bitcoin?\"\n• \"How to start trading?\"\n• \"Explain Ethereum\"\n\n**Just ask me anything about crypto trading!**")
        
        # If it's a question but not handled above, provide a helpful response
        if '?' in user_message or any(word in user_message.lower() for word in ['what', 'how', 'why', 'when', 'where', 'which']):
            return ChatResponse(reply="**I'd be happy to help with that!**\n\n**Can you be more specific?** For example:\n• \"What is Bitcoin?\"\n• \"How do I buy crypto?\"\n• \"When should I sell?\"\n• \"What's my portfolio worth?\"\n\n**Or just ask me to analyze your portfolio!**")

        # Market analysis and crypto education
        if any(keyword in user_message.lower() for keyword in ['best crypto', 'which crypto', 'what to buy', 'market analysis', 'crypto recommendation', 'best investment', 'learn about crypto', 'crypto education']):
            try:
                # Get current prices for top cryptos
                btc_price = await price_service.get_price("BTC")
                eth_price = await price_service.get_price("ETH")
                sol_price = await price_service.get_price("SOL")
                
                balance = portfolio_data.get("balance", 0)
                holdings = portfolio_data.get("holdings", {})
                
                # Start with educational approach
                recommendations = ["**🎓 Crypto Education & Market Analysis:**\n"]
                
                if btc_price:
                    btc_trend = "📈" if btc_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"**Bitcoin (BTC):** ${btc_price.price_usd:,.0f} {btc_trend} {btc_price.change_24h_percent:+.2f}%")
                    recommendations.append("• **What it is:** Digital gold, store of value")
                    recommendations.append("• **Why it matters:** Limited supply (21M), institutional adoption")
                    recommendations.append("• **Learning opportunity:** Study long-term value investing")
                    recommendations.append("• **Risk level:** Lower volatility, good for beginners")
                
                if eth_price:
                    eth_trend = "📈" if eth_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"\n**Ethereum (ETH):** ${eth_price.price_usd:,.0f} {eth_trend} {eth_price.change_24h_percent:+.2f}%")
                    recommendations.append("• **What it is:** Smart contract platform, DeFi leader")
                    recommendations.append("• **Why it matters:** Powers decentralized applications")
                    recommendations.append("• **Learning opportunity:** Understand DeFi and Web3")
                    recommendations.append("• **Risk level:** Higher volatility, more complex")
                
                if sol_price:
                    sol_trend = "📈" if sol_price.change_24h_percent > 0 else "📉"
                    recommendations.append(f"\n**Solana (SOL):** ${sol_price.price_usd:,.0f} {sol_trend} {sol_price.change_24h_percent:+.2f}%")
                    recommendations.append("• **What it is:** Fast blockchain for DeFi and NFTs")
                    recommendations.append("• **Why it matters:** Low fees, high speed")
                    recommendations.append("• **Learning opportunity:** Explore NFT and DeFi ecosystems")
                    recommendations.append("• **Risk level:** Higher volatility, newer technology")
                
                # Personalized learning recommendations based on their situation
                recommendations.append(f"\n**🎯 Personalized Learning Path:**")
                
                if balance > 0 and not holdings:
                    recommendations.append("• **You're ready to start!** Begin with small amounts")
                    recommendations.append("• **Learning focus:** Understand each crypto's purpose")
                    recommendations.append("• **Start with:** $100-500 in one coin to learn")
                elif holdings:
                    recommendations.append("• **You're already investing!** Focus on understanding your holdings")
                    recommendations.append("• **Learning focus:** Portfolio optimization and risk management")
                    recommendations.append("• **Next step:** Analyze your current positions")
                else:
                    recommendations.append("• **Start with education** before investing")
                    recommendations.append("• **Learning focus:** Crypto fundamentals and market dynamics")
                    recommendations.append("• **Next step:** Top up your wallet when ready")
                
                # Educational approach to recommendations
                recommendations.append(f"\n**📚 Educational Approach:**")
                recommendations.append("• **Don't just buy** - understand what you're investing in")
                recommendations.append("• **Start small** - learn with amounts you can afford to lose")
                recommendations.append("• **Diversify gradually** - don't put everything in one coin")
                recommendations.append("• **Learn continuously** - crypto markets evolve rapidly")
                
                recommendations.append(f"\n**💡 Ready to learn more?** Ask me to analyze your portfolio or explain specific concepts!")
                
                return ChatResponse(reply="\n".join(recommendations))
                
            except Exception as e:
                logger.error(f"Error getting market analysis: {e}")
                return ChatResponse(reply="**🎓 Crypto Education:**\n\n**Top Learning Opportunities:**\n• **Bitcoin (BTC)** - Digital gold, store of value\n• **Ethereum (ETH)** - Smart contracts, DeFi leader\n• **Solana (SOL)** - Fast, cheap transactions\n\n**💡 Learning tip:** Start by understanding what each crypto does, not just their prices!")
        
        # Portfolio analysis requests - Now with comprehensive coaching
        if any(keyword in user_message.lower() for keyword in ['analyze my portfolio', 'portfolio analysis', 'analyze portfolio', 'portfolio review', 'my portfolio', 'portfolio performance', 'coach me', 'help me learn', 'trading coach', 'mentor me']):
            try:
                # Get comprehensive coaching analysis
                coaching_analysis = await analyze_portfolio_for_coaching(user.id, db)
                
                # Format the coaching analysis
                reply = format_coaching_analysis(coaching_analysis)
                
                logger.info(f"Portfolio coaching analysis completed for user {user.id}")
                return ChatResponse(reply=reply)
                
            except Exception as e:
                logger.error(f"Error analyzing portfolio for coaching: {e}")
                return ChatResponse(reply="❌ **Unable to analyze your portfolio right now.** Please try again later.")
        
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
        
        # Build comprehensive coaching context for intelligent responses
        context_parts = []
        
        # User portfolio context for coaching
        balance = portfolio_data.get("balance", 0)
        holdings = portfolio_data.get("holdings", {})
        recent_trades = portfolio_data.get("recent_trades", [])
        
        # Determine user's coaching level
        total_trades = len(recent_trades)
        if total_trades < 3:
            coaching_level = "beginner"
        elif total_trades < 10:
            coaching_level = "intermediate"
        else:
            coaching_level = "advanced"
        
        context_parts.append(f"COACHING LEVEL: {coaching_level}")
        
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
                
                # Add coaching insights about their portfolio
                if len(holdings) == 1:
                    context_parts.append("PORTFOLIO INSIGHT: User is concentrated in one asset - teach about diversification")
                elif len(holdings) <= 3:
                    context_parts.append("PORTFOLIO INSIGHT: User has moderate diversification - suggest optimization")
                else:
                    context_parts.append("PORTFOLIO INSIGHT: User has good diversification - focus on advanced strategies")
            else:
                context_parts.append("No current holdings - ready to start trading")
                context_parts.append("COACHING FOCUS: Teach basics and help with first investment")
        else:
            context_parts.append("New user with no balance - needs to top up wallet")
            context_parts.append("COACHING FOCUS: Education first, trading later")
        
        # Recent trading activity for coaching insights
        if recent_trades:
            context_parts.append(f"Recent activity: {len(recent_trades)} trades")
            profitable_trades = sum(1 for trade in recent_trades if trade.get('profit_loss', 0) > 0)
            if len(recent_trades) > 0:
                win_rate = (profitable_trades / len(recent_trades)) * 100
                context_parts.append(f"Trading performance: {win_rate:.1f}% win rate")
                
                # Add coaching insights about trading performance
                if win_rate > 70:
                    context_parts.append("TRADING INSIGHT: User has good performance - focus on scaling and optimization")
                elif win_rate > 50:
                    context_parts.append("TRADING INSIGHT: User has decent performance - focus on consistency and risk management")
                else:
                    context_parts.append("TRADING INSIGHT: User needs to improve performance - focus on education and strategy")
        
        # Market context for educational opportunities
        try:
            btc_price = await price_service.get_price("BTC")
            eth_price = await price_service.get_price("ETH")
            if btc_price:
                context_parts.append(f"BTC: ${btc_price.price_usd:,.0f} ({btc_price.change_24h_percent:+.1f}%)")
            if eth_price:
                context_parts.append(f"ETH: ${eth_price.price_usd:,.0f} ({eth_price.change_24h_percent:+.1f}%)")
        except:
            pass
        
        # Add coaching mission
        context_parts.append("MISSION: Provide educational coaching, not just trading advice. Help user learn and improve their trading skills.")
        
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
