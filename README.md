# MotionFalcon - Crypto Trading Simulation Platform

MotionFalcon is a comprehensive cryptocurrency trading simulation platform that allows users to practice trading with demo coins in a risk-free environment. The platform features real-time market data, portfolio management, leaderboards, achievements, and integrated payment processing.

## 🚀 Features

### Core Trading Features
- **Real-time Crypto Prices**: Live price data from CoinGecko API
- **Demo Trading**: Buy and sell cryptocurrencies with demo coins
- **Portfolio Management**: Track holdings, profits/losses, and performance
- **Multiple Cryptocurrencies**: Support for 20+ popular cryptocurrencies

### User Management
- **User Authentication**: Secure JWT-based authentication
- **User Profiles**: Personal trading statistics and preferences
- **Demo Wallet System**: Manage demo coin balance
- **Currency Preferences**: Support for multiple currencies (INR, USD, etc.)

### Payment Integration
- **Razorpay Integration**: Real payment processing for demo coin packages
- **Direct Top-up**: Simple rate-based top-up (₹100 = 5000 coins)
- **Coin Packages**: Various packages with bonus coins
- **Payment Verification**: Secure payment verification with webhooks

### Social Features
- **Global Leaderboard**: Rank users by portfolio performance
- **Weekly Leaderboard**: Weekly performance rankings
- **Achievement System**: Unlock achievements for trading milestones
- **Trading Statistics**: Comprehensive trading analytics

### Technical Features
- **Real-time Updates**: Live price updates and portfolio changes
- **Responsive Design**: Mobile-friendly React frontend
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Database Management**: PostgreSQL with Alembic migrations

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)
```
crypto-backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── auth.py              # JWT authentication
│   ├── db.py                # Database configuration
│   ├── models/              # SQLAlchemy models
│   ├── routes/              # API endpoints
│   ├── schemas/             # Pydantic schemas
│   └── services/            # Business logic services
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
└── venv/                   # Virtual environment
```

### Frontend (React + Vite)
```
crypto-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── services/           # API service functions
│   └── utils/              # Utility functions
├── package.json            # Node.js dependencies
└── vite.config.js          # Vite configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd motionfalcon
   ```

2. **Set up Python environment**
   ```bash
   cd crypto-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure database**
   ```bash
   # Create PostgreSQL database
   createdb crypto_db
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

5. **Seed initial data**
   ```bash
   python seed_packages.py
   ```

6. **Start the backend server**
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd crypto-frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `crypto-backend` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/crypto_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# API Keys
COINGECKO_API_KEY=your-coingecko-api-key
```

### Database Configuration

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and preferences
- `wallets` - User demo coin balances
- `trades` - Trading history
- `purchases` - Payment and package purchases
- `leaderboard_entries` - User rankings
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive API Docs**: http://127.0.0.1:8000/docs
- **ReDoc Documentation**: http://127.0.0.1:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

#### Trading
- `GET /trade/prices` - Get current crypto prices
- `POST /trade/buy` - Buy cryptocurrency
- `POST /trade/sell` - Sell cryptocurrency
- `GET /trade/portfolio` - Get user portfolio

#### Payments
- `GET /purchases/packages` - Get available coin packages
- `POST /purchases/create-order` - Create payment order
- `POST /purchases/verify-payment` - Verify payment
- `POST /purchases/create-direct-topup-order` - Create direct top-up order

#### Leaderboard
- `GET /leaderboard/global` - Global leaderboard
- `GET /leaderboard/weekly` - Weekly leaderboard
- `GET /leaderboard/my-rank` - User's rank

## 🎯 Usage

### Getting Started
1. Register a new account
2. Receive 100,000 demo coins as starting balance
3. Browse available cryptocurrencies
4. Start trading with real-time market data
5. Track your portfolio performance
6. Compete on leaderboards
7. Unlock achievements

### Trading
- View real-time prices for 20+ cryptocurrencies
- Place buy/sell orders with demo coins
- Track your portfolio value and performance
- View detailed trading history

### Payments
- Purchase demo coin packages with real money
- Use direct top-up for simple coin purchases
- Secure payment processing with Razorpay
- Automatic coin delivery after payment verification

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Payment signature verification
- SQL injection protection with SQLAlchemy
- CORS configuration
- Input validation with Pydantic

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy with Gunicorn or similar WSGI server

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure API endpoint URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the code comments for implementation details

## 🔄 Recent Updates

### Latest Features
- ✅ Direct top-up payment system
- ✅ Real-time price updates
- ✅ Comprehensive wallet management
- ✅ Achievement system
- ✅ Global and weekly leaderboards
- ✅ Payment verification with webhooks
- ✅ Database migration system
- ✅ Responsive frontend design

### Bug Fixes
- ✅ Fixed payment verification 500 errors
- ✅ Resolved database migration conflicts
- ✅ Fixed wallet table creation issues
- ✅ Improved error handling in payment processing 