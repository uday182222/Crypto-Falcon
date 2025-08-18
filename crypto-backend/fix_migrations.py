#!/usr/bin/env python3
"""
Migration conflict resolution script for Render deployment
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
    """Main migration fix logic"""
    print("=== Starting Migration Conflict Resolution ===")
    
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
    
    # Step 1: Try to get current migration state
    print("\n=== Step 1: Checking Current Migration State ===")
    run_command("alembic current", "Check current migration")
    run_command("alembic heads", "Check migration heads")
    
    # Step 2: Try to stamp current head
    print("\n=== Step 2: Attempting to Stamp Current Head ===")
    if run_command("alembic stamp head", "Stamp current head"):
        print("Successfully stamped current head")
    else:
        print("Failed to stamp current head, trying alternative approaches...")
        
        # Step 3: Try to merge heads
        print("\n=== Step 3: Attempting to Merge Heads ===")
        if run_command("alembic merge heads -m 'merge_all_heads'", "Merge multiple heads"):
            print("Successfully merged heads")
        else:
            print("Failed to merge heads, trying reset...")
            
            # Step 4: Reset to base
            print("\n=== Step 4: Resetting Migration State ===")
            if run_command("alembic stamp base", "Reset to base"):
                print("Successfully reset to base")
            else:
                print("Failed to reset to base")
                sys.exit(1)
    
    # Step 5: Run migrations
    print("\n=== Step 5: Running Database Migrations ===")
    if run_command("alembic upgrade head", "Run migrations"):
        print("=== Migrations Completed Successfully ===")
        
        # Step 6: Start the application
        print("=== Starting Application ===")
        port = os.getenv('PORT', '8000')
        cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
        print(f"Starting: {cmd}")
        
        # Use exec to replace the current process
        os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])
    else:
        print("=== Migration Failed ===")
        print("Current migration state:")
        run_command("alembic current", "Check current migration")
        print("Available migrations:")
        run_command("alembic history", "Show migration history")
        sys.exit(1)

if __name__ == "__main__":
    main()
