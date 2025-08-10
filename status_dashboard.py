#!/usr/bin/env python3
"""
Real-time Status Dashboard for MotionFalcon Crypto Trading Application
Monitors backend, frontend, and API endpoints with live updates
"""

import requests
import time
import json
from datetime import datetime
import os
import sys

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def get_status_icon(status):
    """Get status icon based on boolean status"""
    return "✅" if status else "❌"

def check_service(url, name):
    """Check if a service is running"""
    try:
        response = requests.get(url, timeout=5)
        return True, f"{response.status_code} OK"
    except requests.exceptions.RequestException as e:
        return False, f"Connection error: {str(e)[:50]}"

def check_api_endpoint(url, method="GET"):
    """Check API endpoint status"""
    try:
        response = requests.request(method, url, timeout=5)
        if response.status_code in [200, 401, 403]:  # 401/403 are expected for unauthenticated requests
            return True, response.status_code
        else:
            return False, response.status_code
    except requests.exceptions.RequestException as e:
        return False, f"Error: {str(e)[:30]}"

def get_crypto_prices():
    """Get current crypto prices from API"""
    try:
        response = requests.get("http://127.0.0.1:8000/trade/prices", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('prices', [])[:5]  # Return first 5 prices
        else:
            return []
    except:
        return []

def main():
    """Main dashboard function"""
    while True:
        clear_screen()
        
        # Header
        print("=" * 80)
        print("🚀 MotionFalcon Crypto Trading Application - Live Status Dashboard")
        print("=" * 80)
        print(f"📅 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Service Status
        print("🔧 SERVICE STATUS")
        print("-" * 40)
        
        backend_ok, backend_msg = check_service("http://127.0.0.1:8000/", "Backend")
        frontend_ok, frontend_msg = check_service("http://127.0.0.1:8081/", "Frontend")
        
        print(f"   {get_status_icon(backend_ok)} Backend API (8000): {backend_msg}")
        print(f"   {get_status_icon(frontend_ok)} Frontend (8081): {frontend_msg}")
        print()
        
        # API Endpoints
        if backend_ok:
            print("🔍 API ENDPOINTS")
            print("-" * 40)
            
            endpoints = [
                ("/trade/prices", "GET", "Crypto Prices"),
                ("/trade/portfolio", "GET", "Portfolio"),
                ("/auth/profile", "GET", "User Profile"),
                ("/achievements/user", "GET", "Achievements")
            ]
            
            for endpoint, method, name in endpoints:
                ok, status = check_api_endpoint(f"http://127.0.0.1:8000{endpoint}", method)
                print(f"   {get_status_icon(ok)} {name}: {status}")
            print()
            
            # Live Crypto Prices
            print("💰 LIVE CRYPTO PRICES")
            print("-" * 40)
            prices = get_crypto_prices()
            if prices:
                for price in prices:
                    symbol = price.get('symbol', 'N/A')
                    price_val = price.get('price', 0)
                    change = price.get('change_24h_percent', 0)
                    change_icon = "📈" if change > 0 else "📉" if change < 0 else "➡️"
                    print(f"   {change_icon} {symbol}: ${price_val:,.2f} ({change:+.2f}%)")
            else:
                print("   ⚠️  Unable to fetch prices")
            print()
        
        # Quick Actions
        print("⚡ QUICK ACTIONS")
        print("-" * 40)
        print("   🌐 Open Frontend: http://127.0.0.1:8081")
        print("   📚 API Docs: http://127.0.0.1:8000/docs")
        print("   🔧 Health Check: python3 health_check.py")
        print("   🛑 Stop Services: pkill -f 'uvicorn\|http.server'")
        print()
        
        # Overall Status
        print("📊 OVERALL STATUS")
        print("-" * 40)
        if backend_ok and frontend_ok:
            print("   🎉 All systems operational!")
            print("   🚀 Application is ready for use")
        else:
            print("   ⚠️  Some services are not running")
            if not backend_ok:
                print("   💡 Start backend: cd crypto-backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")
            if not frontend_ok:
                print("   💡 Start frontend: cd crypto-frontend/dashboard/xhtml && python3 -m http.server 8081")
        
        print("=" * 80)
        print("Press Ctrl+C to exit | Auto-refresh every 10 seconds")
        
        # Wait for next update
        time.sleep(10)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Dashboard stopped. Goodbye!")
        sys.exit(0) 