#!/usr/bin/env python3
"""
XP/Level System Testing Script
Tests all XP logic, milestone triggers, and badge functionality
"""

import requests
import json
import time
import psycopg2
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your API URL
DB_CONFIG = {
    "host": "localhost",
    "database": "crypto_db",
    "user": "udaytomar",
    "password": ""  # No password for local development
}

class XPSystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"[{status.upper()}] {test_name}: {details}")
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            return conn
        except Exception as e:
            self.log_test("Database Connection", "FAILED", str(e))
            return None
            
    def get_user_data(self):
        """Get current user data from database"""
        print(f"Getting user data for user_id: {self.user_id}")
        conn = self.connect_db()
        if not conn:
            print("❌ Database connection failed")
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, level, xp, xp_first_gain_awarded, 
                       xp_lost_all_awarded, xp_best_rank, demo_balance
                FROM users 
                WHERE id = %s
            """, (self.user_id,))
            
            result = cursor.fetchone()
            if result:
                user_data = {
                    "id": result[0],
                    "username": result[1],
                    "level": result[2],
                    "xp": result[3],
                    "xp_first_gain_awarded": result[4],
                    "xp_lost_all_awarded": result[5],
                    "xp_best_rank": result[6],
                    "demo_balance": result[7]
                }
                print(f"✅ Retrieved user data: {user_data}")
                return user_data
            else:
                print("❌ No user found in database")
                return None
        except Exception as e:
            self.log_test("Get User Data", "FAILED", str(e))
        finally:
            conn.close()
        return None
        
    def login_user(self, username="testuser", password="testpass"):
        """Login and get authentication token"""
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json={
                "email": "test@example.com",  # Use email instead of username
                "password": password
            })
            
            if response.status_code == 200:
                data = response.json()
                self.user_token = data.get("access_token")
                # Set authorization header for future requests
                self.session.headers.update({
                    "Authorization": f"Bearer {self.user_token}"
                })
                
                # Get user ID from profile endpoint since login doesn't return user data
                if self.user_token:
                    profile_response = self.session.get(f"{BASE_URL}/auth/profile")
                    if profile_response.status_code == 200:
                        profile_data = profile_response.json()
                        self.user_id = profile_data.get("id")
                        print(f"✅ Set user_id to: {self.user_id}")
                    else:
                        print(f"❌ Profile request failed: {profile_response.status_code}")
                        print(f"Profile response: {profile_response.text}")
                    
                    self.log_test("User Login", "PASSED", f"Logged in as {username}")
                    return True
                else:
                    self.log_test("User Login", "FAILED", f"Status: {response.status_code}")
                    return False
                
        except Exception as e:
            self.log_test("User Login", "FAILED", str(e))
            return False
            
    def test_login_xp(self):
        """Test XP gain from login"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        initial_xp = initial_data["xp"]
        initial_level = initial_data["level"]
        
        # Simulate login (we'll call the login endpoint again)
        response = self.session.post(f"{BASE_URL}/auth/login", json={
            "email": "test@example.com",
            "password": "testpass"
        })
        
        if response.status_code == 200:
            time.sleep(1)  # Wait for DB update
            new_data = self.get_user_data()
            
            if new_data:
                xp_gained = new_data["xp"] - initial_xp
                level_gained = new_data["level"] - initial_level
                
                if xp_gained >= 10:  # Should get at least 10 XP for login
                    self.log_test("Login XP", "PASSED", 
                                f"Gained {xp_gained} XP, Level: {initial_level} → {new_data['level']}")
                else:
                    self.log_test("Login XP", "FAILED", 
                                f"Expected ≥10 XP, got {xp_gained}")
            else:
                self.log_test("Login XP", "FAILED", "Could not retrieve user data")
        else:
            self.log_test("Login XP", "FAILED", f"Login failed: {response.status_code}")
            
    def test_trade_xp(self):
        """Test XP gain from trading"""
        print("🔍 Testing trade XP...")
        initial_data = self.get_user_data()
        if not initial_data:
            print("❌ Could not get initial user data")
            return
            
        initial_xp = initial_data["xp"]
        initial_level = initial_data["level"]
        
        # Make a small trade
        print(f"Making trade with data: {{'coin_symbol': 'BTC', 'side': 'buy', 'quantity': 0.001}}")
        response = self.session.post(f"{BASE_URL}/trade/buy", json={
            "coin_symbol": "BTC",
            "side": "buy",
            "quantity": 0.001
        })
        
        print(f"Trade response status: {response.status_code}")
        print(f"Trade response: {response.text}")
        
        if response.status_code == 200:
            time.sleep(1)  # Wait for DB update
            new_data = self.get_user_data()
            
            if new_data:
                xp_gained = new_data["xp"] - initial_xp
                level_gained = new_data["level"] - initial_level
                
                if xp_gained >= 25:  # Should get 25 XP for trade
                    self.log_test("Trade XP", "PASSED", 
                                f"Gained {xp_gained} XP, Level: {initial_level} → {new_data['level']}")
                else:
                    self.log_test("Trade XP", "FAILED", 
                                f"Expected ≥25 XP, got {xp_gained}")
            else:
                self.log_test("Trade XP", "FAILED", "Could not retrieve user data")
        else:
            self.log_test("Trade XP", "FAILED", f"Trade failed: {response.status_code}")
            
    def test_first_gain_milestone(self):
        """Test first portfolio gain milestone"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        if initial_data["xp_first_gain_awarded"]:
            self.log_test("First Gain Milestone", "SKIPPED", "Already awarded")
            return
            
        initial_xp = initial_data["xp"]
        initial_level = initial_data["level"]
        
        # Check if user has any profitable trades
        response = self.session.get(f"{BASE_URL}/trade/portfolio")
        
        if response.status_code == 200:
            portfolio_data = response.json()
            total_profit_loss = portfolio_data.get("total_profit_loss", 0)
            
            if total_profit_loss > 0:
                time.sleep(1)  # Wait for DB update
                new_data = self.get_user_data()
                
                if new_data and new_data["xp_first_gain_awarded"]:
                    xp_gained = new_data["xp"] - initial_xp
                    self.log_test("First Gain Milestone", "PASSED", 
                                f"Milestone triggered! Gained {xp_gained} XP")
                else:
                    self.log_test("First Gain Milestone", "FAILED", 
                                "Milestone not triggered despite profit")
            else:
                self.log_test("First Gain Milestone", "SKIPPED", "No profit to trigger milestone")
        else:
            self.log_test("First Gain Milestone", "FAILED", f"Portfolio fetch failed: {response.status_code}")
            
    def test_lost_all_milestone(self):
        """Test lost all demo money milestone"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        if initial_data["xp_lost_all_awarded"]:
            self.log_test("Lost All Milestone", "SKIPPED", "Already awarded")
            return
            
        initial_xp = initial_data["xp"]
        initial_level = initial_data["level"]
        
        # Check if user has zero or negative balance
        if initial_data["demo_balance"] <= 0:
            time.sleep(1)  # Wait for DB update
            new_data = self.get_user_data()
            
            if new_data and new_data["xp_lost_all_awarded"]:
                xp_gained = new_data["xp"] - initial_xp
                self.log_test("Lost All Milestone", "PASSED", 
                            f"Milestone triggered! Gained {xp_gained} XP")
            else:
                self.log_test("Lost All Milestone", "FAILED", 
                            "Milestone not triggered despite zero balance")
        else:
            self.log_test("Lost All Milestone", "SKIPPED", "User still has demo balance")
            
    def test_leaderboard_milestone(self):
        """Test leaderboard rank milestone"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        initial_xp = initial_data["xp"]
        initial_level = initial_data["level"]
        current_best_rank = initial_data["xp_best_rank"]
        
        # Get current rank
        response = self.session.get(f"{BASE_URL}/leaderboard/my-rank")
        
        if response.status_code == 200:
            rank_data = response.json()
            current_rank = rank_data.get("global_rank", 999999)
            
            # Check if this is a new best rank
            if current_best_rank is None or current_rank < current_best_rank:
                time.sleep(1)  # Wait for DB update
                new_data = self.get_user_data()
                
                if new_data and new_data["xp_best_rank"] == current_rank:
                    xp_gained = new_data["xp"] - initial_xp
                    self.log_test("Leaderboard Milestone", "PASSED", 
                                f"New best rank! Gained {xp_gained} XP, Rank: {current_rank}")
                else:
                    self.log_test("Leaderboard Milestone", "FAILED", 
                                "Milestone not triggered despite new best rank")
            else:
                self.log_test("Leaderboard Milestone", "SKIPPED", 
                            f"Current rank {current_rank} not better than best {current_best_rank}")
        else:
            self.log_test("Leaderboard Milestone", "FAILED", f"Rank fetch failed: {response.status_code}")
            
    def test_milestone_duplication(self):
        """Test that milestones are not awarded twice"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        # Try to trigger milestones again
        initial_xp = initial_data["xp"]
        
        # Simulate actions that would normally trigger milestones
        self.session.post(f"{BASE_URL}/auth/login", json={
            "username": "testuser",
            "password": "testpass"
        })
        
        time.sleep(1)
        new_data = self.get_user_data()
        
        if new_data:
            xp_gained = new_data["xp"] - initial_xp
            
            # Check if XP gained is reasonable (should only be login XP, not milestone XP)
            if xp_gained <= 15:  # Login XP only
                self.log_test("Milestone Duplication", "PASSED", 
                            f"No duplicate milestone XP awarded. Gained: {xp_gained}")
            else:
                self.log_test("Milestone Duplication", "FAILED", 
                            f"Unexpected XP gain: {xp_gained} (possible duplicate)")
        else:
            self.log_test("Milestone Duplication", "FAILED", "Could not retrieve user data")
            
    def test_level_progression(self):
        """Test level progression logic"""
        initial_data = self.get_user_data()
        if not initial_data:
            return
            
        initial_level = initial_data["level"]
        initial_xp = initial_data["xp"]
        
        # Calculate expected XP needed for next level
        def xp_needed(level):
            return 100 + (level - 1) * 50
            
        xp_for_next = xp_needed(initial_level)
        xp_progress = initial_xp / xp_for_next
        
        self.log_test("Level Progression", "INFO", 
                    f"Level {initial_level}, XP: {initial_xp}/{xp_for_next} ({xp_progress:.1%})")
        
        # Make several trades to potentially level up
        for i in range(5):
            self.session.post(f"{BASE_URL}/trade/buy", json={
                "coin_symbol": "BTC",
                "side": "buy",
                "quantity": 0.001
            })
            time.sleep(0.5)
            
        time.sleep(1)
        new_data = self.get_user_data()
        
        if new_data:
            level_gained = new_data["level"] - initial_level
            xp_gained = new_data["xp"] - initial_xp
            
            if level_gained >= 0:
                self.log_test("Level Progression", "PASSED", 
                            f"Level: {initial_level} → {new_data['level']}, XP gained: {xp_gained}")
            else:
                self.log_test("Level Progression", "FAILED", "Level decreased unexpectedly")
        else:
            self.log_test("Level Progression", "FAILED", "Could not retrieve user data")
            
    def run_all_tests(self):
        """Run all XP system tests"""
        print("🧪 Starting XP/Level System Tests...")
        print("=" * 50)
        
        # Login first
        if not self.login_user():
            print("❌ Cannot proceed without login")
            return
            
        # Run all tests
        self.test_login_xp()
        self.test_trade_xp()
        self.test_first_gain_milestone()
        self.test_lost_all_milestone()
        self.test_leaderboard_milestone()
        self.test_milestone_duplication()
        self.test_level_progression()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 Test Summary:")
        
        passed = sum(1 for r in self.test_results if r["status"] == "PASSED")
        failed = sum(1 for r in self.test_results if r["status"] == "FAILED")
        skipped = sum(1 for r in self.test_results if r["status"] == "SKIPPED")
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⏭️  Skipped: {skipped}")
        
        if failed == 0:
            print("🎉 All tests passed! XP system is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        # Save results to file
        with open("xp_test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        print(f"📄 Results saved to xp_test_results.json")

if __name__ == "__main__":
    tester = XPSystemTester()
    tester.run_all_tests() 