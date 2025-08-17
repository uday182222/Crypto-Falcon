# 🚀 MotionFalcon - Crypto Trading Platform

A modern, risk-free cryptocurrency trading simulation platform built with React and FastAPI.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Database**: PostgreSQL with Redis caching
- **Deployment**: Docker + Nginx

## 🚀 Quick Start

### Development
```bash
# Frontend
cd crypto-frontend
npm install
npm run dev

# Backend
cd crypto-backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Production Deployment
```bash
# Setup environment
cp env.production.template .env.production
nano .env.production

# Deploy
./deploy.sh
```

## 📁 Project Structure

```
motionfalcon/
├── crypto-frontend/          # React frontend application
├── crypto-backend/           # FastAPI backend application
├── docker-compose.prod.yml   # Production Docker setup
├── deploy.sh                 # Deployment script
├── env.production.template   # Environment variables template
└── README.md                 # This file
```

## 🔧 Features

- Real-time crypto trading simulation
- Risk-free learning environment
- Advanced portfolio management
- Achievement system
- Leaderboards and competitions
- Responsive design

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_CHECKLIST.md)
- [Production Setup](DEPLOYMENT_READY.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
