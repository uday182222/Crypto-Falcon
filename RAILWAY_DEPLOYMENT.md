# 🚂 Railway Deployment Guide for MotionFalcon

## Prerequisites
- [Railway account](https://railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Your MotionFalcon project ready

## 🚀 Quick Deployment Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
railway init
```

### 4. Deploy Backend
```bash
cd crypto-backend
railway up
```

### 5. Deploy Frontend
```bash
cd crypto-frontend
railway up
```

## 🔧 Detailed Setup

### Backend Service Setup

1. **Navigate to backend directory:**
   ```bash
   cd crypto-backend
   ```

2. **Create Railway service:**
   ```bash
   railway service create motionfalcon-backend
   ```

3. **Set environment variables:**
   ```bash
   railway variables set DATABASE_URL=your_postgres_url
   railway variables set SECRET_KEY=your_secret_key
   railway variables set RAZORPAY_KEY_ID=your_razorpay_key
   railway variables set RAZORPAY_KEY_SECRET=your_razorpay_secret
   railway variables set EMAIL_HOST=smtp.gmail.com
   railway variables set EMAIL_PORT=587
   railway variables set EMAIL_USER=your_email
   railway variables set EMAIL_PASSWORD=your_app_password
   railway variables set ENVIRONMENT=production
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Frontend Service Setup

1. **Navigate to frontend directory:**
   ```bash
   cd crypto-frontend
   ```

2. **Create Railway service:**
   ```bash
   railway service create motionfalcon-frontend
   ```

3. **Set environment variables:**
   ```bash
   railway variables set VITE_API_URL=https://your-backend-url.railway.app
   railway variables set VITE_APP_ENV=production
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL
1. Create a new PostgreSQL service in Railway
2. Copy the connection string
3. Set it as `DATABASE_URL` in your backend service

### Option 2: External Database
- Use any PostgreSQL provider (Supabase, Neon, etc.)
- Set the connection string in `DATABASE_URL`

## 🔗 Service Linking

1. **Link services to same project:**
   ```bash
   railway link
   ```

2. **Set up custom domains (optional):**
   ```bash
   railway domain
   ```

## 📱 Environment Variables Reference

### Backend Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: Email username
- `EMAIL_PASSWORD`: Email app password
- `ENVIRONMENT`: Set to "production"

### Frontend Required Variables
- `VITE_API_URL`: Backend API URL
- `VITE_APP_ENV`: Set to "production"

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check `requirements.txt` for all dependencies
   - Ensure Python version compatibility

2. **Database Connection Issues:**
   - Verify `DATABASE_URL` format
   - Check database accessibility

3. **Environment Variables:**
   - Use `railway variables` to list all variables
   - Ensure all required variables are set

### Useful Commands

```bash
# View logs
railway logs

# Check service status
railway status

# View variables
railway variables

# Connect to service shell
railway shell

# View service info
railway service
```

## 🌐 Post-Deployment

1. **Test your API endpoints**
2. **Verify frontend connectivity**
3. **Set up custom domains if needed**
4. **Monitor logs and performance**

## 📊 Monitoring

Railway provides:
- Real-time logs
- Performance metrics
- Automatic scaling
- Health checks

## 🔄 Continuous Deployment

Enable automatic deployments:
1. Connect your GitHub repository
2. Railway will auto-deploy on push to main branch
3. Set up preview deployments for pull requests

---

**Need Help?** Check [Railway Documentation](https://docs.railway.app/) or Railway Discord community.
