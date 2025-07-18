from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, trade, leaderboard, achievement, purchase, currency, wallet

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(trade.router)
app.include_router(leaderboard.router)
app.include_router(achievement.router)
app.include_router(purchase.router)
app.include_router(currency.router)
app.include_router(wallet.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MotionFalcon Crypto Trading API"}
