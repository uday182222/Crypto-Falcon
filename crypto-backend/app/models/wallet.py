from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Numeric(20, 8), default=100000.0, nullable=False)  # $100,000 default
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to user
    user = relationship("User", back_populates="wallet")
    
    def __repr__(self):
        return f"<Wallet(user_id={self.user_id}, balance={self.balance})>" 