#!/bin/bash

# Comprehensive Trading, Wallet & Transaction Endpoints Test
# Tests all trading, wallet, and transaction-related features
BASE_URL="https://motionfalcon-backend.onrender.com"

echo "🚀 Testing MotionFalcon Trading, Wallet & Transaction Endpoints"
echo "================================================================"
echo "Base URL: $BASE_URL"
echo ""

# Test trading endpoints
echo "📈 TRADING ENDPOINTS TESTING"
echo "============================="

echo "1. Testing supported coins endpoint..."
curl -s "$BASE_URL/trade/supported-coins" | jq '.'

echo "2. Testing crypto prices endpoint..."
curl -s "$BASE_URL/trade/prices" | jq '.'

echo "3. Testing portfolio endpoint (requires auth)..."
curl -s "$BASE_URL/trade/portfolio" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "4. Testing trade history endpoint (requires auth)..."
curl -s "$BASE_URL/trade/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "5. Testing trade confirmation endpoint (requires auth)..."
curl -s "$BASE_URL/trade/confirm" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "coin_symbol": "BTC",
    "quantity": 0.001,
    "trade_type": "buy"
  }' | jq '.'

# Test wallet endpoints
echo ""
echo "💰 WALLET ENDPOINTS TESTING"
echo "============================"

echo "6. Testing wallet info endpoint (requires auth)..."
curl -s "$BASE_URL/wallet/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "7. Testing wallet summary endpoint (requires auth)..."
curl -s "$BASE_URL/wallet/summary" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "8. Testing wallet balance endpoint (requires auth)..."
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "9. Testing wallet transactions endpoint (requires auth)..."
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "10. Testing wallet top-up endpoint (requires auth)..."
curl -s -X POST "$BASE_URL/wallet/top-up" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.0
  }' | jq '.'

# Test purchase endpoints
echo ""
echo "🛒 PURCHASE ENDPOINTS TESTING"
echo "=============================="

echo "11. Testing purchase history endpoint (requires auth)..."
curl -s "$BASE_URL/purchase/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "12. Testing demo coin packages endpoint..."
curl -s "$BASE_URL/purchase/packages" | jq '.'

# Test achievement endpoints
echo ""
echo "🎯 ACHIEVEMENT ENDPOINTS TESTING"
echo "================================="

echo "13. Testing all achievements endpoint..."
curl -s "$BASE_URL/achievement/all" | jq '.'

echo "14. Testing user achievements endpoint (requires auth)..."
curl -s "$BASE_URL/achievement/user" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test leaderboard endpoints
echo ""
echo "🏆 LEADERBOARD ENDPOINTS TESTING"
echo "================================="

echo "15. Testing global leaderboard endpoint..."
curl -s "$BASE_URL/leaderboard/global" | jq '.'

echo "16. Testing weekly leaderboard endpoint..."
curl -s "$BASE_URL/leaderboard/weekly" | jq '.'

echo "17. Testing user rank endpoint (requires auth)..."
curl -s "$BASE_URL/leaderboard/my-rank" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test authentication endpoints
echo ""
echo "🔐 AUTHENTICATION ENDPOINTS TESTING"
echo "==================================="

echo "18. Testing user registration..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tradingtestuser",
    "email": "tradingtest@example.com",
    "password": "testpass123"
  }' | jq '.'

echo "19. Testing user login..."
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tradingtest@example.com",
    "password": "testpass123"
  }' | jq '.'

# Test currency endpoints
echo ""
echo "💱 CURRENCY ENDPOINTS TESTING"
echo "=============================="

echo "20. Testing supported currencies endpoint..."
curl -s "$BASE_URL/currency/supported" | jq '.'

echo "21. Testing exchange rates endpoint..."
curl -s "$BASE_URL/currency/rates" | jq '.'

echo ""
echo "✅ Trading, Wallet & Transaction Testing Completed!"
echo "=================================================="
echo ""
echo "📝 IMPORTANT NOTES:"
echo "- Endpoints marked 'requires auth' need valid JWT tokens"
echo "- Some endpoints may fail due to database connectivity issues"
echo "- Test endpoints return different responses based on authentication"
echo ""
echo "🔑 TO TEST AUTHENTICATED ENDPOINTS:"
echo "1. First run the registration/login tests"
echo "2. Copy the 'access_token' from the response"
echo "3. Replace 'YOUR_TOKEN_HERE' with the actual token"
echo "4. Re-run the script to test protected endpoints"
echo ""
echo "🚨 EXPECTED ISSUES:"
echo "- Database connection errors may affect some endpoints"
echo "- Leaderboard endpoints may return 500 errors"
echo "- User-specific data requires valid authentication"
