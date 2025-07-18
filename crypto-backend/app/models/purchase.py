from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class PurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DemoCoinPackage(Base):
    __tablename__ = "demo_coin_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)  # Price in INR
    coins_per_inr = Column(Numeric(10, 2), nullable=False)  # How many coins per INR
    bonus_percentage = Column(Numeric(5, 2), default=0)  # Bonus percentage
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to purchases
    purchases = relationship("Purchase", back_populates="package")

    def __repr__(self):
        return f"<DemoCoinPackage(name={self.name}, price={self.price}, coins_per_inr={self.coins_per_inr})>"

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("demo_coin_packages.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # Amount in INR
    coins_received = Column(Numeric(20, 8), nullable=True)  # Total coins received including bonus
    status = Column(String(20), nullable=False, default="pending")  # pending, completed, failed
    razorpay_order_id = Column(String(100), nullable=False, unique=True)
    razorpay_payment_id = Column(String(100), nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="purchases")
    package = relationship("DemoCoinPackage", back_populates="purchases")

    def __repr__(self):
        return f"<Purchase(user_id={self.user_id}, amount={self.amount}, status={self.status})>" 