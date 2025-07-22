#!/usr/bin/env python3
"""
Setup script for XP/Level System Testing
Installs required dependencies and configures testing environment
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def install_dependencies():
    """Install required Python packages for testing"""
    packages = [
        "requests",
        "psycopg2-binary"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def check_backend_connection():
    """Check if backend is accessible"""
    try:
        import requests
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is accessible")
            return True
        else:
            print("❌ Backend server returned unexpected status code")
            return False
    except Exception as e:
        print(f"❌ Backend server is not accessible: {e}")
        print("💡 Make sure to start the backend server first:")
        print("   cd crypto-backend")
        print("   source venv/bin/activate")
        print("   uvicorn app.main:app --reload")
        return False

def check_database_connection():
    """Check if database is accessible"""
    try:
        import psycopg2
        # You'll need to update these credentials
        conn = psycopg2.connect(
            host="localhost",
            database="crypto_db",
            user="udaytomar",
            password=""  # No password for local development
        )
        conn.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Please update the database credentials in test_xp_system.py")
        return False

def create_test_user():
    """Create a test user if it doesn't exist"""
    try:
        import requests
        import json
        
        # Try to register a test user
        response = requests.post("http://localhost:8000/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass"
        })
        
        if response.status_code == 200:
            print("✅ Test user created successfully")
        elif response.status_code == 400 and "already exists" in response.text.lower():
            print("✅ Test user already exists")
        else:
            print(f"⚠️  Test user creation returned status {response.status_code}")
            
        return True
    except Exception as e:
        print(f"❌ Test user creation failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up XP/Level System Testing Environment")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        return False
    
    # Check backend connection
    if not check_backend_connection():
        print("❌ Backend connection check failed")
        return False
    
    # Check database connection
    if not check_database_connection():
        print("❌ Database connection check failed")
        return False
    
    # Create test user
    if not create_test_user():
        print("❌ Test user creation failed")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update database credentials in test_xp_system.py")
    print("2. Run the automated tests: python test_xp_system.py")
    print("3. Follow the manual testing checklist: manual_test_checklist.md")
    print("\n🔧 Configuration needed:")
    print("- Update DB_CONFIG in test_xp_system.py with your database credentials")
    print("- Ensure your backend server is running on http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 