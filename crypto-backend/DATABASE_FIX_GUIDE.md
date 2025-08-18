# 🚨 Database Connectivity Fix Guide

## Current Issue
Your backend is deployed on Render but has database connectivity problems:
- Database health check failing
- Leaderboard endpoints returning 500 errors
- SQL queries failing with "Not an executable object" error

## 🔍 Root Cause Analysis

The main issues are:
1. **SQLAlchemy 2.x compatibility** - Fixed ✅
2. **Database connection configuration** - Needs verification
3. **Environment variables** - May not be set correctly on Render
4. **Database service accessibility** - May have network restrictions

## 🛠️ Step-by-Step Fix

### Step 1: Check Render Environment Variables

Go to your Render dashboard and verify these environment variables:

```bash
# Required for database connection
DATABASE_URL=postgresql://username:password@host:port/database

# Environment settings
ENVIRONMENT=production
RENDER=true

# Optional but recommended
DEBUG=false
LOG_LEVEL=INFO
```

### Step 2: Verify Database Service

**If using Render PostgreSQL:**
1. Go to your Render dashboard
2. Check if PostgreSQL service is running
3. Verify the connection string format
4. Check if external connections are allowed

**If using external PostgreSQL (AWS, DigitalOcean, etc.):**
1. Verify the database is running
2. Check firewall/security group settings
3. Ensure the database allows connections from Render's IP ranges
4. Verify username/password are correct

### Step 3: Test Database Connection

Use the new detailed health check endpoint:

```bash
curl https://motionfalcon-backend.onrender.com/health/db/detailed
```

This will show you:
- Connection test results
- Database type and version
- Environment variable status
- Detailed error messages

### Step 4: Common Database URL Formats

**Render PostgreSQL:**
```
postgresql://username:password@host.onrender.com:5432/database_name
```

**External PostgreSQL:**
```
postgresql://username:password@your-db-host.com:5432/database_name
```

**Local Development:**
```
sqlite:///./motionfalcon_local.db
```

### Step 5: Fix Environment Variables

In your Render dashboard:

1. **Go to your backend service**
2. **Click on "Environment" tab**
3. **Add/Update these variables:**

```bash
DATABASE_URL=your_actual_database_url_here
ENVIRONMENT=production
RENDER=true
```

4. **Redeploy the service** after changing environment variables

## 🔧 Database Service Setup

### Option 1: Use Render PostgreSQL (Recommended)

1. **Create a new PostgreSQL service** in Render
2. **Copy the connection string** from the service dashboard
3. **Set it as DATABASE_URL** in your backend service
4. **Wait for the database to be ready** (green status)

### Option 2: Use External PostgreSQL

1. **Ensure your database is accessible** from external connections
2. **Check firewall rules** allow connections from Render
3. **Verify connection string format** is correct
4. **Test connection** from your local machine first

## 🧪 Testing After Fix

### 1. Test Basic Health
```bash
curl https://motionfalcon-backend.onrender.com/health/db
```

**Expected response:**
```json
{
  "database": "healthy",
  "message": "Database connection successful",
  "details": {
    "status": "connected",
    "type": "postgresql",
    "version": "PostgreSQL version info"
  }
}
```

### 2. Test Leaderboard Endpoints
```bash
curl https://motionfalcon-backend.onrender.com/leaderboard/global
```

**Should return leaderboard data instead of 500 errors**

### 3. Test Trading Features
```bash
curl https://motionfalcon-backend.onrender.com/trade/supported-coins
curl https://motionfalcon-backend.onrender.com/trade/prices
```

**Should return cryptocurrency data**

## 🚨 Troubleshooting Common Issues

### Issue: "DATABASE_URL not set"
**Solution:** Set the DATABASE_URL environment variable in Render

### Issue: "Connection refused"
**Solution:** Check if database service is running and accessible

### Issue: "Authentication failed"
**Solution:** Verify username/password in connection string

### Issue: "Connection timeout"
**Solution:** Check network connectivity and firewall rules

### Issue: "Database does not exist"
**Solution:** Create the database or check the database name in URL

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Database service is running and accessible
- [ ] DATABASE_URL environment variable is set correctly
- [ ] Database user has proper permissions
- [ ] Firewall/security groups allow connections
- [ ] Database schema is migrated and up-to-date
- [ ] Environment variables are configured in Render

## 🔄 After Fixing Database

Once the database is connected:

1. **Run the comprehensive endpoint test:**
```bash
./comprehensive_endpoint_test.sh
```

2. **Test all trading features:**
```bash
./test_trading_wallet_endpoints.sh
```

3. **Verify leaderboard works:**
```bash
curl https://motionfalcon-backend.onrender.com/leaderboard/global
```

4. **Test user registration/login:**
```bash
curl -X POST https://motionfalcon-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'
```

## 📞 Getting Help

If you still have issues:

1. **Check Render logs** for detailed error messages
2. **Use the detailed health check** endpoint for diagnostics
3. **Verify database service status** in your provider's dashboard
4. **Test connection locally** to isolate the issue

## 🎯 Expected Results

After fixing the database:

- ✅ Database health check passes
- ✅ Leaderboard endpoints return data
- ✅ User registration/login works
- ✅ Trading features function properly
- ✅ Wallet operations work
- ✅ All 32 endpoints respond correctly

---

**Status**: 🟡 **Database connectivity issues detected**
**Priority**: 🔴 **High** - Fix database connection to enable full functionality
**Next Step**: Check Render environment variables and database service status
