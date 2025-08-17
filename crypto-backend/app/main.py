import warnings
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routes import auth, trade, leaderboard, achievement, purchase, currency, wallet

# Suppress deprecation warnings for production
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pkg_resources")

app = FastAPI()

# Configure CORS
allowed = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(trade.router)
app.include_router(leaderboard.router)
app.include_router(achievement.router)
app.include_router(purchase.router)
app.include_router(currency.router)
app.include_router(wallet.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MotionFalcon Crypto Trading API", "status": "running", "timestamp": "2024-01-01T00:00:00Z"}

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
    from app.db import test_database_connection
    
    try:
        is_healthy, message = test_database_connection()
        return {
            "database": "healthy" if is_healthy else "unhealthy",
            "message": message,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "database": "error",
            "message": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }
