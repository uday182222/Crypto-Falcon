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

def force_reset_migrations():
    """Force reset migrations by dropping alembic_version table and recreating"""
    print("=== FORCE RESET: Dropping alembic_version table ===")
    
    # Try to connect to database and drop alembic_version table
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        return False
    
    # Use psql to drop the table
    try:
        # Extract connection details from DATABASE_URL
        if database_url.startswith('postgresql://'):
            # Parse the URL to get host, port, database, user, password
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
    
    # Step 1: Check current migration state
    print("\n=== Step 1: Checking Current Migration State ===")
    run_command("alembic current", "Check current migration")
    run_command("alembic heads", "Check migration heads")
    
    # Step 2: Try to resolve multiple heads by merging them
    print("\n=== Step 2: Resolving Multiple Heads ===")
    
    # First, try to get all heads
    result = subprocess.run("alembic heads", shell=True, capture_output=True, text=True)
    if result.returncode == 0 and result.stdout:
        heads = result.stdout.strip().split('\n')
        print(f"Found {len(heads)} heads: {heads}")
        
        if len(heads) > 1:
            print("Multiple heads detected, attempting to merge...")
            
            # Create a merge migration
            merge_cmd = "alembic merge heads -m 'force_merge_all_heads_for_production'"
            if run_command(merge_cmd, "Merge multiple heads"):
                print("Successfully created merge migration")
            else:
                print("Failed to create merge migration, trying alternative approach...")
                
                # Try to stamp the database to the latest revision
                latest_revision = heads[-1].split()[0]  # Get the revision ID
                print(f"Attempting to stamp to latest revision: {latest_revision}")
                
                stamp_cmd = f"alembic stamp {latest_revision}"
                if run_command(stamp_cmd, f"Stamp to revision {latest_revision}"):
                    print(f"Successfully stamped to {latest_revision}")
                else:
                    print("Failed to stamp to latest revision")
                    print("=== FORCE RESET REQUIRED ===")
                    
                    # Force reset by dropping alembic_version table
                    if force_reset_migrations():
                        print("Successfully reset migration state")
                    else:
                        print("Failed to reset migration state")
                        sys.exit(1)
        else:
            print("Single head detected, proceeding with upgrade")
    
    # Step 3: Try to upgrade to head
    print("\n=== Step 3: Running Database Migrations ===")
    if run_command("alembic upgrade head", "Run migrations"):
        print("=== Migrations Completed Successfully ===")
    else:
        print("=== Migration Failed, Trying Alternative Approaches ===")
        
        # Step 4: If upgrade still fails, try to stamp to base and then upgrade
        print("\n=== Step 4: Attempting Reset and Upgrade ===")
        
        # Stamp to base first
        if run_command("alembic stamp base", "Reset to base"):
            print("Successfully reset to base")
            
            # Now try to upgrade again
            if run_command("alembic upgrade head", "Upgrade from base"):
                print("=== Migrations Completed Successfully After Reset ===")
            else:
                print("=== All Migration Attempts Failed ===")
                print("Current migration state:")
                run_command("alembic current", "Check current migration")
                print("Available migrations:")
                run_command("alembic history", "Show migration history")
                sys.exit(1)
        else:
            print("Failed to reset to base")
            sys.exit(1)
    
    # Step 5: Start the application
    print("=== Starting Application ===")
    port = os.getenv('PORT', '8000')
    cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
    print(f"Starting: {cmd}")
    
    # Use exec to replace the current process
    os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()
