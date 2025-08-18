from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from enum import Enum

class TradeType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class TradeRequest(BaseModel):
    coin_symbol: str = Field(..., min_length=1, max_length=10, description="Cryptocurrency symbol (e.g., BTC, ETH)")
    trade_type: TradeType = Field(..., description="Trade type: buy or sell")
    quantity: Decimal = Field(..., gt=0, description="Amount of cryptocurrency to trade")

class TradeResponse(BaseModel):
    id: int
    user_id: int
    coin_symbol: str
    trade_type: TradeType
    quantity: Decimal
    price_at_trade: Decimal
    timestamp: datetime
    
    class Config:
        orm_mode = True

class TradeConfirmation(BaseModel):
    trade: TradeResponse
    new_balance: Decimal
    message: str

class PriceResponse(BaseModel):
    coin_symbol: str
    price_usd: Decimal
    price_change_24h: Optional[Decimal] = None
    price_change_percentage_24h: Optional[Decimal] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class PortfolioHolding(BaseModel):
    coin_symbol: str
    quantity: Decimal
    current_price: Decimal
    current_value: Decimal
    avg_buy_price: Decimal
    total_invested: Decimal
    profit_loss: Decimal
    profit_loss_percent: Decimal

class PortfolioResponse(BaseModel):
    wallet_balance: Decimal
    total_portfolio_value: Decimal
    total_invested: Decimal
    total_profit_loss: Decimal
    total_profit_loss_percent: Decimal
    holdings: list[PortfolioHolding] 