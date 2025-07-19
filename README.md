# MotionFalcon - Crypto Trading Simulation Platform

A full-stack cryptocurrency trading simulation platform built with React frontend and FastAPI backend, featuring real-time price data, portfolio management, achievements, and leaderboards.

## 🚀 Features

### Core Trading Features
- **Real-time Crypto Prices**: Live price data from CoinGecko API
- **Portfolio Management**: Track holdings, P&L, and performance
- **Buy/Sell Operations**: Simulate crypto trading with demo balance
- **Trade History**: Complete transaction history and analytics

### User Experience
- **User Authentication**: Secure login/register with JWT tokens
- **Password Reset**: Email-based password recovery system
- **Demo Balance**: Start with $100,000 demo balance
- **Multiple Cryptocurrencies**: Support for BTC, ETH, ADA, DOT, and more

### Gamification
- **Achievement System**: Unlock achievements for trading milestones
- **Leaderboards**: Global and weekly rankings
- **Login Streaks**: Track consecutive login days
- **Progress Tracking**: Visual progress bars for achievements

### Payment Integration
- **Razorpay Integration**: Real money purchases for demo coins
- **Package System**: Multiple coin packages with bonuses
- **Payment Verification**: Secure payment processing

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** with modern hooks and context
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Responsive Design** for mobile and desktop

### Backend (FastAPI + PostgreSQL)
- **FastAPI** for high-performance API
- **PostgreSQL** with SQLAlchemy ORM
- **Alembic** for database migrations
- **JWT Authentication** with bcrypt password hashing
- **Redis** for caching (optional)

### External APIs
- **CoinGecko API**: Real-time cryptocurrency prices
- **Razorpay**: Payment processing
- **TradingView**: Chart integration

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/uday182222/Crypto-Falcon.git
   cd Crypto-Falcon/crypto-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

5. **Database Setup**
   ```bash
   # Set DATABASE_URL in .env
   alembic upgrade head
   ```

6. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../crypto-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   ```bash
   # Edit src/services/api.js to point to your backend
   const API_URL = 'http://localhost:8000';
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Render Deployment (Recommended)

The app is configured for easy deployment on Render:

1. **Backend Service**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically on push

2. **Frontend Service**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment: Node.js

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Frontend
```javascript
// src/services/api.js
const API_URL = 'https://your-backend-url.onrender.com';
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /auth/profile` - Get current user

### Trading
- `GET /trade/prices` - Get all crypto prices
- `GET /trade/price/{coin}` - Get specific coin price
- `POST /trade/buy` - Buy cryptocurrency
- `POST /trade/sell` - Sell cryptocurrency
- `GET /trade/portfolio` - Get user portfolio
- `GET /trade/history` - Get trade history

### Achievements
- `GET /achievements/user` - Get user achievements
- `GET /achievements/stats` - Get achievement statistics

### Leaderboard
- `GET /leaderboard/global` - Global leaderboard
- `GET /leaderboard/weekly` - Weekly leaderboard

### Payments
- `POST /purchases/create-order` - Create payment order
- `POST /purchases/verify-payment` - Verify payment

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **wallets**: User demo balance management
- **trades**: All trading transactions
- **achievements**: Available achievements
- **user_achievements**: User achievement progress
- **user_login_streaks**: Login streak tracking
- **leaderboard_entries**: Leaderboard rankings
- **purchases**: Payment transactions
- **demo_coin_packages**: Available coin packages

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd crypto-backend
pytest

# Frontend tests
cd crypto-frontend
npm test
```

### Database Migrations
```bash
cd crypto-backend
alembic revision -m "description"
alembic upgrade head
```

### Code Formatting
```bash
# Backend
black app/
isort app/

# Frontend
npm run format
```

## 🚀 Quick Start

1. **Clone and setup backend**
   ```bash
   git clone https://github.com/uday182222/Crypto-Falcon.git
   cd Crypto-Falcon/crypto-backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Setup database**
   ```bash
   # Configure DATABASE_URL in .env
   alembic upgrade head
   ```

3. **Start backend**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Setup frontend**
   ```bash
   cd ../crypto-frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@motionfalcon.com
- Documentation: https://docs.motionfalcon.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced charting with TradingView
- [ ] Social features and following
- [ ] Paper trading competitions
- [ ] Real-time notifications
- [ ] API rate limiting and caching
- [ ] Multi-language support
- [ ] Dark mode theme

---

**MotionFalcon** - Learn crypto trading in a safe, simulated environment! 🚀 