from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import logging

# Detect production environment - check for Render-specific environment variables
IS_RENDER = os.getenv("RENDER") is not None
ENVIRONMENT = os.getenv("ENVIRONMENT", "production" if IS_RENDER else "development")
print(f"DB.PY - Environment detected: {ENVIRONMENT}")
print(f"DB.PY - Running on Render: {IS_RENDER}")

if ENVIRONMENT != "production" and not IS_RENDER:
    print("DB.PY - Loading local environment files")
    load_dotenv("env.local", override=True)  # Load local environment file only in development
    load_dotenv(".env")  # Load .env file only in development
else:
    print("DB.PY - Production mode, skipping local env files")
    print("DB.PY - Production mode, skipping .env file")

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

print(f"Environment: {ENVIRONMENT}")
print(f"DATABASE_URL from env: {'SET' if DATABASE_URL else 'NOT SET'}")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL environment variable is not set")
    if ENVIRONMENT == "production":
        print("ERROR: DATABASE_URL must be set in production!")
        raise ValueError("DATABASE_URL environment variable is required in production")
    else:
        print("Using in-memory SQLite for local development")
        DATABASE_URL = "sqlite:///./motionfalcon_local.db"  # Local SQLite fallback

print(f"Database URL configured: {DATABASE_URL[:20]}...")  # Log partial URL for security

# Create engine with error handling
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    print("Falling back to in-memory SQLite")
    DATABASE_URL = "sqlite:///./motionfalcon_local.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
Base = declarative_base()

# Dependency to get database session
def get_database():
    if not SessionLocal:
        raise Exception("Database connection not available")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_database_connection():
    """Test if database connection is working"""
    try:
        if not engine:
            return False, "No database engine"
        
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            return True, "Database connection successful"
    except Exception as e:
        return False, f"Database connection failed: {e}"
