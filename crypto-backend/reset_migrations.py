#!/usr/bin/env python3
"""
Complete migration reset script for production deployment
Use this as a last resort when fix_migrations.py fails
"""
import os
import subprocess
import sys

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"=== {description} ===")
    print(f"Running: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"Exit code: {result.returncode}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Exception running command: {e}")
        return False

def main():
    """Main migration reset logic"""
    print("=== Starting Complete Migration Reset ===")
    
    # Check environment
    env = os.getenv('ENVIRONMENT', 'unknown')
    render = os.getenv('RENDER', 'false')
    print(f"Environment: {env}")
    print(f"Running on Render: {render}")
    
    # Check if DATABASE_URL is set
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)
    
    print(f"Database URL: {database_url[:30]}...")
    
    # Step 1: Check current migration state
    print("\n=== Step 1: Checking Current Migration State ===")
    run_command("alembic current", "Check current migration")
    run_command("alembic heads", "Check migration heads")
    
    # Step 2: Reset migration state completely
    print("\n=== Step 2: Resetting Migration State ===")
    
    # First, try to stamp to base
    if run_command("alembic stamp base", "Reset to base"):
        print("Successfully reset to base")
    else:
        print("Failed to reset to base, trying to drop and recreate alembic_version table...")
        
        # This is a more aggressive approach - we'll need to handle this manually
        print("WARNING: Manual intervention may be required")
        print("Consider running: DROP TABLE IF EXISTS alembic_version;")
        sys.exit(1)
    
    # Step 3: Run migrations from base
    print("\n=== Step 3: Running Migrations from Base ===")
    if run_command("alembic upgrade head", "Run migrations from base"):
        print("=== Migrations Completed Successfully ===")
    else:
        print("=== Migration Failed ===")
        print("Current migration state:")
        run_command("alembic current", "Check current migration")
        print("Available migrations:")
        run_command("alembic history", "Show migration history")
        sys.exit(1)
    
    # Step 4: Start the application
    print("=== Starting Application ===")
    port = os.getenv('PORT', '8000')
    cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
    print(f"Starting: {cmd}")
    
    # Use exec to replace the current process
    os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()
