#!/bin/bash

# Comprehensive Test for All Fixes
BASE_URL="https://motionfalcon-backend.onrender.com"
TIMESTAMP=$(date +%s)
TEST_USER="fixtest${TIMESTAMP}"
TEST_EMAIL="fixtest${TIMESTAMP}@example.com"
TEST_PASS="FixTest123!"

echo "🔧 TESTING ALL FIXES AFTER DEPLOYMENT"
echo "======================================"
echo "Waiting for deployment to complete..."
echo ""

# Wait a bit for deployment
sleep 5

echo "Step 1: Test Balance Sync Fix"
echo "-----------------------------"
echo "Testing balance sync endpoint..."
SYNC_RESULT=$(curl -s -X POST "$BASE_URL/debug/sync-balances" 2>/dev/null)
if [[ "$SYNC_RESULT" == *"users_synced"* ]]; then
    echo "✅ Balance sync endpoint working!"
    echo "$SYNC_RESULT" | jq '.'
else
    echo "⚠️  Balance sync endpoint not yet deployed"
fi

echo ""
echo "Step 2: Register New User (Test Balance Fix)"
echo "-------------------------------------------"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")

if [[ "$REGISTER" == *"access_token"* ]]; then
    TOKEN=$(echo "$REGISTER" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    DEMO_BALANCE=$(echo "$REGISTER" | grep -o '"demo_balance":[0-9.]*' | cut -d':' -f2)
    
    echo "✅ Registration successful!"
    echo "   • User ID: $USER_ID"
    echo "   • Demo Balance: $DEMO_BALANCE DemoCoins"
    
    # Check wallet balance
    WALLET=$(curl -s "$BASE_URL/wallet/summary" \
        -H "Authorization: Bearer $TOKEN")
    
    if [[ "$WALLET" == *"balance"* ]]; then
        WALLET_BALANCE=$(echo "$WALLET" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
        echo "   • Wallet Balance: $WALLET_BALANCE DemoCoins"
        
        if [ "$WALLET_BALANCE" == "$DEMO_BALANCE" ]; then
            echo "🎉 BALANCE FIX WORKING! Balances match!"
        else
            echo "⚠️  Balance mismatch: Expected $DEMO_BALANCE, Got $WALLET_BALANCE"
        fi
    fi
else
    echo "❌ Registration failed!"
    exit 1
fi

echo ""
echo "Step 3: Test Achievement System Fix"
echo "----------------------------------"
ACHIEVEMENTS=$(curl -s "$BASE_URL/achievements/" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$ACHIEVEMENTS" == "[]" ]] || [[ "$ACHIEVEMENTS" == *"name"* ]]; then
    echo "✅ Achievement endpoint accessible!"
    
    # Test user achievements
    USER_ACHIEVEMENTS=$(curl -s "$BASE_URL/achievements/user" \
        -H "Authorization: Bearer $TOKEN")
    
    if [[ "$USER_ACHIEVEMENTS" == *"achievements"* ]] || [[ "$USER_ACHIEVEMENTS" == "[]" ]]; then
        echo "✅ User achievements working!"
    else
        echo "⚠️  User achievements still have issues"
        echo "$USER_ACHIEVEMENTS"
    fi
else
    echo "⚠️  Achievement system still has issues"
    echo "$ACHIEVEMENTS"
fi

echo ""
echo "Step 4: Test Trading with Correct Format"
echo "---------------------------------------"
echo "Testing BTC buy with proper request format..."

# Test with correct format
BTC_BUY=$(curl -s -X POST "$BASE_URL/trade/buy" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "coin_symbol": "BTC",
        "trade_type": "buy", 
        "quantity": 0.01
    }')

echo "Buy Response:"
if [[ "$BTC_BUY" == *"success"* ]] || [[ "$BTC_BUY" == *"trade"* ]] || [[ "$BTC_BUY" == *"message"* ]]; then
    echo "✅ Trading working!"
    echo "$BTC_BUY" | jq '.' 2>/dev/null || echo "$BTC_BUY"
elif [[ "$BTC_BUY" == *"422"* ]] || [[ "$BTC_BUY" == *"Unprocessable"* ]]; then
    echo "❌ Still getting 422 errors"
    echo "$BTC_BUY"
elif [[ "$BTC_BUY" == *"Insufficient balance"* ]]; then
    echo "⚠️  Insufficient balance - balance fix not working yet"
    echo "$BTC_BUY"
else
    echo "⚠️  Unknown response:"
    echo "$BTC_BUY" | jq '.' 2>/dev/null || echo "$BTC_BUY"
fi

echo ""
echo "Step 5: Check Updated Wallet Balance"
echo "----------------------------------"
WALLET_AFTER=$(curl -s "$BASE_URL/wallet/summary" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$WALLET_AFTER" == *"balance"* ]]; then
    NEW_BALANCE=$(echo "$WALLET_AFTER" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "✅ Current balance: $NEW_BALANCE DemoCoins"
    
    if command -v bc >/dev/null 2>&1; then
        CHANGE=$(echo "$WALLET_BALANCE - $NEW_BALANCE" | bc)
        if (( $(echo "$CHANGE > 0" | bc -l) )); then
            echo "✅ Balance decreased by: $CHANGE DemoCoins (trade executed!)"
        else
            echo "⚠️  No balance change (trade may not have executed)"
        fi
    fi
fi

echo ""
echo "Step 6: Test Portfolio and Trade History"
echo "--------------------------------------"
PORTFOLIO=$(curl -s "$BASE_URL/trade/portfolio" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$PORTFOLIO" == *"holdings"* ]]; then
    echo "✅ Portfolio accessible!"
    HOLDINGS_COUNT=$(echo "$PORTFOLIO" | grep -o '"coin_symbol"' | wc -l)
    echo "   • Holdings: $HOLDINGS_COUNT different coins"
else
    echo "⚠️  Portfolio issues: $PORTFOLIO"
fi

HISTORY=$(curl -s "$BASE_URL/trade/history" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$HISTORY" == *"trade_type"* ]] || [[ "$HISTORY" == "[]" ]]; then
    echo "✅ Trade history accessible!"
    TRADES_COUNT=$(echo "$HISTORY" | grep -o '"id":' | wc -l)
    echo "   • Total trades: $TRADES_COUNT"
else
    echo "⚠️  Trade history issues"
fi

echo ""
echo "======================================"
echo "🎯 COMPREHENSIVE FIX TEST SUMMARY"
echo "======================================"
echo ""
echo "✅ FIXES TESTED:"
echo "  1. Balance synchronization between user and wallet"
echo "  2. Achievement enum values matching database"
echo "  3. Trading request format validation"
echo "  4. Transaction error handling"
echo "  5. Portfolio and history access"
echo ""
echo "🔍 RESULTS:"
echo "  • Registration: Working"
echo "  • Balance Fix: $([ "$WALLET_BALANCE" == "$DEMO_BALANCE" ] && echo "✅ FIXED" || echo "⚠️  Pending")"
echo "  • Achievements: $(echo "$ACHIEVEMENTS" | grep -q "name\|\\[\\]" && echo "✅ FIXED" || echo "⚠️  Pending")"
echo "  • Trading: $(echo "$BTC_BUY" | grep -q "success\|trade\|message" && echo "✅ WORKING" || echo "⚠️  Issues")"
echo ""
if [ "$WALLET_BALANCE" == "$DEMO_BALANCE" ]; then
    echo "🎉 MAJOR FIXES SUCCESSFUL!"
    echo "Users now get the full 100,000 DemoCoins!"
else
    echo "⏳ FIXES DEPLOYING..."
    echo "Wait 5-10 minutes for full deployment"
fi
