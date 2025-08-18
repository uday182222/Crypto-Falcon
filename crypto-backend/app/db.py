from sqlalchemy import create_engine, text
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
        print("Please set DATABASE_URL in your Render environment variables")
        print("Format: postgresql://username:password@host:port/database")
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
        # For PostgreSQL and other databases
        engine = create_engine(
            DATABASE_URL, 
            pool_pre_ping=True,
            pool_recycle=300,  # Recycle connections every 5 minutes
            pool_timeout=20,   # Wait up to 20 seconds for a connection
            max_overflow=10,   # Allow up to 10 connections beyond pool_size
            echo=False,        # Set to True for SQL debugging
            pool_size=5        # Base pool size
        )
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    if ENVIRONMENT == "production":
        print("CRITICAL: Cannot create database engine in production!")
        print("Please check your DATABASE_URL format and database accessibility")
        raise
    else:
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
            # Use text() for SQLAlchemy 2.x compatibility
            result = conn.execute(text("SELECT 1"))
            # Fetch the result to ensure the query actually executed
            result.fetchone()
            return True, "Database connection successful"
    except Exception as e:
        error_msg = str(e)
        if "connection" in error_msg.lower():
            return False, f"Database connection failed: {error_msg}"
        elif "authentication" in error_msg.lower():
            return False, f"Database authentication failed: {error_msg}"
        elif "timeout" in error_msg.lower():
            return False, f"Database connection timeout: {error_msg}"
        else:
            return False, f"Database error: {error_msg}"

def get_db():
    """Database dependency for FastAPI routes"""
    if not SessionLocal:
        raise Exception("Database connection not available")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_database_info():
    """Get database connection information for debugging"""
    try:
        if not engine:
            return {"status": "no_engine", "message": "Database engine not available"}
        
        with engine.connect() as conn:
            if DATABASE_URL.startswith("sqlite"):
                return {
                    "status": "connected",
                    "type": "sqlite",
                    "database": "local",
                    "message": "SQLite database connected"
                }
            else:
                # Try to get PostgreSQL version
                try:
                    result = conn.execute(text("SELECT version()"))
                    version = result.fetchone()
                    return {
                        "status": "connected",
                        "type": "postgresql",
                        "version": version[0] if version else "unknown",
                        "message": "PostgreSQL database connected"
                    }
                except:
                    return {
                        "status": "connected",
                        "type": "unknown",
                        "message": "Database connected but version query failed"
                    }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to get database information"
        }
