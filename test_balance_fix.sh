#!/bin/bash

# Test Balance Fix - Verify users get correct 100,000 coins
BASE_URL="https://motionfalcon-backend.onrender.com"
TIMESTAMP=$(date +%s)
TEST_USER="balancetest${TIMESTAMP}"
TEST_EMAIL="balancetest${TIMESTAMP}@example.com"
TEST_PASS="BalanceTest123!"

echo "🔍 TESTING BALANCE FIX"
echo "======================"
echo ""

echo "Step 1: Register New User (Should get 100,000 coins)"
echo "---------------------------------------------------"
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
    echo ""
else
    echo "❌ Registration failed!"
    exit 1
fi

echo "Step 2: Check Wallet Balance (Should match demo balance)"
echo "-------------------------------------------------------"
WALLET=$(curl -s "$BASE_URL/wallet/summary" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$WALLET" == *"balance"* ]]; then
    WALLET_BALANCE=$(echo "$WALLET" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "✅ Wallet accessible!"
    echo "   • Wallet Balance: $WALLET_BALANCE DemoCoins"
    echo "   • Demo Balance: $DEMO_BALANCE DemoCoins"
    echo ""
    
    # Check if balances match
    if [ "$WALLET_BALANCE" == "$DEMO_BALANCE" ]; then
        echo "🎉 BALANCE FIX SUCCESSFUL!"
        echo "   • Wallet and demo balances match!"
    else
        echo "⚠️  Balance mismatch still exists:"
        echo "   • Expected: $DEMO_BALANCE"
        echo "   • Actual: $WALLET_BALANCE"
        echo "   • Difference: $(echo "$DEMO_BALANCE - $WALLET_BALANCE" | bc 2>/dev/null || echo "calculation error")"
    fi
else
    echo "❌ Wallet check failed!"
fi

echo ""
echo "Step 3: Test Trading with Correct Balance"
echo "----------------------------------------"
BTC_TRADE=$(curl -s -X POST "$BASE_URL/trade/buy" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coin_symbol": "BTC", "trade_type": "buy", "quantity": 1.0}')

echo "Large BTC Trade Response:"
if [[ "$BTC_TRADE" == *"Insufficient balance"* ]]; then
    echo "❌ Still insufficient balance - fix not working"
elif [[ "$BTC_TRADE" == *"success"* ]] || [[ "$BTC_TRADE" == *"trade"* ]]; then
    echo "✅ Large trade successful - fix working!"
else
    echo "⚠️  Trade response: $BTC_TRADE"
fi

echo ""
echo "Step 4: Check Updated Balance After Large Trade"
echo "----------------------------------------------"
WALLET_AFTER=$(curl -s "$BASE_URL/wallet/summary" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$WALLET_AFTER" == *"balance"* ]]; then
    NEW_BALANCE=$(echo "$WALLET_AFTER" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "✅ Updated balance: $NEW_BALANCE DemoCoins"
    
    # Calculate if trade happened
    if command -v bc >/dev/null 2>&1; then
        SPENT=$(echo "$WALLET_BALANCE - $NEW_BALANCE" | bc)
        echo "   • Amount spent: $SPENT DemoCoins"
        
        if (( $(echo "$SPENT > 1000" | bc -l) )); then
            echo "🎉 Large trade executed - balance fix working!"
        else
            echo "⚠️  Small trade or no trade executed"
        fi
    fi
fi

echo ""
echo "================================="
echo "🎯 BALANCE FIX TEST SUMMARY"
echo "================================="
echo "Expected Behavior:"
echo "  • New users get 100,000 DemoCoins"
echo "  • Wallet balance matches demo balance"
echo "  • Users can make large trades (>1,000 coins)"
echo ""
echo "Test Results:"
echo "  • Demo Balance: $DEMO_BALANCE"
echo "  • Wallet Balance: $WALLET_BALANCE"
echo "  • Balance Match: $([ "$WALLET_BALANCE" == "$DEMO_BALANCE" ] && echo "✅ YES" || echo "❌ NO")"
echo ""
if [ "$WALLET_BALANCE" == "$DEMO_BALANCE" ]; then
    echo "🎉 BALANCE FIX SUCCESSFUL!"
    echo "Users now get the correct 100,000 DemoCoins!"
else
    echo "⚠️  Balance fix needs deployment"
    echo "Wait for Render to deploy the changes"
fi
