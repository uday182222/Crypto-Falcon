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
    side = Column(SQLEnum(TradeType), nullable=False)  # BUY or SELL
    quantity = Column(Numeric(20, 8), nullable=False)  # Amount of crypto
    price_at_trade = Column(Numeric(20, 8), nullable=False)  # Live price snapshot
    total_cost = Column(Numeric(20, 8), nullable=False)  # quantity × price_at_trade
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to user
    user = relationship("User", back_populates="trades")
    
    def __repr__(self):
        return f"<Trade(user_id={self.user_id}, coin={self.coin_symbol}, side={self.side}, quantity={self.quantity}, price={self.price_at_trade})>" 