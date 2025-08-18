#!/bin/bash

# Corrected MotionFalcon Backend Test Script
# Based on actual available endpoints in the routes
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

echo "6. Testing test endpoint..."
curl -s "$BASE_URL/test" | jq '.'

# Test debug endpoints
echo ""
echo "🔧 Testing Debug Endpoints..."
echo "------------------------------"

echo "7. Testing database schema info..."
curl -s "$BASE_URL/debug/schema" | jq '.'

# Test currency endpoints (actual available endpoints)
echo ""
echo "💱 Testing Currency Endpoints..."
echo "---------------------------------"

echo "8. Testing supported currencies..."
curl -s "$BASE_URL/currency/supported" | jq '.'

echo "9. Testing exchange rates..."
curl -s "$BASE_URL/currency/rates" | jq '.'

# Test leaderboard endpoints
echo ""
echo "🏆 Testing Leaderboard Endpoints..."
echo "-----------------------------------"

echo "10. Testing global leaderboard..."
curl -s "$BASE_URL/leaderboard/global" | jq '.'

echo "11. Testing weekly leaderboard..."
curl -s "$BASE_URL/leaderboard/weekly" | jq '.'

# Test authentication endpoints
echo ""
echo "🔐 Testing Authentication Endpoints..."
echo "--------------------------------------"

echo "12. Testing user registration..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
  }' | jq '.'

echo "13. Testing user login..."
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }' | jq '.'

# Test test endpoints (simple auth for testing)
echo ""
echo "🧪 Testing Simple Test Endpoints..."
echo "-----------------------------------"

echo "14. Testing simple login endpoint..."
curl -s -X POST "$BASE_URL/simple-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testpass" | jq '.'

echo "15. Testing test login endpoint..."
curl -s -X POST "$BASE_URL/auth/test-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testpass" | jq '.'

echo ""
echo "✅ Corrected backend testing completed!"
echo "=================================================="
echo ""
echo "📝 Notes:"
echo "- Some endpoints may return errors if database is not fully connected"
echo "- Authentication endpoints should work for testing"
echo "- Check responses for any specific error messages"
