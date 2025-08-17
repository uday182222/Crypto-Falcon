from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("WARNING: DATABASE_URL environment variable is not set")
    DATABASE_URL = "postgresql://dummy:dummy@localhost/dummy"  # Fallback for testing

print(f"Database URL configured: {DATABASE_URL[:20]}...")  # Log partial URL for security

# Create engine with error handling
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    engine = None

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
