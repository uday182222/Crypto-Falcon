#!/usr/bin/env python3
"""
Startup script for Render deployment
This script handles migrations before starting the FastAPI app
"""
import os
import subprocess
import sys
import time

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

def force_reset_migrations():
    """Force reset migrations by dropping alembic_version table"""
    print("=== FORCE RESET: Attempting to reset migration state ===")
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        return False
    
    try:
        # Parse DATABASE_URL
        if database_url.startswith('postgresql://'):
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
                    env = os.environ.copy()
                    env['PGPASSWORD'] = password
                    
                    # Drop alembic_version table
                    drop_cmd = f"psql -h {host} -p {port} -U {user} -d {database} -c 'DROP TABLE IF EXISTS alembic_version;'"
                    print(f"Running: {drop_cmd}")
                    
                    result = subprocess.run(drop_cmd, shell=True, env=env, capture_output=True, text=True)
                    if result.returncode == 0:
                        print("Successfully dropped alembic_version table")
                        return True
                    else:
                        print(f"Failed to drop table: {result.stderr}")
                        return False
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        return False
    
    return False

def check_missing_migrations():
    """Check if there are missing migration references"""
    print("=== Checking for Missing Migration References ===")
    
    # Try to get current migration state
    result = subprocess.run("alembic current", shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("Failed to get current migration state")
        return True  # Assume there are issues
    
    current = result.stdout.strip()
    print(f"Current migration: {current}")
    
    # Check if current migration exists in our versions folder
    if current and current != "None":
        # Check if the migration file exists
        migration_file = f"alembic/versions/{current}.py"
        if not os.path.exists(migration_file):
            print(f"WARNING: Migration file {migration_file} does not exist!")
            return True  # Missing migration detected
    
    return False

def main():
    """Main startup logic"""
    print("=== MotionFalcon Backend Startup ===")
    
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
    
    # Step 1: Check for missing migration references
    print("\n=== Step 1: Checking for Missing Migration References ===")
    if check_missing_migrations():
        print("Missing migration references detected - forcing reset")
        if force_reset_migrations():
            print("Successfully reset migration state")
        else:
            print("Failed to reset migration state")
            sys.exit(1)
    
    # Step 2: Check current migration state
    print("\n=== Step 2: Checking Current Migration State ===")
    run_command("alembic current", "Check current migration")
    
    # Step 3: Try to upgrade to head
    print("\n=== Step 3: Attempting to Run Migrations ===")
    if run_command("alembic upgrade head", "Run migrations"):
        print("=== Migrations Completed Successfully ===")
    else:
        print("=== Migration Failed, Attempting Force Reset ===")
        
        # Step 4: Force reset migrations
        if force_reset_migrations():
            print("Successfully reset migration state")
            
            # Step 5: Try to upgrade again
            print("\n=== Step 5: Running Migrations After Reset ===")
            if run_command("alembic upgrade head", "Run migrations after reset"):
                print("=== Migrations Completed Successfully After Reset ===")
            else:
                print("=== Migrations Still Failed After Reset ===")
                print("Current migration state:")
                run_command("alembic current", "Check current migration")
                sys.exit(1)
        else:
            print("Failed to reset migration state")
            sys.exit(1)
    
    # Step 6: Start the FastAPI application
    print("\n=== Starting FastAPI Application ===")
    port = os.getenv('PORT', '8000')
    cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
    print(f"Starting: {cmd}")
    
    # Use exec to replace the current process
    os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()
