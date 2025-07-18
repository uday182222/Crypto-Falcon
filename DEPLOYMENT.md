# MotionFalcon Deployment Guide

This guide provides step-by-step instructions for deploying MotionFalcon to production.

## 🚀 Quick Deployment Options

### Option 1: Deploy to GitHub Pages (Frontend) + Railway/Render (Backend)

#### Frontend Deployment (GitHub Pages)
1. **Build the frontend**:
   ```bash
   cd crypto-frontend
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   - Go to your GitHub repository
   - Navigate to Settings > Pages
   - Select source: "Deploy from a branch"
   - Choose branch: `main` and folder: `/crypto-frontend/dist`
   - Save and wait for deployment

#### Backend Deployment (Railway/Render)
1. **Deploy to Railway**:
   - Connect your GitHub repository to Railway
   - Set environment variables:
     ```
     DATABASE_URL=your_postgresql_url
     SECRET_KEY=your_secret_key
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```
   - Deploy the `crypto-backend` directory

2. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set build command: `cd crypto-backend && pip install -r requirements.txt`
   - Set start command: `cd crypto-backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables as above

### Option 2: Deploy to Vercel (Frontend) + Heroku (Backend)

#### Frontend Deployment (Vercel)
1. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set root directory to `crypto-frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy

#### Backend Deployment (Heroku)
1. **Deploy to Heroku**:
   ```bash
   # Install Heroku CLI
   brew install heroku/brew/heroku  # macOS
   
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create your-app-name
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Set environment variables
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set RAZORPAY_KEY_ID=your_razorpay_key
   heroku config:set RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   # Deploy
   git subtree push --prefix crypto-backend heroku main
   ```

## 🗄️ Database Setup

### PostgreSQL Setup
1. **Create database**:
   ```sql
   CREATE DATABASE crypto_db;
   CREATE USER crypto_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE crypto_db TO crypto_user;
   ```

2. **Run migrations**:
   ```bash
   cd crypto-backend
   alembic upgrade head
   ```

3. **Seed initial data**:
   ```bash
   python seed_packages.py
   ```

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Authentication
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay Payment
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Optional: CoinGecko API (for enhanced price data)
COINGECKO_API_KEY=your_coingecko_api_key
```

### Frontend Configuration
Update the API base URL in `crypto-frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

## 🌐 Domain and SSL Setup

### Custom Domain (Optional)
1. **Purchase domain** from domain registrar
2. **Configure DNS**:
   - Frontend: Point to GitHub Pages/Vercel
   - Backend: Point to Railway/Render/Heroku
3. **Enable SSL** (automatic with most platforms)

## 📊 Monitoring and Logs

### Backend Monitoring
- **Railway**: Built-in monitoring dashboard
- **Render**: Application logs and metrics
- **Heroku**: `heroku logs --tail`

### Frontend Monitoring
- **Vercel**: Analytics and performance monitoring
- **GitHub Pages**: Basic analytics

## 🔒 Security Checklist

- [ ] Environment variables are set and secure
- [ ] Database is properly configured with strong passwords
- [ ] CORS is configured for your frontend domain
- [ ] JWT secret key is strong and unique
- [ ] Razorpay webhook URL is configured
- [ ] SSL/HTTPS is enabled
- [ ] API rate limiting is configured (if needed)

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database is accessible from deployment platform

2. **CORS Errors**:
   - Update CORS origins in backend
   - Check frontend API URL configuration

3. **Payment Verification Failures**:
   - Verify Razorpay credentials
   - Check webhook URL configuration
   - Ensure payment signature verification is working

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for missing environment variables

### Debug Commands
```bash
# Check backend logs
heroku logs --tail  # Heroku
railway logs        # Railway
render logs         # Render

# Check database connection
heroku pg:psql      # Heroku
railway connect     # Railway

# Run migrations
heroku run alembic upgrade head
```

## 📈 Performance Optimization

### Backend Optimization
- Enable database connection pooling
- Implement caching for price data
- Use CDN for static assets
- Optimize database queries

### Frontend Optimization
- Enable code splitting
- Optimize bundle size
- Use lazy loading for components
- Implement service worker for caching

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Add your deployment commands here

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Add your deployment commands here
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Verify environment configuration
4. Test locally before deploying

## 🎯 Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure backup strategies
4. Plan for scaling as user base grows
5. Set up analytics and user tracking 