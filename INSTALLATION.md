# MotionFalcon Installation Guide

This guide provides step-by-step instructions for installing and setting up MotionFalcon on your local machine or server.

## 🚀 Quick Start (Docker)

The fastest way to get MotionFalcon running is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/uday182222/Crypto-Falcon.git
cd Crypto-Falcon

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🛠️ Manual Installation

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/uday182222/Crypto-Falcon.git
cd Crypto-Falcon
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd crypto-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
createdb crypto_db

# Run database migrations
alembic upgrade head

# (Optional) Seed initial data
python seed_data.py
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd ../crypto-frontend

# Install dependencies
npm install

# Configure API URL
# Edit src/services/api.js and set API_URL to your backend URL
```

### Step 5: Start the Application

```bash
# Terminal 1: Start backend
cd crypto-backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd crypto-frontend
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `crypto-backend` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/crypto_db

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend Configuration

Edit `crypto-frontend/src/services/api.js`:

```javascript
const API_URL = 'http://localhost:8000';  // Your backend URL
```

## 🐳 Docker Installation

### Using Docker Compose

```bash
# Clone repository
git clone https://github.com/uday182222/Crypto-Falcon.git
cd Crypto-Falcon

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Containers

```bash
# Build backend image
cd crypto-backend
docker build -t motionfalcon-backend .

# Build frontend image
cd ../crypto-frontend
docker build -t motionfalcon-frontend .

# Run containers
docker run -d --name motionfalcon-backend -p 8000:8000 motionfalcon-backend
docker run -d --name motionfalcon-frontend -p 3000:3000 motionfalcon-frontend
```

## 🌐 Production Deployment

### Using Render (Recommended)

1. **Fork the repository** to your GitHub account
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Configure environment variables** in Render dashboard
4. **Deploy** the service

### Using Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-motionfalcon-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set RAZORPAY_KEY_ID=your-razorpay-key
heroku config:set RAZORPAY_KEY_SECRET=your-razorpay-secret

# Deploy
git push heroku main

# Run migrations
heroku run alembic upgrade head
```

### Using DigitalOcean App Platform

1. **Connect your repository** to DigitalOcean App Platform
2. **Configure the app**:
   - Build command: `pip install -r requirements.txt`
   - Run command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Add environment variables**
4. **Deploy**

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Create database if it doesn't exist
createdb crypto_db

# Check connection
psql -d crypto_db -c "SELECT version();"
```

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

#### Migration Errors
```bash
# Reset migrations (WARNING: This will delete all data)
alembic downgrade base
alembic upgrade head
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Logs and Debugging

```bash
# Backend logs
cd crypto-backend
tail -f logs/app.log

# Frontend logs
cd crypto-frontend
npm run dev

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📊 Health Checks

### Backend Health
```bash
curl http://localhost:8000/health
```

### Frontend Health
```bash
curl http://localhost:3000/health
```

### Database Health
```bash
psql -d crypto_db -c "SELECT 1;"
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use HTTPS** in production
3. **Set strong SECRET_KEY**
4. **Configure CORS** properly
5. **Enable rate limiting**
6. **Use environment variables** for sensitive data

## 📞 Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify configuration** in `.env` file
3. **Ensure all prerequisites** are installed
4. **Create an issue** on GitHub with detailed error information

## 🎯 Next Steps

After successful installation:

1. **Create your first account** at http://localhost:3000/register
2. **Explore the trading interface**
3. **Configure payment integration** (Razorpay)
4. **Set up email notifications**
5. **Customize the application** for your needs

---

**MotionFalcon** - Ready to trade! 🚀 