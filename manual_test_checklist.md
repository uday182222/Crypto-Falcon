# 🧪 Manual XP/Level System Testing Checklist

## 📋 Prerequisites
- [ ] Backend server running on `http://localhost:8000`
- [ ] Database connected and accessible
- [ ] Test user account created (username: `testuser`, password: `testpass`)
- [ ] Frontend running and accessible

## 🔐 Step 1: Authentication & Login XP Test

### 1.1 Login and Get Token
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "level": 1,
    "xp": 10,
    "xp_first_gain_awarded": false,
    "xp_lost_all_awarded": false,
    "xp_best_rank": null
  }
}
```

### 1.2 Check Profile After Login
```bash
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**✅ Checklist:**
- [ ] User gets +10 XP for login
- [ ] Level increases if XP threshold is crossed
- [ ] XP bar updates in frontend Settings page

---

## 💰 Step 2: Trading XP Test

### 2.1 Make a Buy Trade
```bash
curl -X POST http://localhost:8000/trade/buy \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"currency": "BTC", "amount": 10.0}'
```

### 2.2 Make a Sell Trade
```bash
curl -X POST http://localhost:8000/trade/sell \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"currency": "BTC", "amount": 5.0}'
```

### 2.3 Check Profile After Trading
```bash
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**✅ Checklist:**
- [ ] Each trade gives +25 XP
- [ ] Level increases if XP threshold is crossed
- [ ] XP bar updates in frontend
- [ ] Trade history shows in portfolio

---

## 🏆 Step 3: First Gain Milestone Test

### 3.1 Check Current Portfolio
```bash
curl -X GET http://localhost:8000/trade/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3.2 Make Profitable Trades (if needed)
- Make trades that result in profit
- Check if `xp_first_gain_awarded` becomes `true`
- Verify +50 XP is awarded

### 3.3 Check Profile for Badge
```bash
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**✅ Checklist:**
- [ ] First profitable trade triggers milestone
- [ ] User gets +50 XP
- [ ] `xp_first_gain_awarded` becomes `true`
- [ ] "First Gain 🥇" badge appears in frontend
- [ ] Milestone is NOT triggered again on subsequent gains

---

## 💸 Step 4: Lost All Demo Money Milestone Test

### 4.1 Check Current Balance
```bash
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4.2 Trade Until Zero Balance (if needed)
- Make trades that deplete demo balance to ₹0 or below
- Check if `xp_lost_all_awarded` becomes `true`
- Verify +20 XP is awarded

**✅ Checklist:**
- [ ] Zero balance triggers milestone
- [ ] User gets +20 XP
- [ ] `xp_lost_all_awarded` becomes `true`
- [ ] "Comeback 💪" badge appears in frontend
- [ ] Milestone is NOT triggered again

---

## 🏅 Step 5: Leaderboard Rank Milestone Test

### 5.1 Check Current Rank
```bash
curl -X GET http://localhost:8000/leaderboard/my-rank \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.2 Check Leaderboard
```bash
curl -X GET http://localhost:8000/leaderboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.3 Improve Rank (if possible)
- Make profitable trades to improve portfolio value
- Check if rank improves and triggers milestone

**✅ Checklist:**
- [ ] New best rank triggers milestone
- [ ] User gets +100 XP
- [ ] `xp_best_rank` updates to new best rank
- [ ] "Leaderboard #[rank]" badge appears in frontend
- [ ] Milestone is NOT triggered for same or worse rank

---

## 🔄 Step 6: Milestone Duplication Test

### 6.1 Try to Trigger Milestones Again
- Login again (should only get login XP, not milestone XP)
- Check portfolio again (should not trigger first gain again)
- Check rank again (should not trigger leaderboard milestone again)

**✅ Checklist:**
- [ ] No duplicate milestone XP awarded
- [ ] Milestone flags remain `true`
- [ ] Only action-based XP (login, trades) is awarded

---

## 📊 Step 7: Level Progression Test

### 7.1 Calculate XP Thresholds
```python
def xp_needed(level):
    return 100 + (level - 1) * 50

# Level 1: 100 XP needed
# Level 2: 150 XP needed  
# Level 3: 200 XP needed
# etc.
```

### 7.2 Make Multiple Trades
- Make enough trades to cross level thresholds
- Verify level increases correctly
- Check XP rolls over properly

**✅ Checklist:**
- [ ] Level increases when XP threshold is crossed
- [ ] XP resets to remainder after level up
- [ ] Multiple level ups work correctly
- [ ] XP bar shows correct progress

---

## 🎨 Step 8: Frontend UI Test

### 8.1 Settings Page
- [ ] Level display shows current level
- [ ] XP progress bar updates correctly
- [ ] XP text shows "current/total XP to next level"
- [ ] Progress bar has smooth animations

### 8.2 Badge Display
- [ ] "First Gain 🥇" badge appears when milestone achieved
- [ ] "Comeback 💪" badge appears when milestone achieved
- [ ] "Leaderboard #[rank]" badge appears when milestone achieved
- [ ] Badges have proper styling and colors

### 8.3 Real-time Updates
- [ ] XP bar updates immediately after actions
- [ ] Level increases with animation
- [ ] Badges appear when milestones are triggered

---

## 🐛 Step 9: Edge Cases & Error Handling

### 9.1 Database Connection Issues
- [ ] App handles database disconnection gracefully
- [ ] XP logic doesn't break on connection issues

### 9.2 Invalid Data
- [ ] Negative XP values are handled
- [ ] Invalid level values are handled
- [ ] Missing milestone flags are handled

### 9.3 Concurrent Actions
- [ ] Multiple rapid trades don't cause XP duplication
- [ ] Simultaneous milestone checks don't cause issues

---

## 📝 Step 10: Documentation & Logging

### 10.1 Check Logs
- [ ] XP gains are logged properly
- [ ] Level ups are logged
- [ ] Milestone triggers are logged

### 10.2 Database Verification
```sql
-- Check user XP data
SELECT id, username, level, xp, 
       xp_first_gain_awarded, xp_lost_all_awarded, xp_best_rank
FROM users 
WHERE username = 'testuser';

-- Check XP distribution
SELECT level, COUNT(*) as users
FROM users 
GROUP BY level 
ORDER BY level;
```

---

## 🎯 Test Completion Checklist

- [ ] All XP sources working (login, trades, milestones)
- [ ] Level progression working correctly
- [ ] Milestones trigger only once
- [ ] Frontend displays all XP/level data correctly
- [ ] No duplicate XP or badges awarded
- [ ] Edge cases handled properly
- [ ] Database data is consistent
- [ ] Performance is acceptable

---

## 🚨 Common Issues & Solutions

### Issue: XP not increasing
**Solution:** Check if user is authenticated, verify API endpoints are working

### Issue: Milestones not triggering
**Solution:** Check milestone logic in backend, verify conditions are met

### Issue: Frontend not updating
**Solution:** Check API responses, verify React state updates

### Issue: Database errors
**Solution:** Check migration status, verify column types and constraints

---

## 📞 Support Commands

### Check Migration Status
```bash
cd crypto-backend
source venv/bin/activate
alembic current
alembic history
```

### Check Database Schema
```sql
\d users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'xp%';
```

### Restart Services
```bash
# Backend
cd crypto-backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend  
cd crypto-frontend
npm run dev
``` 