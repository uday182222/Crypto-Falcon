#!/bin/bash

echo "🚀 COMPREHENSIVE CRYPTO PLATFORM TEST SUITE"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    echo "Command: $command"
    
    # Run the command and capture output
    local output
    output=$(eval "$command" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ] && [[ "$output" =~ $expected_pattern ]]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Exit code: $exit_code"
        echo "Output: $output"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to run a test that should fail
run_test_should_fail() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}Testing: ${test_name} (should fail)${NC}"
    echo "Command: $command"
    
    # Run the command and capture output
    local output
    output=$(eval "$command" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -ne 0 ] && [[ "$output" =~ $expected_pattern ]]; then
        echo -e "${GREEN}✅ PASSED (failed as expected)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED (should have failed)${NC}"
        echo "Exit code: $exit_code"
        echo "Output: $output"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo "🔍 PHASE 1: BACKEND HEALTH CHECKS"
echo "----------------------------------"

# Test backend health
run_test "Backend Health Check" \
    "curl -s https://motionfalcon-backend.onrender.com/healthz" \
    '"ok":true'

# Test database health
run_test "Database Health Check" \
    "curl -s https://motionfalcon-backend.onrender.com/health/db" \
    '"database":"healthy"'

# Test enum values
run_test "Achievement Enum Values" \
    "curl -s https://motionfalcon-backend.onrender.com/debug/enum-values" \
    '"achievement_types":\["trading_milestone"'

echo "🔍 PHASE 2: ACHIEVEMENT SYSTEM"
echo "-------------------------------"

# Test achievement fix endpoint
run_test "Achievement Database Fix" \
    "curl -X POST https://motionfalcon-backend.onrender.com/debug/fix-achievements" \
    '"message":"Achievement enum fix completed"'

# Test achievements endpoint
run_test "Achievements List" \
    "curl -s https://motionfalcon-backend.onrender.com/achievements/" \
    '\[\]'

echo "🔍 PHASE 3: USER REGISTRATION & AUTH"
echo "-------------------------------------"

# Test user registration
echo -e "${BLUE}Testing: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "https://motionfalcon-backend.onrender.com/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser456", "email": "test456@example.com", "password": "testpass456"}')

if [[ "$REGISTER_RESPONSE" =~ "access_token" ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((TESTS_PASSED++))
    
    # Extract token for further tests
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "Token extracted: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $REGISTER_RESPONSE"
    ((TESTS_FAILED++))
fi
echo ""

# Test user login
echo -e "${BLUE}Testing: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "https://motionfalcon-backend.onrender.com/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test456@example.com", "password": "testpass456"}')

if [[ "$LOGIN_RESPONSE" =~ "access_token" ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((TESTS_PASSED++))
    
    # Extract token for further tests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "Token extracted: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $LOGIN_RESPONSE"
    ((TESTS_FAILED++))
fi
echo ""

echo "🔍 PHASE 4: ACHIEVEMENT INITIALIZATION"
echo "---------------------------------------"

# Test achievement initialization for user
if [ ! -z "$TOKEN" ]; then
    run_test "User Achievement Initialization" \
        "curl -X POST -H 'Authorization: Bearer $TOKEN' https://motionfalcon-backend.onrender.com/achievements/initialize" \
        '"message":"Achievements initialized successfully"'
    
    # Test getting user achievements
    run_test "Get User Achievements" \
        "curl -s -H 'Authorization: Bearer $TOKEN' https://motionfalcon-backend.onrender.com/achievements/user" \
        '"total_achievements":[0-9]+'
else
    echo -e "${YELLOW}⚠️  Skipping achievement tests - no valid token${NC}"
    echo ""
fi

echo "🔍 PHASE 5: TRADING SYSTEM"
echo "----------------------------"

    # Test portfolio endpoint
    if [ ! -z "$TOKEN" ]; then
        run_test "Get User Portfolio" \
            "curl -s -H 'Authorization: Bearer $TOKEN' https://motionfalcon-backend.onrender.com/trade/portfolio" \
            '"wallet_balance":[0-9]+'
    
    # Test wallet summary
    run_test "Get Wallet Summary" \
        "curl -s -H 'Authorization: Bearer $TOKEN' https://motionfalcon-backend.onrender.com/wallet/summary" \
        '"balance":[0-9]+'
else
    echo -e "${YELLOW}⚠️  Skipping trading tests - no valid token${NC}"
    echo ""
fi

echo "🔍 PHASE 6: FRONTEND CONNECTIVITY"
echo "----------------------------------"

# Test frontend is accessible
run_test "Frontend Accessibility" \
    "curl -s -I https://crypto-frontend-lffc.onrender.com/ | head -1" \
    "HTTP/2 200"

echo "📊 TEST SUMMARY"
echo "==============="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your crypto platform is fully operational!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
fi

echo ""
echo "🚀 NEXT STEPS:"
echo "1. If all tests passed, your platform is ready!"
echo "2. Test trading functionality from the frontend"
echo "3. Verify achievements are displayed correctly"
echo "4. Check that balance updates work properly"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "- If achievements still fail, wait for backend deployment"
echo "- If frontend shows errors, wait for frontend deployment"
echo "- Check Render logs for any deployment issues"
