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

def run_alembic_command(cmd, description):
    """Run an Alembic command with explicit DATABASE_URL"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        return False
    
    # Explicitly pass DATABASE_URL to Alembic
    full_cmd = f"alembic -x db_url='{database_url}' {cmd}"
    return run_command(full_cmd, description)

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

def aggressive_database_reset():
    """Aggressively reset the entire database to eliminate all conflicts"""
    print("=== AGGRESSIVE RESET: Complete database reset to eliminate conflicts ===")
    
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
                    
                    # Drop entire public schema and recreate it (nuclear option)
                    reset_cmd = f"psql -h {host} -p {port} -U {user} -d {database} -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'"
                    print(f"Running: {reset_cmd}")
                    
                    result = subprocess.run(reset_cmd, shell=True, env=env, capture_output=True, text=True)
                    if result.returncode == 0:
                        print("Successfully reset entire database schema")
                        return True
                    else:
                        print(f"Failed to reset schema: {result.stderr}")
                        return False
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        return False
    
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
    
    # Since local development is no longer needed, always do aggressive reset on Render
    if env == 'production' and render == 'true':
        print("=== Production on Render - Performing Aggressive Database Reset ===")
        
        # Step 1: Aggressive database reset to eliminate all conflicts
        if aggressive_database_reset():
            print("Successfully reset database schema")
        else:
            print("Failed to reset database schema")
            sys.exit(1)
        
        # Step 2: Reset Alembic state to base
        print("\n=== Step 2: Resetting Alembic State to Base ===")
        if run_alembic_command("stamp base", "Reset to base"):
            print("Successfully reset to base")
        else:
            print("Failed to reset to base")
            sys.exit(1)
        
        # Step 3: Run migrations from scratch
        print("\n=== Step 3: Running Migrations from Scratch ===")
        if run_alembic_command("upgrade head", "Run migrations from base"):
            print("=== Migrations Completed Successfully ===")
        else:
            print("=== Migrations Failed ===")
            print("Current migration state:")
            run_alembic_command("current", "Check current migration")
            sys.exit(1)
    else:
        print("=== Non-production environment, skipping aggressive reset ===")
    
    # Step 4: Start the FastAPI application
    print("\n=== Starting FastAPI Application ===")
    port = os.getenv('PORT', '8000')
    cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
    print(f"Starting: {cmd}")
    
    # Use exec to replace the current process
    os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()
