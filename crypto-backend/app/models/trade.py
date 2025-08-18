from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class TradeType(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coin_symbol = Column(String(10), nullable=False)  # e.g., "BTC", "ETH"
    trade_type = Column(SQLEnum(TradeType), nullable=False)  # BUY or SELL (matches DB column name)
    quantity = Column(Numeric(20, 8), nullable=False)  # Amount of crypto
    price_at_trade = Column(Numeric(20, 8), nullable=False)  # Live price snapshot
    total_cost = Column(Numeric(20, 8), nullable=False)  # quantity × price (required by DB)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to user
    user = relationship("User", back_populates="trades")
    
    def __repr__(self):
        return f"<Trade(user_id={self.user_id}, coin={self.coin_symbol}, trade_type={self.trade_type}, quantity={self.quantity}, price={self.price_at_trade})>" 