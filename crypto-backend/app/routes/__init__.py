from .auth import router as auth_router
from .trade import router as trade_router
from .leaderboard import router as leaderboard_router
from .purchase import router as purchase_router
from .achievement import router as achievement_router
from .wallet import router as wallet_router

__all__ = ["auth_router", "trade_router", "leaderboard_router", "purchase_router", "achievement_router", "wallet_router"] 