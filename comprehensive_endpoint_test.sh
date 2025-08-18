#!/bin/bash

# Comprehensive MotionFalcon Backend Endpoint Test
# Tests ALL available endpoints with correct paths
BASE_URL="https://motionfalcon-backend.onrender.com"

echo "🚀 Comprehensive MotionFalcon Backend Endpoint Test"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo ""

# Test basic connectivity and health endpoints
echo "📡 BASIC CONNECTIVITY & HEALTH"
echo "==============================="

echo "1. Root endpoint:"
curl -s "$BASE_URL/" | jq '.'

echo "2. Ping endpoint:"
curl -s "$BASE_URL/ping" | jq '.'

echo "3. Health check:"
curl -s "$BASE_URL/health" | jq '.'

echo "4. Database health:"
curl -s "$BASE_URL/health/db" | jq '.'

echo "5. CORS test:"
curl -s "$BASE_URL/cors-test" | jq '.'

echo "6. Test endpoint:"
curl -s "$BASE_URL/test" | jq '.'

echo "7. Healthz endpoint:"
curl -s "$BASE_URL/healthz" | jq '.'

# Test debug endpoints
echo ""
echo "🔧 DEBUG & SCHEMA ENDPOINTS"
echo "============================"

echo "8. Database schema info:"
curl -s "$BASE_URL/debug/schema" | jq '.'

echo "9. CORS debug:"
curl -s "$BASE_URL/cors-debug" | jq '.'

# Test trading endpoints
echo ""
echo "📈 TRADING ENDPOINTS"
echo "===================="

echo "10. Supported coins:"
curl -s "$BASE_URL/trade/supported-coins" | jq '.'

echo "11. Crypto prices:"
curl -s "$BASE_URL/trade/prices" | jq '.'

echo "12. Portfolio (requires auth):"
curl -s "$BASE_URL/trade/portfolio" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "13. Trade history (requires auth):"
curl -s "$BASE_URL/trade/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test wallet endpoints
echo ""
echo "💰 WALLET ENDPOINTS"
echo "==================="

echo "14. Wallet info (requires auth):"
curl -s "$BASE_URL/wallet/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "15. Wallet summary (requires auth):"
curl -s "$BASE_URL/wallet/summary" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "16. Wallet balance (requires auth):"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

echo "17. Wallet transactions (requires auth):"
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test purchase endpoints
echo ""
echo "🛒 PURCHASE ENDPOINTS"
echo "====================="

echo "18. Demo coin packages:"
curl -s "$BASE_URL/purchases/packages" | jq '.'

echo "19. Purchase history (requires auth):"
curl -s "$BASE_URL/purchases/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test achievement endpoints
echo ""
echo "🎯 ACHIEVEMENT ENDPOINTS"
echo "========================"

echo "20. All achievements:"
curl -s "$BASE_URL/achievement/all" | jq '.'

echo "21. User achievements (requires auth):"
curl -s "$BASE_URL/achievement/user" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test leaderboard endpoints
echo ""
echo "🏆 LEADERBOARD ENDPOINTS"
echo "========================"

echo "22. Global leaderboard:"
curl -s "$BASE_URL/leaderboard/global" | jq '.'

echo "23. Weekly leaderboard:"
curl -s "$BASE_URL/leaderboard/weekly" | jq '.'

echo "24. User rank (requires auth):"
curl -s "$BASE_URL/leaderboard/my-rank" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.'

# Test currency endpoints
echo ""
echo "💱 CURRENCY ENDPOINTS"
echo "====================="

echo "25. Supported currencies:"
curl -s "$BASE_URL/currency/supported" | jq '.'

echo "26. Exchange rates:"
curl -s "$BASE_URL/currency/rates" | jq '.'

# Test authentication endpoints
echo ""
echo "🔐 AUTHENTICATION ENDPOINTS"
echo "==========================="

echo "27. User registration:"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "comprehensiveuser",
    "email": "comprehensive@example.com",
    "password": "testpass123"
  }' | jq '.'

echo "28. User login:"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "comprehensive@example.com",
    "password": "testpass123"
  }' | jq '.'

# Test simple auth endpoints
echo ""
echo "🧪 SIMPLE AUTH TEST ENDPOINTS"
echo "============================="

echo "29. Simple login:"
curl -s -X POST "$BASE_URL/simple-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testpass" | jq '.'

echo "30. Test login:"
curl -s -X POST "$BASE_URL/auth/test-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testpass" | jq '.'

echo "31. Test register:"
curl -s -X POST "$BASE_URL/test-register" | jq '.'

echo "32. Test register simple:"
curl -s -X POST "$BASE_URL/test-register-simple" | jq '.'

echo ""
echo "✅ Comprehensive Endpoint Testing Completed!"
echo "============================================"
echo ""
echo "📊 TEST SUMMARY:"
echo "================="
echo "✅ Public endpoints tested: 32 total"
echo "⚠️  Auth-required endpoints: Need valid tokens to test fully"
echo "🔍 Database-dependent endpoints: May fail due to DB connectivity issues"
echo ""
echo "🔑 TO TEST AUTHENTICATED ENDPOINTS:"
echo "1. Run registration/login tests first"
echo "2. Copy the 'access_token' from successful login"
echo "3. Replace 'YOUR_TOKEN_HERE' with the actual token"
echo "4. Re-run specific protected endpoint tests"
echo ""
echo "🚨 KNOWN ISSUES:"
echo "- Database connection problems affecting some endpoints"
echo "- Leaderboard endpoints may return 500 errors"
echo "- Some endpoints require database access to function properly"
