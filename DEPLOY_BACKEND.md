# 🚀 Backend & Database Deployment Guide

## 📋 Prerequisites
- Frontend already deployed on Render
- GitHub repository: https://github.com/uday182222/Crypto-Falcon

## 🗄️ Step 1: Create PostgreSQL Database

### In Render Dashboard:
1. **New +** → **"PostgreSQL"**
2. **Name**: `motionfalcon-db`
3. **Database**: `motionfalcon`
4. **User**: `motionfalcon_user`
5. **Plan**: Free (or Starter)
6. **Region**: Same as frontend
7. **Click "Create Database"**

### Save Database Info:
- **Internal Database URL**: `postgresql://motionfalcon_user:password@host:port/motionfalcon`
- **External Database URL**: (for local development)

## 🔧 Step 2: Deploy Backend API

### In Render Dashboard:
1. **New +** → **"Web Service"**
2. **Connect Repository**: `uday182222/Crypto-Falcon`
3. **Configure Service**:
   ```
   Name: motionfalcon-backend
   Environment: Python 3
   Region: Same as database
   Branch: main
   Root Directory: crypto-backend
   Build Command: pip install -r requirements.txt && alembic upgrade head
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

## ⚙️ Step 3: Environment Variables

### Add to Backend Service:
```
DATABASE_URL=postgresql://motionfalcon_user:password@host:port/motionfalcon
SECRET_KEY=your-super-secret-jwt-key-here
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
ENVIRONMENT=production
```

### How to Add:
1. **Go to backend service settings**
2. **Environment tab**
3. **Add each variable**

## 🔗 Step 4: Update Frontend API URL

### Update Frontend Environment Variable:
```
VITE_API_URL=https://motionfalcon-backend.onrender.com
```

## ✅ Step 5: Test Deployment

### Test Backend Health:
```bash
curl https://motionfalcon-backend.onrender.com/health
```

### Test API Endpoints:
```bash
# Test packages endpoint
curl https://motionfalcon-backend.onrender.com/purchases/packages

# Test registration
curl -X POST https://motionfalcon-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'
```

## 🎯 Expected URLs:
- **Frontend**: `https://motionfalcon-frontend.onrender.com`
- **Backend**: `https://motionfalcon-backend.onrender.com`
- **API Docs**: `https://motionfalcon-backend.onrender.com/docs`

## 🚨 Troubleshooting:

### Database Connection Issues:
- Verify DATABASE_URL format
- Check database is running
- Ensure migrations completed

### Build Issues:
- Check Python version compatibility
- Verify all dependencies in requirements.txt
- Check build logs for errors

### Environment Variables:
- Ensure all variables are set
- Check for typos in variable names
- Verify Razorpay keys are correct

## 🎉 Success Checklist:
- [ ] Database created and running
- [ ] Backend service deployed
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API endpoints responding
- [ ] Frontend connected to backend
- [ ] Payment integration working

---

**Need Help?** Check Render logs or create an issue in your GitHub repository. 