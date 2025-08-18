#!/bin/bash

# Quick Backend Test - No Authentication Required
# Replace YOUR_DEPLOYED_URL with your actual deployed backend URL
BASE_URL="https://motionfalcon-backend.onrender.com"

echo "🚀 Quick MotionFalcon Backend Test (No Auth Required)"
echo "======================================================"

# Test basic endpoints
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

echo "7. Database schema:"
curl -s "$BASE_URL/debug/schema" | jq '.'

echo "8. Available currencies:"
curl -s "$BASE_URL/currency/available" | jq '.'

echo "9. Current prices:"
curl -s "$BASE_URL/currency/prices" | jq '.'

echo "10. Global leaderboard:"
curl -s "$BASE_URL/leaderboard/global" | jq '.'

echo "11. All achievements:"
curl -s "$BASE_URL/achievement/all" | jq '.'

echo ""
echo "✅ Quick test completed!"
echo "Replace YOUR_DEPLOYED_URL with your actual deployed URL"
