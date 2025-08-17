#!/bin/bash

# MotionFalcon Project Cleanup Script
echo "🧹 Starting MotionFalcon Project Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗑️  Removing unnecessary files and directories...${NC}"

# Remove old documentation files that are no longer needed
echo -e "${YELLOW}📚 Removing old documentation files...${NC}"
rm -f INTEGRATION_SUMMARY.md
rm -f PRODUCTION_DASHBOARD_SUMMARY.md
rm -f DASHBOARD_LIGHT_INTEGRATION.md
rm -f DEPLOYMENT_FIX_SUMMARY.md
rm -f DEPLOYMENT_SUCCESS.md
rm -f XP_SYSTEM_SUMMARY.md
rm -f PRODUCTION_DEPLOYMENT_CHECKLIST.md
rm -f PACKAGE_SUMMARY.md
rm -f TESTING_README.md
rm -f manual_test_checklist.md

# Remove test files that are not needed for production
echo -e "${YELLOW}🧪 Removing test files...${NC}"
rm -f test_xp_calculation.js
rm -f test_xp_frontend_update.py
rm -f test_xp_system.py
rm -f xp_test_results.json
rm -f setup_testing.py
rm -f quick_test.sh

# Remove old HTML files that are not part of the React app
echo -e "${YELLOW}🌐 Removing old HTML files...${NC}"
rm -f index.html
rm -f yqRCvprlca2HEIUhFc404ozGNPI.avif

# Remove old package files that are not needed
echo -f "${YELLOW}📦 Removing old package files...${NC}"
rm -f package.json
rm -f package-lock.json

# Remove old scripts that are not needed
echo -e "${YELLOW}📜 Removing old scripts...${NC}"
rm -f start-motionfalcon.sh
rm -f status_dashboard.py
rm -f health_check.py

# Remove old app directory (not needed for the main application)
echo -e "${YELLOW}📁 Removing old app directory...${NC}"
rm -rf app/

# Remove old virtual environment
echo -e "${YELLOW}🐍 Removing old virtual environment...${NC}"
rm -rf .venv/

# Remove Python cache
echo -e "${YELLOW}🐍 Removing Python cache...${NC}"
rm -rf __pycache__/

# Remove old alembic config (not needed in root)
echo -e "${YELLOW}🗄️  Removing old alembic config...${NC}"
rm -f alembic.ini

# Remove old nginx config (not needed in root)
echo -e "${YELLOW}🌐 Removing old nginx config...${NC}"
rm -f nginx.conf

# Remove old docker-compose (keeping only production version)
echo -e "${YELLOW}🐳 Removing old docker-compose...${NC}"
rm -f docker-compose.yml

# Remove old deployment docs (keeping only the essential ones)
echo -e "${YELLOW}📋 Cleaning up deployment docs...${NC}"
rm -f DEPLOYMENT.md
rm -f DEPLOY_BACKEND.md
rm -f RENDER_DEPLOYMENT.md

# Remove old integration docs (keeping only the essential one)
echo -e "${YELLOW}🔗 Cleaning up integration docs...${NC}"
rm -f INTEGRATION_GUIDE.md

# Clean up crypto-frontend directory
echo -e "${YELLOW}🧹 Cleaning up crypto-frontend directory...${NC}"

# Remove old dashboard template files (not needed for React app)
echo -e "${YELLOW}📊 Removing old dashboard templates...${NC}"
rm -rf crypto-frontend/dashboard/
rm -rf crypto-frontend/frontend/

# Remove old integration guide
rm -f crypto-frontend/INTEGRATION_GUIDE.md

# Remove node_modules (will be rebuilt during deployment)
echo -e "${YELLOW}📦 Removing node_modules (will be rebuilt)...${NC}"
rm -rf crypto-frontend/node_modules/

# Remove dist directory (will be rebuilt during deployment)
echo -e "${YELLOW}📦 Removing dist directory (will be rebuilt)...${NC}"
rm -rf crypto-frontend/dist/

# Clean up crypto-backend directory
echo -e "${YELLOW}🧹 Cleaning up crypto-backend directory...${NC}"

# Remove old backend.pid if exists
rm -f crypto-backend/backend.pid

# Remove old SQL files that are not needed
rm -f crypto-backend/create_purchases_table.sql

# Remove old virtual environment
rm -rf crypto-backend/venv/

# Create a clean project structure
echo -e "${YELLOW}📁 Creating clean project structure...${NC}"

# Create essential directories
mkdir -p logs/nginx
mkdir -p ssl

# Create a new clean README
echo -e "${YELLOW}📝 Creating clean README...${NC}"
cat > README.md << 'EOF'
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
EOF

echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo -e "${GREEN}📁 Project structure has been cleaned and organized${NC}"
echo -e "${GREEN}🚀 Ready for production deployment!${NC}"

# Show final project structure
echo -e "${YELLOW}📋 Final project structure:${NC}"
tree -L 2 -I 'node_modules|__pycache__|.git|.venv|venv|dist'
