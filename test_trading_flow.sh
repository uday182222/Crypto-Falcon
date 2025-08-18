#!/bin/bash

# Complete Trading Flow Test
BASE_URL="https://motionfalcon-backend.onrender.com"
TIMESTAMP=$(date +%s)
TEST_USER="trader${TIMESTAMP}"
TEST_EMAIL="trader${TIMESTAMP}@example.com"
TEST_PASS="TradeTest123!"

echo "🎯 COMPLETE TRADING FLOW TEST"
echo "============================="
echo ""

echo "Step 1: Register New Trading User"
echo "---------------------------------"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")

if [[ "$REGISTER" == *"access_token"* ]]; then
    TOKEN=$(echo "$REGISTER" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    INITIAL_BALANCE=$(echo "$REGISTER" | grep -o '"demo_balance":[0-9.]*' | cut -d':' -f2)
    
    echo "✅ Registration successful!"
    echo "   • User: $TEST_USER (ID: $USER_ID)"
    echo "   • Initial Balance: $INITIAL_BALANCE DemoCoins"
    echo "   • Token: ${TOKEN:0:30}..."
else
    echo "❌ Registration failed!"
    echo "$REGISTER"
    exit 1
fi

echo ""
echo "Step 2: Check Initial Wallet Balance"
echo "-----------------------------------"
WALLET=$(curl -s "$BASE_URL/wallet/summary" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$WALLET" == *"balance"* ]]; then
    WALLET_BALANCE=$(echo "$WALLET" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "✅ Wallet balance: $WALLET_BALANCE DemoCoins"
else
    echo "❌ Wallet check failed!"
    echo "$WALLET"
fi

echo ""
echo "Step 3: Get Current BTC Price"
echo "----------------------------"
PRICES=$(curl -s "$BASE_URL/trade/prices")
if [[ "$PRICES" == *"BTC"* ]]; then
    BTC_PRICE=$(echo "$PRICES" | grep -A 20 '"symbol":"BTC"' | grep '"price":' | grep -o '[0-9.]*' | head -1)
    echo "✅ Current BTC price: \$${BTC_PRICE}"
else
    echo "❌ Price fetch failed!"
    exit 1
fi

echo ""
echo "Step 4: Attempt to Buy BTC (Correct Format)"
echo "-------------------------------------------"
BUY_RESPONSE=$(curl -s -X POST "$BASE_URL/trade/buy" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coin_symbol": "BTC", "trade_type": "buy", "quantity": 0.001}')

echo "Buy Response:"
echo "$BUY_RESPONSE" | jq '.' 2>/dev/null || echo "$BUY_RESPONSE"

if [[ "$BUY_RESPONSE" == *"success"* ]] || [[ "$BUY_RESPONSE" == *"trade"* ]]; then
    echo "✅ Trade executed successfully!"
else
    echo "❌ Trade failed!"
    echo "Response: $BUY_RESPONSE"
fi

echo ""
echo "Step 5: Check Portfolio After Trade"
echo "----------------------------------"
PORTFOLIO=$(curl -s "$BASE_URL/trade/portfolio" \
    -H "Authorization: Bearer $TOKEN")

echo "Portfolio Response:"
echo "$PORTFOLIO" | jq '.' 2>/dev/null || echo "$PORTFOLIO"

echo ""
echo "Step 6: Check Trade History"
echo "--------------------------"
HISTORY=$(curl -s "$BASE_URL/trade/history" \
    -H "Authorization: Bearer $TOKEN")

echo "Trade History:"
echo "$HISTORY" | jq '.' 2>/dev/null || echo "$HISTORY"

echo ""
echo "Step 7: Check Updated Wallet Balance"
echo "-----------------------------------"
WALLET_AFTER=$(curl -s "$BASE_URL/wallet/summary" \
    -H "Authorization: Bearer $TOKEN")

if [[ "$WALLET_AFTER" == *"balance"* ]]; then
    NEW_BALANCE=$(echo "$WALLET_AFTER" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo "✅ Updated wallet balance: $NEW_BALANCE DemoCoins"
    
    # Calculate change
    if command -v bc >/dev/null 2>&1; then
        CHANGE=$(echo "$WALLET_BALANCE - $NEW_BALANCE" | bc)
        echo "   • Amount spent: $CHANGE DemoCoins"
    fi
else
    echo "❌ Wallet check failed!"
fi

echo ""
echo "Step 8: Test Sell Functionality"
echo "-------------------------------"
SELL_RESPONSE=$(curl -s -X POST "$BASE_URL/trade/sell" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coin_symbol": "BTC", "trade_type": "sell", "quantity": 0.0005}')

echo "Sell Response:"
echo "$SELL_RESPONSE" | jq '.' 2>/dev/null || echo "$SELL_RESPONSE"

echo ""
echo "=============================="
echo "🎯 TRADING FLOW SUMMARY"
echo "=============================="
echo "User: $TEST_USER"
echo "Initial Balance: $INITIAL_BALANCE DemoCoins"
echo "Final Balance: $NEW_BALANCE DemoCoins"
echo ""
echo "If trading worked correctly:"
echo "- Balance should have decreased after buying"
echo "- Portfolio should show BTC holdings"
echo "- Trade history should show transactions"
echo ""
echo "✅ Test completed!"
