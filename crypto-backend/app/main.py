import warnings
import os
import subprocess
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routes import auth, trade, leaderboard, achievement, purchase, currency, wallet, invoice, chatbot

# Suppress deprecation warnings for production
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pkg_resources")

app = FastAPI()

# CORS middleware configuration (allow all origins, no credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a simple CORS test endpoint
@app.options("/cors-test")
async def cors_test_options():
    """Handle preflight CORS request"""
    return {"message": "CORS preflight OK"}

@app.options("/auth/login")
async def login_options():
    """Handle preflight CORS request for login"""
    return {"message": "Login CORS preflight OK"}

@app.options("/auth/register")
async def register_options():
    """Handle preflight CORS request for register"""
    return {"message": "Register CORS preflight OK"}

@app.options("/trade/buy")
async def trade_buy_options():
    """Handle preflight CORS request for trade buy"""
    return {"message": "Trade buy CORS preflight OK"}

@app.options("/trade/sell")
async def trade_sell_options():
    """Handle preflight CORS request for trade sell"""
    return {"message": "Trade sell CORS preflight OK"}

@app.options("/wallet/{path:path}")
async def wallet_options():
    """Handle preflight CORS request for wallet endpoints"""
    return {"message": "Wallet CORS preflight OK"}

@app.options("/achievements/{path:path}")
async def achievements_options():
    """Handle preflight CORS request for achievements"""
    return {"message": "Achievements CORS preflight OK"}

@app.options("/api/chatbot")
async def chatbot_options():
    """Handle preflight CORS request for chatbot"""
    return {"message": "Chatbot CORS preflight OK"}

# Include routers
app.include_router(auth.router)
app.include_router(trade.router)
app.include_router(leaderboard.router)
app.include_router(achievement.router)
app.include_router(purchase.router)
app.include_router(currency.router)
app.include_router(wallet.router)
app.include_router(invoice.router)
app.include_router(chatbot.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to BitcoinPro.in Crypto Trading API", "status": "running", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/ping")
def ping():
    """Simple ping endpoint to test if backend is responding"""
    return {"pong": True, "message": "Backend is responding", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working"}

@app.post("/test-register")
def test_register_endpoint():
    """Test endpoint to verify registration is working"""
    return {
        "message": "Test registration endpoint working",
        "timestamp": "2024-01-01T00:00:00Z",
        "status": "success"
    }

@app.post("/test-register-simple")
def test_register_simple():
    """Simple test endpoint that doesn't require database access"""
    return {
        "access_token": "test-token-123",
        "token_type": "bearer",
        "user": {
            "id": 999,
            "username": "testuser",
            "email": "test@example.com",
            "demo_balance": 100000.0,
            "level": 1,
            "xp": 0,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "xp_first_gain_awarded": False,
            "xp_lost_all_awarded": False,
            "xp_best_rank": 0
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.get("/cors-test")
def cors_test():
    """Test endpoint to verify CORS is working"""
    return {
        "message": "CORS test endpoint",
        "cors_working": True,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/cors-debug")
def cors_debug():
    """Debug endpoint to check CORS configuration"""
    return {
        "cors_middleware_added": True,
        "allow_origins": ["*"],
        "allow_credentials": False,
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Simple working auth endpoint for testing - accepts any credentials
@app.post("/simple-login")
def simple_login(email: str, password: str):
    # Accept any credentials for testing purposes
    username = email.split('@')[0] if '@' in email else email
    
    return {
        "access_token": "test-token-123",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "username": username,
            "email": email,
            "demo_balance": 1000.0
        }
    }

# Working authentication endpoint that accepts any credentials for testing
@app.post("/auth/test-login")
def test_login(email: str, password: str):
    # Accept any credentials for testing purposes
    # Create a simple token (not JWT, just a string)
    access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcl9pZCI6MSwiZXhwIjoxNzM1NzQ0MDAwfQ.test-signature"
    
    # Extract username from email
    username = email.split('@')[0] if '@' in email else email
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": 1,
            "username": username,
            "email": email,
            "demo_balance": 1000.0,
            "level": 1,
            "xp": 0
        }
    }

# Simple registration endpoint for testing
@app.post("/auth/test-register")
def test_register(username: str, email: str, password: str):
    # Simple registration that always succeeds for testing
    return {
        "id": 2,
        "username": username,
        "email": email,
        "demo_balance": 1000.0,
        "level": 1,
        "xp": 0,
        "message": "User registered successfully"
    }

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/health/db")
def health_db():
    """Check database connection health"""
    from app.db import test_database_connection, get_database_info
    
    try:
        is_healthy, message = test_database_connection()
        db_info = get_database_info()
        
        return {
            "database": "healthy" if is_healthy else "unhealthy",
            "message": message,
            "details": db_info,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "database": "error",
            "message": str(e),
            "details": {"status": "exception", "error": str(e)},
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/health/db/detailed")
def health_db_detailed():
    """Get detailed database health information"""
    from app.db import get_database_info, test_database_connection
    import os
    
    try:
        # Test connection
        is_healthy, message = test_database_connection()
        
        # Get database info
        db_info = get_database_info()
        
        # Environment info
        env_info = {
            "environment": os.getenv("ENVIRONMENT", "NOT SET"),
            "is_render": bool(os.getenv("RENDER")),
            "database_url_set": bool(os.getenv("DATABASE_URL")),
            "database_url_preview": os.getenv("DATABASE_URL", "NOT SET")[:50] + "..." if os.getenv("DATABASE_URL") else "NOT SET"
        }
        
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "connection_test": {
                "success": is_healthy,
                "message": message
            },
            "database_info": db_info,
            "environment": env_info,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/debug/schema")
def debug_schema():
    """Debug endpoint to check current database schema"""
    try:
        from app.db import SessionLocal
        from sqlalchemy import inspect
        
        db = SessionLocal()
        inspector = inspect(db.bind)
        
        # Get table info
        tables = inspector.get_table_names()
        table_info = {}
        
        for table in tables:
            columns = inspector.get_columns(table)
            table_info[table] = [col['name'] for col in columns]
        
        db.close()
        
        return {
            "tables": table_info,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/debug/fix-schema")
def fix_schema():
    """Manual endpoint to fix the database schema by adding missing columns"""
    try:
        from app.db import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Add all missing columns that the User model expects
        missing_columns = [
            ("preferred_currency", "VARCHAR(3) DEFAULT 'USD' NOT NULL"),
            ("is_active", "BOOLEAN DEFAULT TRUE"),
        ]
        
        for column_name, column_def in missing_columns:
            try:
                db.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column_name} {column_def}"))
                print(f"Added {column_name} column successfully")
            except Exception as e:
                print(f"Error adding {column_name} column: {e}")
                db.rollback()
        
        db.commit()
        db.close()
        
        return {
            "message": "Schema fix attempted for all missing columns",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/debug/sync-balances")
def sync_all_balances():
    """Sync all user balances between users.demo_balance and wallets.balance"""
    try:
        from app.db import SessionLocal
        from app.models.user import User
        from app.models.wallet import Wallet
        
        db = SessionLocal()
        
        # Get all users
        users = db.query(User).all()
        synced_count = 0
        
        for user in users:
            # Get or create wallet
            wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
            
            if not wallet:
                # Create wallet with user's demo_balance
                wallet = Wallet(user_id=user.id, balance=user.demo_balance)
                db.add(wallet)
                synced_count += 1
                print(f"Created wallet for user {user.id} with balance {user.demo_balance}")
            elif wallet.balance != user.demo_balance:
                # Sync balances - use the higher value
                correct_balance = max(wallet.balance, user.demo_balance)
                wallet.balance = correct_balance
                user.demo_balance = correct_balance
                synced_count += 1
                print(f"Synced user {user.id} balance to {correct_balance}")
        
        db.commit()
        db.close()
        
        return {
            "message": f"Balance sync completed for {synced_count} users",
            "users_processed": len(users),
            "users_synced": synced_count,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/debug/enum-values")
def get_enum_values():
    """Get all enum values from database"""
    try:
        from app.db import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Get achievement type enum values
        result = db.execute(text("""
            SELECT unnest(enum_range(NULL::achievementtype)) as enum_value;
        """))
        
        enum_values = [row[0] for row in result.fetchall()]
        
        db.close()
        
        return {
            "achievement_types": enum_values,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/debug/force-balance-update")
def force_balance_update():
    """Force update all user balances to ensure consistency"""
    try:
        from app.db import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Update all users to have 100,000 demo_balance
        db.execute(text("""
            UPDATE users SET demo_balance = 100000.0 WHERE demo_balance != 100000.0
        """))
        
        # Update all wallets to have 100,000 balance
        db.execute(text("""
            UPDATE wallets SET balance = 100000.0 WHERE balance != 100000.0
        """))
        
        db.commit()
        db.close()
        
        return {
            "message": "All user balances forced to 100,000 DemoCoins",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/debug/fix-achievements")
def fix_achievement_enums():
    """Fix achievement enum values in database to match code"""
    try:
        from app.db import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Drop and recreate the achievements table with correct enum type
        db.execute(text("DROP TABLE IF EXISTS user_achievements CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS achievements CASCADE"))
        
        # Create achievements table with correct enum type
        db.execute(text("""
            CREATE TABLE achievements (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
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
            CREATE TABLE user_achievements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                achievement_id INTEGER NOT NULL,
                current_progress NUMERIC(20, 8) NOT NULL DEFAULT 0,
                is_completed BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                completed_at TIMESTAMP WITH TIME ZONE
            )
        """))
        
        # Insert achievements with correct enum values
        db.execute(text("""
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
        
        db.commit()
        db.close()
        
        return {
            "message": "Achievement tables recreated with correct enum values",
            "achievements_recreated": 11,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/debug/portfolio/{user_id}")
def debug_user_portfolio(user_id: int):
    """Debug endpoint to check a user's portfolio calculation"""
    try:
        from app.db import SessionLocal
        from app.models.trade import Trade
        from app.models.wallet import Wallet
        from app.models.user import User
        from sqlalchemy import text
        
        db = SessionLocal()
        
        # Get user info
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Get wallet info
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        
        # Get all trades
        trades = db.query(Trade).filter(Trade.user_id == user_id).all()
        
        # Calculate holdings manually
        holdings = {}
        for trade in trades:
            symbol = trade.coin_symbol
            if symbol not in holdings:
                holdings[symbol] = {"quantity": 0, "total_cost": 0}
            
            if trade.trade_type.value == "buy":
                holdings[symbol]["quantity"] += trade.quantity
                holdings[symbol]["total_cost"] += trade.quantity * trade.price_at_trade
            else:  # sell
                if holdings[symbol]["quantity"] > 0:
                    cost_reduction = (trade.quantity / holdings[symbol]["quantity"]) * holdings[symbol]["total_cost"]
                    holdings[symbol]["total_cost"] -= cost_reduction
                holdings[symbol]["quantity"] -= trade.quantity
        
        # Filter positive holdings
        positive_holdings = {k: v for k, v in holdings.items() if v["quantity"] > 0}
        
        db.close()
        
        return {
            "user_id": user_id,
            "username": user.username,
            "wallet_balance": float(wallet.balance) if wallet else 0,
            "user_demo_balance": float(user.demo_balance) if user else 0,
            "total_trades": len(trades),
            "buy_trades": len([t for t in trades if t.trade_type.value == "buy"]),
            "sell_trades": len([t for t in trades if t.trade_type.value == "sell"]),
            "holdings": positive_holdings,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }
