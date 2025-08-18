#!/bin/bash

# MotionFalcon Backend Testing Script
# Replace YOUR_DEPLOYED_URL with your actual deployed backend URL
BASE_URL="https://motionfalcon-backend.onrender.com"

echo "🚀 Testing MotionFalcon Backend at: $BASE_URL"
echo "=================================================="

# Test basic connectivity and health endpoints
echo ""
echo "📡 Testing Basic Connectivity..."
echo "--------------------------------"

echo "1. Testing root endpoint..."
curl -s "$BASE_URL/" | jq '.'

echo "2. Testing ping endpoint..."
curl -s "$BASE_URL/ping" | jq '.'

echo "3. Testing health check..."
curl -s "$BASE_URL/health" | jq '.'

echo "4. Testing database health..."
curl -s "$BASE_URL/health/db" | jq '.'

echo "5. Testing CORS configuration..."
curl -s "$BASE_URL/cors-test" | jq '.'

# Test authentication endpoints
echo ""
echo "🔐 Testing Authentication Endpoints..."
echo "--------------------------------------"

echo "6. Testing user registration..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
  }' | jq '.'

echo "7. Testing user login..."
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }' | jq '.'

# Test trading endpoints
echo ""
echo "📈 Testing Trading Endpoints..."
echo "--------------------------------"

echo "8. Testing get available currencies..."
curl -s "$BASE_URL/currency/available" | jq '.'

echo "9. Testing get current prices..."
curl -s "$BASE_URL/currency/prices" | jq '.'

echo "10. Testing get user portfolio..."
curl -s "$BASE_URL/trade/portfolio" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

echo "11. Testing get trade history..."
curl -s "$BASE_URL/trade/history" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

# Test wallet endpoints
echo ""
echo "💰 Testing Wallet Endpoints..."
echo "-------------------------------"

echo "12. Testing get wallet balance..."
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

echo "13. Testing get wallet transactions..."
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

# Test leaderboard endpoints
echo ""
echo "🏆 Testing Leaderboard Endpoints..."
echo "-----------------------------------"

echo "14. Testing get global leaderboard..."
curl -s "$BASE_URL/leaderboard/global" | jq '.'

echo "15. Testing get user rank..."
curl -s "$BASE_URL/leaderboard/rank" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

# Test achievement endpoints
echo ""
echo "🎯 Testing Achievement Endpoints..."
echo "-----------------------------------"

echo "16. Testing get user achievements..."
curl -s "$BASE_URL/achievement/user" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

echo "17. Testing get all achievements..."
curl -s "$BASE_URL/achievement/all" | jq '.'

# Test purchase endpoints
echo ""
echo "🛒 Testing Purchase Endpoints..."
echo "---------------------------------"

echo "18. Testing get purchase history..."
curl -s "$BASE_URL/purchase/history" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" | jq '.'

# Test debug and schema endpoints
echo ""
echo "🔧 Testing Debug Endpoints..."
echo "------------------------------"

echo "19. Testing database schema info..."
curl -s "$BASE_URL/debug/schema" | jq '.'

echo "20. Testing test endpoints..."
curl -s "$BASE_URL/test" | jq '.'

echo ""
echo "✅ Backend testing completed!"
echo "=================================================="
echo ""
echo "📝 Notes:"
echo "- Replace 'YOUR_DEPLOYED_URL' with your actual deployed backend URL"
echo "- Replace 'YOUR_TEST_TOKEN' with a valid JWT token from login"
echo "- Some endpoints require authentication (Bearer token)"
echo "- Check the responses for any errors or unexpected behavior"
echo ""
echo "🔍 To test with a specific token, first login and copy the access_token"
echo "   Then use: export TEST_TOKEN='your_token_here'"
echo "   And update the script to use: \$TEST_TOKEN instead of YOUR_TEST_TOKEN"
