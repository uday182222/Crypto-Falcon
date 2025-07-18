# 🚀 MotionFalcon Render Deployment Guide

This guide will walk you through deploying your MotionFalcon crypto trading platform to Render with full CI/CD automation.

## 📋 Prerequisites

- GitHub repository: https://github.com/uday182222/Crypto-Falcon
- Render account (free tier available)
- Razorpay account for payments

## 🎯 Quick Deploy with Blueprint

### Option 1: One-Click Deploy (Recommended)

1. **Click the Deploy to Render button:**
   ```
   https://render.com/deploy/schema/new?template=https://github.com/uday182222/Crypto-Falcon
   ```

2. **Connect your GitHub account** and authorize Render

3. **Configure your services:**
   - **Backend Service**: `motionfalcon-backend`
   - **Frontend Service**: `motionfalcon-frontend`
   - **Database**: `motionfalcon-db`

4. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://motionfalcon_user:password@host:port/motionfalcon
   SECRET_KEY=your-secret-key-here
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   ```

5. **Click Deploy** and wait for build completion

## 🔧 Manual Deployment Steps

### Step 1: Create Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. **Name**: `motionfalcon-db`
4. **Database**: `motionfalcon`
5. **User**: `motionfalcon_user`
6. **Plan**: Free (or Starter for production)
7. **Region**: Choose closest to your users
8. Click **"Create Database"**

### Step 2: Deploy Backend API

1. **New +** → **"Web Service"**
2. **Connect Repository**: Select your GitHub repo
3. **Name**: `motionfalcon-backend`
4. **Environment**: `Python 3`
5. **Region**: Same as database
6. **Branch**: `main`
7. **Root Directory**: `crypto-backend`
8. **Build Command**: 
   ```bash
   pip install -r requirements.txt && alembic upgrade head
   ```
9. **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Step 3: Configure Backend Environment Variables

Add these environment variables in the backend service:

```
DATABASE_URL=postgresql://motionfalcon_user:password@host:port/motionfalcon
SECRET_KEY=your-super-secret-key-here
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
ENVIRONMENT=production
```

### Step 4: Deploy Frontend

1. **New +** → **"Static Site"**
2. **Connect Repository**: Same GitHub repo
3. **Name**: `motionfalcon-frontend`
4. **Branch**: `main`
5. **Root Directory**: `crypto-frontend`
6. **Build Command**:
   ```bash
   npm install && npm run build
   ```
7. **Publish Directory**: `dist` ⭐ **This is your answer!**

### Step 5: Configure Frontend Environment Variables

Add this environment variable:

```
VITE_API_URL=https://motionfalcon-backend.onrender.com
```

## 🔄 CI/CD Pipeline Features

### What Happens on Every Push:

1. **✅ Automated Testing**
   - Backend API tests
   - Frontend build tests
   - Security vulnerability scans
   - Database migration tests

2. **🚀 Automatic Deployment**
   - Deploy to staging (if configured)
   - Run integration tests
   - Deploy to production if all tests pass

3. **🛡️ Security Checks**
   - Dependency vulnerability scanning
   - Code quality checks
   - Environment variable validation

4. **📊 Health Monitoring**
   - API endpoint health checks
   - Database connectivity tests
   - Performance monitoring

## 🌐 Custom Domain Setup

### Option 1: Render Subdomain
- Backend: `motionfalcon-backend.onrender.com`
- Frontend: `motionfalcon-frontend.onrender.com`

### Option 2: Custom Domain
1. **Add Custom Domain** in Render dashboard
2. **Configure DNS**:
   ```
   Type: CNAME
   Name: api
   Value: motionfalcon-backend.onrender.com
   
   Type: CNAME  
   Name: www
   Value: motionfalcon-frontend.onrender.com
   ```

## 🔧 Environment Variables Reference

### Backend Variables:
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-jwt-secret-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
ENVIRONMENT=production
```

### Frontend Variables:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

## 📱 Testing Your Deployment

### 1. Backend Health Check:
```bash
curl https://motionfalcon-backend.onrender.com/health
```

### 2. Frontend Access:
Visit: `https://motionfalcon-frontend.onrender.com`

### 3. API Endpoints:
```bash
# Test packages endpoint
curl https://motionfalcon-backend.onrender.com/purchases/packages

# Test authentication
curl -X POST https://motionfalcon-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Render dashboard
   - Verify all dependencies in requirements.txt
   - Ensure Python version compatibility

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database is running
   - Ensure migrations completed

3. **Frontend Not Loading**
   - Verify VITE_API_URL is correct
   - Check build output in dist folder
   - Ensure all environment variables set

4. **Payment Integration Issues**
   - Verify Razorpay keys are correct
   - Check webhook URLs in Razorpay dashboard
   - Test with test mode first

## 📈 Monitoring & Scaling

### Free Tier Limits:
- **Backend**: 750 hours/month
- **Database**: 90 days retention
- **Bandwidth**: 100GB/month

### Upgrade to Paid:
- **Starter Plan**: $7/month per service
- **Professional Plan**: $25/month per service
- **Custom Plans**: Contact Render sales

## 🎉 Success!

Your MotionFalcon crypto trading platform is now live with:
- ✅ Automated CI/CD pipeline
- ✅ Production-ready deployment
- ✅ Database persistence
- ✅ Payment integration
- ✅ Real-time crypto data
- ✅ Responsive frontend

**Live URLs:**
- Frontend: `https://motionfalcon-frontend.onrender.com`
- Backend API: `https://motionfalcon-backend.onrender.com`
- API Docs: `https://motionfalcon-backend.onrender.com/docs`

---

**Need Help?** Check the [Render Documentation](https://render.com/docs) or create an issue in your GitHub repository. 