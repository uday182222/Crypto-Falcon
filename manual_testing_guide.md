# MotionFalcon Backend Testing Guide

## 🚀 Current Status Summary

Your backend at [https://motionfalcon-backend.onrender.com](https://motionfalcon-backend.onrender.com) is **deployed and responding**, but has **database connectivity issues**.

## ✅ What's Working

- **Basic API connectivity** - All health endpoints responding
- **CORS configuration** - Frontend can communicate with backend
- **Currency services** - Exchange rates and supported currencies working
- **Database schema** - All tables are properly structured
- **Authentication endpoints** - Accessible and responding

## ❌ What's Not Working

- **Database queries** - SQL execution errors
- **Leaderboard calculations** - 500 Internal Server Errors
- **User data operations** - May fail due to DB issues

## 🔧 Manual Testing Commands

### 1. Test Basic Connectivity
```bash
# Test if backend is reachable
curl https://motionfalcon-backend.onrender.com/ping

# Check health status
curl https://motionfalcon-backend.onrender.com/health

# Test CORS
curl https://motionfalcon-backend.onrender.com/cors-test
```

### 2. Test Currency Features (Working)
```bash
# Get supported currencies
curl https://motionfalcon-backend.onrender.com/currency/supported

# Get exchange rates
curl https://motionfalcon-backend.onrender.com/currency/rates
```

### 3. Test Authentication (Requires Setup)
```bash
# First, create a test user
curl -X POST https://motionfalcon-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "testpass123"
  }'

# Then login to get a token
curl -X POST https://motionfalcon-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test123@example.com",
    "password": "testpass123"
  }'
```

### 4. Test Protected Endpoints (After Getting Token)
```bash
# Replace YOUR_TOKEN with the access_token from login
TOKEN="YOUR_TOKEN_HERE"

# Test wallet balance
curl -H "Authorization: Bearer $TOKEN" \
  https://motionfalcon-backend.onrender.com/wallet/balance

# Test portfolio
curl -H "Authorization: Bearer $TOKEN" \
  https://motionfalcon-backend.onrender.com/trade/portfolio

# Test achievements
curl -H "Authorization: Bearer $TOKEN" \
  https://motionfalcon-backend.onrender.com/achievement/user
```

## 🚨 Database Issues & Solutions

### Current Problem
```
Database connection failed: Not an executable object: 'SELECT 1'
```

### Possible Causes
1. **Database credentials** - Wrong username/password in production
2. **Database URL** - Incorrect connection string
3. **Database permissions** - User can't execute queries
4. **Network access** - Render can't reach your database
5. **Database service** - Database might be down or restricted

### Troubleshooting Steps

#### 1. Check Environment Variables
Verify these in your Render dashboard:
- `DATABASE_URL` or `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

#### 2. Test Database Connection
```bash
# Test if database is reachable from your local machine
# (This won't work if DB is only accessible from Render)

# Check if you can connect using the same credentials
psql "postgresql://username:password@host:port/database"
```

#### 3. Check Render Logs
- Go to your Render dashboard
- Check the backend service logs
- Look for database connection errors
- Check if the service is restarting

#### 4. Verify Database Service
- Ensure your database service is running
- Check if it's accessible from external connections
- Verify firewall/security group settings

## 🎯 Next Steps

### Immediate Actions
1. **Check Render environment variables** for database credentials
2. **Verify database service status** and accessibility
3. **Test database connection** from Render servers
4. **Check backend logs** for specific error details

### Once Database is Fixed
1. **Test leaderboard endpoints** - Should work after DB fix
2. **Test user registration/login** - Create real test users
3. **Test trading features** - Portfolio, trades, wallet
4. **Test achievement system** - User progress tracking

### Long-term Testing
1. **Load testing** - Multiple concurrent users
2. **Error handling** - Test edge cases and invalid inputs
3. **Performance testing** - Response times under load
4. **Security testing** - Authentication and authorization

## 📞 Getting Help

If you need assistance:
1. Check Render service logs for detailed error messages
2. Verify database connection string format
3. Test database connectivity from Render servers
4. Check if database service allows external connections

## 🔍 Quick Health Check

Run this to get a quick status:
```bash
curl -s https://motionfalcon-backend.onrender.com/health/db | jq '.'
```

**Expected response when fixed:**
```json
{
  "database": "healthy",
  "message": "Database connection successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

**Status**: 🟡 **Partially Working** - Backend deployed, database issues need fixing
**Priority**: 🔴 **High** - Fix database connection to enable full functionality
