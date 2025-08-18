#!/usr/bin/env python3
"""
Simple CORS test script to verify backend configuration
Run this after deploying to test if CORS is working
"""

import requests
import json

# Test URLs
BACKEND_URL = "https://motionfalcon-backend.onrender.com"  # Update this to your actual backend URL
FRONTEND_URL = "https://crypto-frontend-lffc.onrender.com"  # Update this to your actual frontend URL

def test_cors():
    """Test CORS configuration"""
    print("=== Testing CORS Configuration ===")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print()
    
    # Test 1: Simple GET request
    print("1. Testing simple GET request...")
    try:
        response = requests.get(f"{BACKEND_URL}/ping")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        print(f"   CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   Error: {e}")
    print()
    
    # Test 2: CORS preflight (OPTIONS request)
    print("2. Testing CORS preflight...")
    try:
        headers = {
            'Origin': FRONTEND_URL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   Error: {e}")
    print()
    
    # Test 3: Test login endpoint with CORS
    print("3. Testing login endpoint with CORS...")
    try:
        headers = {
            'Origin': FRONTEND_URL,
            'Content-Type': 'application/json'
        }
        data = {
            'email': 'test@example.com',
            'password': 'testpassword'
        }
        response = requests.post(f"{BACKEND_URL}/auth/login", headers=headers, json=data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
        print(f"   CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   Error: {e}")
    print()
    
    # Test 4: Check CORS debug endpoint
    print("4. Testing CORS debug endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/cors-debug")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    print()
    
    print("=== CORS Test Complete ===")

if __name__ == "__main__":
    test_cors()
