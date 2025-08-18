#!/usr/bin/env python3
"""
Nuclear reset script for production deployment
This script will completely reset the database and recreate it from scratch
USE WITH EXTREME CAUTION - THIS WILL DELETE ALL DATA
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

def drop_all_tables():
    """Drop all tables in the database"""
    print("=== NUCLEAR RESET: Dropping all tables ===")
    
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
                    
                    # Drop all tables (this is destructive!)
                    drop_cmd = f"psql -h {host} -p {port} -U {user} -d {database} -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'"
                    print(f"Running: {drop_cmd}")
                    
                    result = subprocess.run(drop_cmd, shell=True, env=env, capture_output=True, text=True)
                    if result.returncode == 0:
                        print("Successfully dropped all tables and recreated schema")
                        return True
                    else:
                        print(f"Failed to drop tables: {result.stderr}")
                        return False
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        return False
    
    return False

def main():
    """Main nuclear reset logic"""
    print("=== NUCLEAR RESET: Complete Database Reset ===")
    print("WARNING: This will delete ALL data in the database!")
    
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
    
    # Step 1: Drop all tables
    print("\n=== Step 1: Dropping All Tables ===")
    if not drop_all_tables():
        print("Failed to drop tables")
        sys.exit(1)
    
    # Step 2: Reset alembic state
    print("\n=== Step 2: Resetting Alembic State ===")
    if run_command("alembic stamp base", "Reset to base"):
        print("Successfully reset to base")
    else:
        print("Failed to reset to base")
        sys.exit(1)
    
    # Step 3: Run migrations from scratch
    print("\n=== Step 3: Running Migrations from Scratch ===")
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
