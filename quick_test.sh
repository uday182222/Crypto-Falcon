#!/bin/bash

# Quick XP/Level System Testing Script
# Usage: ./quick_test.sh [TOKEN]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"
TOKEN=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Check if token is provided as argument
if [ $# -eq 1 ]; then
    TOKEN=$1
    print_status "Using provided token: ${TOKEN:0:20}..."
else
    print_warning "No token provided. Please provide a valid JWT token as argument."
    print_status "Usage: ./quick_test.sh YOUR_JWT_TOKEN"
    print_status "To get a token, login first:"
    echo "curl -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d '{\"username\": \"testuser\", \"password\": \"testpass\"}'"
    exit 1
fi

# Test 1: Check Profile
print_header "Test 1: Checking User Profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "$PROFILE_RESPONSE" | jq '.'
    print_status "Profile retrieved successfully"
else
    print_error "Failed to retrieve profile"
fi

echo ""

# Test 2: Make a Trade
print_header "Test 2: Making a Buy Trade"
TRADE_RESPONSE=$(curl -s -X POST "$BASE_URL/trade/buy" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"currency": "BTC", "amount": 10.0}')

if [ $? -eq 0 ]; then
    echo "$TRADE_RESPONSE" | jq '.'
    print_status "Trade executed successfully"
else
    print_error "Failed to execute trade"
fi

echo ""

# Test 3: Check Profile After Trade
print_header "Test 3: Checking Profile After Trade"
PROFILE_AFTER_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "$PROFILE_AFTER_RESPONSE" | jq '.'
    print_status "Profile after trade retrieved successfully"
else
    print_error "Failed to retrieve profile after trade"
fi

echo ""

# Test 4: Check Portfolio
print_header "Test 4: Checking Portfolio"
PORTFOLIO_RESPONSE=$(curl -s -X GET "$BASE_URL/trade/portfolio" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "$PORTFOLIO_RESPONSE" | jq '.'
    print_status "Portfolio retrieved successfully"
else
    print_error "Failed to retrieve portfolio"
fi

echo ""

# Test 5: Check Leaderboard Rank
print_header "Test 5: Checking Leaderboard Rank"
RANK_RESPONSE=$(curl -s -X GET "$BASE_URL/leaderboard/my-rank" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "$RANK_RESPONSE" | jq '.'
    print_status "Leaderboard rank retrieved successfully"
else
    print_error "Failed to retrieve leaderboard rank"
fi

echo ""

# Test 6: Make Another Trade
print_header "Test 6: Making a Sell Trade"
SELL_RESPONSE=$(curl -s -X POST "$BASE_URL/trade/sell" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"currency": "BTC", "amount": 5.0}')

if [ $? -eq 0 ]; then
    echo "$SELL_RESPONSE" | jq '.'
    print_status "Sell trade executed successfully"
else
    print_error "Failed to execute sell trade"
fi

echo ""

# Test 7: Final Profile Check
print_header "Test 7: Final Profile Check"
FINAL_PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "$FINAL_PROFILE_RESPONSE" | jq '.'
    print_status "Final profile retrieved successfully"
else
    print_error "Failed to retrieve final profile"
fi

echo ""

# Summary
print_header "Testing Summary"
print_status "All API calls completed. Check the responses above for:"
print_status "- XP increases after trades"
print_status "- Level progression"
print_status "- Milestone badge flags"
print_status "- Portfolio updates"

print_status "For detailed testing, run: python test_xp_system.py"
print_status "For manual checklist, see: manual_test_checklist.md" 