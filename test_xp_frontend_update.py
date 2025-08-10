#!/usr/bin/env python3
"""
Test script to verify XP system and frontend updates
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_xp_system():
    """Test the XP system and verify frontend updates"""
    
    print("🧪 Testing XP System and Frontend Updates")
    print("=" * 50)
    
    # Test login to get a user session
    login_data = {
        "email": "testuser@example.com",
        "password": "testpass123"
    }
    
    try:
        # Login
        print("1. Logging in...")
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print("❌ Login failed")
            return
        
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get initial user profile
        print("2. Getting initial user profile...")
        profile_response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
        if profile_response.status_code != 200:
            print("❌ Failed to get profile")
            return
        
        initial_profile = profile_response.json()
        initial_xp = initial_profile.get("xp", 0)
        initial_level = initial_profile.get("level", 1)
        
        print(f"   Initial Level: {initial_level}, XP: {initial_xp}")
        
        # Make a trade to trigger XP gain
        print("3. Making a trade to trigger XP gain...")
        trade_data = {
            "coin_symbol": "BTC",
            "side": "buy",
            "quantity": 0.001
        }
        
        trade_response = requests.post(f"{BASE_URL}/trade/", json=trade_data, headers=headers)
        if trade_response.status_code != 200:
            print("❌ Trade failed")
            return
        
        print("   ✅ Trade executed successfully")
        
        # Wait a moment for backend processing
        time.sleep(1)
        
        # Get updated user profile
        print("4. Getting updated user profile...")
        updated_profile_response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
        if updated_profile_response.status_code != 200:
            print("❌ Failed to get updated profile")
            return
        
        updated_profile = updated_profile_response.json()
        updated_xp = updated_profile.get("xp", 0)
        updated_level = updated_profile.get("level", 1)
        
        print(f"   Updated Level: {updated_level}, XP: {updated_xp}")
        
        # Check if XP increased
        xp_gained = updated_xp - initial_xp
        level_gained = updated_level - initial_level
        
        if xp_gained > 0:
            print(f"   ✅ XP increased by {xp_gained}")
        else:
            print("   ⚠️  No XP gained")
        
        if level_gained > 0:
            print(f"   🎉 Level increased by {level_gained}")
        else:
            print("   📊 No level increase")
        
        # Test portfolio endpoint to trigger milestone XP
        print("5. Checking portfolio for milestone XP...")
        portfolio_response = requests.get(f"{BASE_URL}/trade/portfolio", headers=headers)
        if portfolio_response.status_code == 200:
            print("   ✅ Portfolio check completed")
        else:
            print("   ⚠️  Portfolio check failed")
        
        # Test leaderboard endpoint to trigger rank XP
        print("6. Checking leaderboard for rank XP...")
        rank_response = requests.get(f"{BASE_URL}/leaderboard/my-rank", headers=headers)
        if rank_response.status_code == 200:
            print("   ✅ Leaderboard check completed")
        else:
            print("   ⚠️  Leaderboard check failed")
        
        # Final profile check
        print("7. Final profile check...")
        final_profile_response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
        if final_profile_response.status_code == 200:
            final_profile = final_profile_response.json()
            final_xp = final_profile.get("xp", 0)
            final_level = final_profile.get("level", 1)
            
            print(f"   Final Level: {final_level}, XP: {final_xp}")
            
            total_xp_gained = final_xp - initial_xp
            total_level_gained = final_level - initial_level
            
            print(f"   📈 Total XP gained: {total_xp_gained}")
            print(f"   🏆 Total levels gained: {total_level_gained}")
            
            # Check milestone flags
            first_gain = final_profile.get("xp_first_gain_awarded", False)
            lost_all = final_profile.get("xp_lost_all_awarded", False)
            best_rank = final_profile.get("xp_best_rank")
            
            print(f"   🥇 First Gain milestone: {first_gain}")
            print(f"   💪 Lost All milestone: {lost_all}")
            print(f"   🏅 Best rank: {best_rank}")
            
        else:
            print("   ❌ Final profile check failed")
        
        print("\n🎯 Frontend Update Instructions:")
        print("1. Open http://localhost:5173 in your browser")
        print("2. Navigate to Settings page")
        print("3. Check the XP progress bar and level display")
        print("4. Use the refresh button (🔄) to manually update XP data")
        print("5. The XP should update automatically every 5 seconds")
        print("6. The sidebar should also update every 10 seconds")
        
        print("\n✅ XP System Test Complete!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_xp_system() 