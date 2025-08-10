#!/usr/bin/env python3
"""
Health check script for MotionFalcon Crypto Trading Application
Monitors both backend and frontend services
"""

import requests
import time
import json
from datetime import datetime

def check_backend():
    """Check if backend API is running"""
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, f"Backend returned status {response.status_code}"
    except requests.exceptions.RequestException as e:
        return False, f"Backend connection error: {e}"

def check_frontend():
    """Check if frontend is running"""
    try:
        response = requests.get("http://127.0.0.1:8081/", timeout=5)
        if response.status_code == 200:
            return True, "Frontend is running"
        else:
            return False, f"Frontend returned status {response.status_code}"
    except requests.exceptions.RequestException as e:
        return False, f"Frontend connection error: {e}"

def check_api_endpoints():
    """Check key API endpoints"""
    endpoints = [
        ("/trade/prices", "GET"),
        ("/trade/portfolio", "GET"),
        ("/auth/profile", "GET"),
        ("/achievements/user", "GET")
    ]
    
    results = {}
    for endpoint, method in endpoints:
        try:
            response = requests.request(method, f"http://127.0.0.1:8000{endpoint}", timeout=5)
            if response.status_code in [200, 401, 403]:  # 401/403 are expected for unauthenticated requests
                results[endpoint] = {"status": "OK", "code": response.status_code}
            else:
                results[endpoint] = {"status": "ERROR", "code": response.status_code}
        except requests.exceptions.RequestException as e:
            results[endpoint] = {"status": "ERROR", "error": str(e)}
    
    return results

def main():
    """Main health check function"""
    print("=" * 60)
    print("MotionFalcon Crypto Trading Application - Health Check")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check backend
    print("🔧 Backend Status:")
    backend_ok, backend_msg = check_backend()
    if backend_ok:
        print("   ✅ Backend is running")
        print(f"   📝 Message: {backend_msg.get('message', 'N/A')}")
    else:
        print("   ❌ Backend is not running")
        print(f"   📝 Error: {backend_msg}")
    print()
    
    # Check frontend
    print("🌐 Frontend Status:")
    frontend_ok, frontend_msg = check_frontend()
    if frontend_ok:
        print("   ✅ Frontend is running")
        print(f"   📝 Message: {frontend_msg}")
    else:
        print("   ❌ Frontend is not running")
        print(f"   📝 Error: {frontend_msg}")
    print()
    
    # Check API endpoints
    if backend_ok:
        print("🔍 API Endpoints Status:")
        endpoint_results = check_api_endpoints()
        for endpoint, result in endpoint_results.items():
            if result["status"] == "OK":
                print(f"   ✅ {endpoint} - {result['code']}")
            else:
                print(f"   ❌ {endpoint} - {result.get('error', 'Unknown error')}")
        print()
    
    # Summary
    print("📊 Summary:")
    if backend_ok and frontend_ok:
        print("   🎉 All services are running!")
        print("   🌐 Access the application at: http://127.0.0.1:8081")
        print("   🔧 API documentation at: http://127.0.0.1:8000/docs")
    else:
        print("   ⚠️  Some services are not running")
        if not backend_ok:
            print("   💡 Start backend: cd crypto-backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        if not frontend_ok:
            print("   💡 Start frontend: cd crypto-frontend/dashboard/xhtml && python3 -m http.server 8081")
    
    print("=" * 60)

if __name__ == "__main__":
    main() 