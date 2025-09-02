from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import logging
import httpx
import os
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
        trades = db.query(Trade).filter(Trade.user_id == user_id).order_by(Trade.created_at.desc()).limit(10).all()
        
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
        
        # Filter positive holdings
        positive_holdings = {k: v for k, v in holdings.items() if v["quantity"] > 0}
        
        # Format recent trades
        recent_trades = []
        for trade in trades[:5]:  # Last 5 trades
            recent_trades.append({
                "type": trade.trade_type.value,
                "coin": trade.coin_symbol,
                "quantity": float(trade.quantity),
                "price": float(trade.price_at_trade),
                "date": trade.created_at.isoformat() if trade.created_at else "Unknown"
            })
        
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

async def call_openai_api(user_message: str, context: str):
    """Call OpenAI API with user message and context"""
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            logger.warning("OpenAI API key not found, using fallback response")
            return "I'm here to help with your crypto trading questions! However, I'm currently unable to access advanced AI features. Please ask me about trading strategies, portfolio management, or platform navigation."
        
        system_prompt = """You are a knowledgeable crypto trading assistant for BitcoinPro.in. 
        Explain concepts clearly in simple language. Be helpful, accurate, and encouraging. 
        Always remind users to do their own research and never invest more than they can afford to lose.
        Use the provided context about their portfolio and market data to give personalized advice."""
        
        user_prompt = f"""Context: {context}
        
        User Question: {user_message}
        
        Please provide a helpful response based on the user's portfolio and current market conditions."""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                },
                timeout=30.0
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
    Enhanced chatbot endpoint with OpenAI integration and personalized responses
    """
    try:
        user_message = message_data.message.strip()
        
        # Fetch user's portfolio and trade data
        portfolio_data = await fetch_user_portfolio_data(user.id, db)
        
        # Fetch current market data
        market_data = await fetch_market_data()
        
        # Construct context string
        context_parts = []
        
        # Portfolio context
        if portfolio_data["balance"] > 0:
            context_parts.append(f"User Portfolio: Balance ${portfolio_data['balance']:,.2f}")
            
            if portfolio_data["holdings"]:
                holdings_str = ", ".join([f"{coin}: {data['quantity']:.4f}" for coin, data in portfolio_data["holdings"].items()])
                context_parts.append(f"Current Holdings: {holdings_str}")
            else:
                context_parts.append("Current Holdings: None")
            
            if portfolio_data["recent_trades"]:
                recent_trades_str = "; ".join([f"{trade['type']} {trade['quantity']:.4f} {trade['coin']} @ ${trade['price']:.2f}" for trade in portfolio_data["recent_trades"]])
                context_parts.append(f"Recent Trades: {recent_trades_str}")
            else:
                context_parts.append("Recent Trades: None")
        else:
            context_parts.append("User Portfolio: New user with no trading history")
        
        # Market data context
        if market_data:
            market_str = ", ".join([f"{coin}: ${data['price']:,.2f} ({data['change_24h']:+.2f}%)" for coin, data in market_data.items()])
            context_parts.append(f"Market Data: {market_str}")
        else:
            context_parts.append("Market Data: Unable to fetch current prices")
        
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
