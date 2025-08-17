import warnings
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routes import auth, trade, leaderboard, achievement, purchase, currency, wallet

# Suppress deprecation warnings for production
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pkg_resources")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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
    return {"message": "Welcome to MotionFalcon Crypto Trading API"}

@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working"}

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
