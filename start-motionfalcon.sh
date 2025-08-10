#!/bin/bash

# MotionFalcon Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting MotionFalcon Crypto Trading Platform..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Check if Node.js is installed (for serving frontend)
if ! command_exists python3 -m http.server; then
    echo -e "${YELLOW}⚠️  Python http.server will be used for frontend serving${NC}"
fi

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
    cd crypto-backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install requirements
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}📝 Creating .env file...${NC}"
        cp env.example .env
        echo -e "${YELLOW}⚠️  Please update the .env file with your database configuration${NC}"
    fi
    
    # Start the backend server
    echo -e "${GREEN}🚀 Starting FastAPI backend on http://127.0.0.1:8000${NC}"
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
    cd crypto-frontend/dashboard/xhtml
    
    # Start Python HTTP server
    echo -e "${GREEN}🚀 Starting frontend server on http://127.0.0.1:8090${NC}"
    python3 -m http.server 8090 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../frontend.pid
}

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    
    # Kill backend if running
    if [ -f "crypto-backend/backend.pid" ]; then
        BACKEND_PID=$(cat crypto-backend/backend.pid)
        kill $BACKEND_PID 2>/dev/null
        rm crypto-backend/backend.pid
    fi
    
    # Kill frontend if running
    if [ -f "crypto-frontend/frontend.pid" ]; then
        FRONTEND_PID=$(cat crypto-frontend/frontend.pid)
        kill $FRONTEND_PID 2>/dev/null
        rm crypto-frontend/frontend.pid
    fi
    
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo -e "${GREEN}✅ MotionFalcon is now running!${NC}"
echo ""
echo -e "${BLUE}📊 Backend API:${NC} http://127.0.0.1:8000"
echo -e "${BLUE}🎨 Frontend Dashboard:${NC} http://127.0.0.1:8090"
echo -e "${BLUE}🔧 Backend Test:${NC} http://127.0.0.1:8090/test-backend.html"
echo -e "${BLUE}📚 API Documentation:${NC} http://127.0.0.1:8000/docs"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Use Ctrl+C to stop both servers"
echo -e "   • Check the backend logs for any errors"
echo -e "   • The frontend will automatically connect to the backend"
echo ""

# Wait for user to stop
echo -e "${YELLOW}⏳ Press Ctrl+C to stop the servers...${NC}"
wait 