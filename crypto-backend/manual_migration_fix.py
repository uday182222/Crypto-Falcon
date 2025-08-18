#!/usr/bin/env python3
"""
Manual migration fix script for production deployment
Run this script manually to resolve migration conflicts step by step
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
    """Manual migration fix logic"""
    print("=== Manual Migration Fix Script ===")
    print("This script will help you resolve migration conflicts step by step")
    print("Make sure you have access to the database and understand the implications")
    
    # Check environment
    env = os.getenv('ENVIRONMENT', 'unknown')
    render = os.getenv('RENDER', 'false')
    print(f"\nEnvironment: {env}")
    print(f"Running on Render: {render}")
    
    # Check if DATABASE_URL is set
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)
    
    print(f"Database URL: {database_url[:30]}...")
    
    # Step 1: Show current state
    print("\n=== Step 1: Current Migration State ===")
    run_command("alembic current", "Current migration")
    run_command("alembic heads", "Migration heads")
    run_command("alembic history", "Migration history")
    
    # Step 2: Ask user what to do
    print("\n=== Step 2: Choose Action ===")
    print("1. Try to merge heads automatically")
    print("2. Reset to base and recreate schema")
    print("3. Stamp to a specific revision")
    print("4. Show detailed migration info")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == "1":
        print("\n=== Attempting to Merge Heads ===")
        if run_command("alembic merge heads -m 'manual_merge_all_heads'", "Merge heads"):
            print("Successfully merged heads")
            if run_command("alembic upgrade head", "Upgrade to head"):
                print("Successfully upgraded to head")
            else:
                print("Failed to upgrade to head")
        else:
            print("Failed to merge heads")
    
    elif choice == "2":
        print("\n=== Resetting to Base ===")
        confirm = input("This will reset ALL migration state. Are you sure? (yes/no): ").strip().lower()
        if confirm == "yes":
            if run_command("alembic stamp base", "Reset to base"):
                print("Successfully reset to base")
                if run_command("alembic upgrade head", "Upgrade to head"):
                    print("Successfully upgraded to head")
                else:
                    print("Failed to upgrade to head")
            else:
                print("Failed to reset to base")
        else:
            print("Operation cancelled")
    
    elif choice == "3":
        print("\n=== Stamping to Specific Revision ===")
        revision = input("Enter revision ID to stamp to: ").strip()
        if revision:
            if run_command(f"alembic stamp {revision}", f"Stamp to {revision}"):
                print(f"Successfully stamped to {revision}")
            else:
                print(f"Failed to stamp to {revision}")
    
    elif choice == "4":
        print("\n=== Detailed Migration Information ===")
        run_command("alembic show reset_and_create_all_tables", "Show reset migration")
        run_command("alembic show 23f382e180c8", "Show merge migration")
    
    elif choice == "5":
        print("Exiting...")
        sys.exit(0)
    
    else:
        print("Invalid choice")
        sys.exit(1)
    
    # Final status check
    print("\n=== Final Migration Status ===")
    run_command("alembic current", "Current migration")
    run_command("alembic heads", "Migration heads")

if __name__ == "__main__":
    main()
