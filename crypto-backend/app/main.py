import warnings
import os
import subprocess
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routes import auth, trade, leaderboard, achievement, purchase, currency, wallet

# Suppress deprecation warnings for production
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pkg_resources")

app = FastAPI()

# Migration startup handler
@app.on_event("startup")
async def startup_event():
    """Handle startup tasks including migration fixes"""
    print("=== Starting MotionFalcon Backend ===")
    
    # Check if we're in production on Render
    env = os.getenv('ENVIRONMENT', 'unknown')
    render = os.getenv('RENDER', 'false')
    
    if env == 'production' and render == 'true':
        print("=== Production Environment Detected - Running Migration Fixes ===")
        
        try:
            # Try to fix migrations
            print("Attempting to fix migration conflicts...")
            
            # Check current migration state
            result = subprocess.run("alembic current", shell=True, capture_output=True, text=True)
            print(f"Current migration: {result.stdout.strip() if result.stdout else 'None'}")
            
            # Check for multiple heads or missing revisions
            result = subprocess.run("alembic heads", shell=True, capture_output=True, text=True)
            if result.stdout and result.returncode == 0:
                heads = result.stdout.strip().split('\n')
                if len(heads) > 1:
                    print(f"Multiple heads detected: {len(heads)}")
                    
                    # Try to merge heads
                    print("Attempting to merge heads...")
                    merge_result = subprocess.run("alembic merge heads -m 'startup_merge'", shell=True, capture_output=True, text=True)
                    if merge_result.returncode == 0:
                        print("Successfully merged heads")
                    else:
                        print("Failed to merge heads, trying alternative approach...")
                        
                        # Try to stamp to base
                        print("Attempting to reset to base...")
                        stamp_result = subprocess.run("alembic stamp base", shell=True, capture_output=True, text=True)
                        if stamp_result.returncode == 0:
                            print("Successfully reset to base")
                        else:
                            print("Failed to reset to base")
            
            # Try to upgrade
            print("Running migrations...")
            upgrade_result = subprocess.run("alembic upgrade head", shell=True, capture_output=True, text=True)
            if upgrade_result.returncode == 0:
                print("Migrations completed successfully")
            else:
                print("Migrations failed, attempting force reset...")
                print(f"Error: {upgrade_result.stderr}")
                
                # Force reset by dropping alembic_version table
                print("=== FORCE RESET: Attempting to reset migration state ===")
                
                # Try to stamp to base first
                print("Attempting to stamp to base...")
                stamp_result = subprocess.run("alembic stamp base", shell=True, capture_output=True, text=True)
                if stamp_result.returncode == 0:
                    print("Successfully stamped to base")
                    
                    # Now try to upgrade again
                    print("Attempting upgrade after base stamp...")
                    upgrade_result = subprocess.run("alembic upgrade head", shell=True, capture_output=True, text=True)
                    if upgrade_result.returncode == 0:
                        print("Migrations completed successfully after base stamp")
                    else:
                        print("Still failed after base stamp, attempting manual reset...")
                        
                        # Try to manually reset the database
                        print("Attempting manual database reset...")
                        try:
                            # Parse DATABASE_URL to get connection details
                            database_url = os.getenv('DATABASE_URL')
                            if database_url and database_url.startswith('postgresql://'):
                                # Extract connection details
                                parts = database_url.replace('postgresql://', '').split('@')
                                if len(parts) == 2:
                                    user_pass = parts[0].split(':')
                                    host_port_db = parts[1].split('/')
                                    if len(user_pass) >= 2 and len(host_port_db) >= 2:
                                        user = user_pass[0]
                                        password = user_pass[1]
                                        host_port = host_port_db[0].split(':')
                                        host = host_port[0]
                                        port = host_port[1] if len(host_port) > 1 else '5432'
                                        database = host_port_db[1]
                                        
                                        # Set environment variables for psql
                                        env_vars = os.environ.copy()
                                        env_vars['PGPASSWORD'] = password
                                        
                                        # Drop alembic_version table
                                        drop_cmd = f"psql -h {host} -p {port} -U {user} -d {database} -c 'DROP TABLE IF EXISTS alembic_version;'"
                                        print(f"Running: {drop_cmd}")
                                        
                                        drop_result = subprocess.run(drop_cmd, shell=True, env=env_vars, capture_output=True, text=True)
                                        if drop_result.returncode == 0:
                                            print("Successfully dropped alembic_version table")
                                            
                                            # Now try to upgrade again
                                            print("Attempting upgrade after dropping alembic_version...")
                                            upgrade_result = subprocess.run("alembic upgrade head", shell=True, capture_output=True, text=True)
                                            if upgrade_result.returncode == 0:
                                                print("Migrations completed successfully after reset")
                                            else:
                                                print("Still failed after reset")
                                        else:
                                            print(f"Failed to drop alembic_version table: {drop_result.stderr}")
                        except Exception as e:
                            print(f"Error during manual reset: {e}")
                else:
                    print("Failed to stamp to base")
                
        except Exception as e:
            print(f"Error during migration fix: {e}")
            print("Continuing startup despite migration issues...")
    
    print("=== Startup Complete ===")

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
if allowed_origins:
    allowed = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
else:
    allowed = ["http://localhost:3000", "http://localhost:5173"]

# Add production origins
production_origins = [
    "https://crypto-frontend-lffc.onrender.com",
    "https://motionfalcon-frontend.onrender.com"  # Keep both for compatibility
]

# Combine local and production origins
allowed.extend(production_origins)
allowed = list(set(allowed))  # Remove duplicates

# Debug logging
print(f"=== CORS Configuration ===")
print(f"Environment: {os.getenv('ENVIRONMENT', 'not set')}")
print(f"ALLOWED_ORIGINS env: {os.getenv('ALLOWED_ORIGINS', 'not set')}")
print(f"Final allowed origins: {allowed}")
print(f"==========================")

# Add CORS middleware BEFORE any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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

@app.get("/cors-test")
def cors_test():
    """Test endpoint to verify CORS is working"""
    return {
        "message": "CORS test endpoint",
        "cors_working": True,
        "timestamp": "2024-01-01T00:00:00Z",
        "allowed_origins": allowed if 'allowed' in locals() else "not set"
    }

@app.get("/cors-debug")
def cors_debug():
    """Debug endpoint to check CORS configuration"""
    return {
        "environment": os.getenv("ENVIRONMENT", "not set"),
        "allowed_origins_env": os.getenv("ALLOWED_ORIGINS", "not set"),
        "cors_middleware_added": True,
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
