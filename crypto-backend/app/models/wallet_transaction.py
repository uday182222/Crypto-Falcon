from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False)  # 'topup', 'package', 'premium', 'withdrawal'
    amount = Column(Numeric(20, 2), nullable=False)  # Amount in USD
    currency = Column(String(10), default="USD")
    payment_id = Column(String(255), nullable=True)  # Razorpay payment ID
    order_id = Column(String(255), nullable=True)  # Razorpay order ID
    package_id = Column(String(100), nullable=True)  # Package ID if applicable
    description = Column(Text, nullable=True)  # Transaction description
    status = Column(String(50), default="completed")  # 'pending', 'completed', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="wallet_transactions")
