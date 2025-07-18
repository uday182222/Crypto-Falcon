from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

class DemoCoinPackageResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    coins: float
    bonus_percentage: float = 0

    class Config:
        orm_mode = True

class PackageResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    coins_per_inr: float
    bonus_percentage: float = 0

    class Config:
        orm_mode = True

class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    package_id: int
    package_name: str
    amount: float
    coins_received: float
    status: str
    created_at: datetime
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None

    class Config:
        orm_mode = True

class PurchaseInitiateRequest(BaseModel):
    package_id: int

class DirectTopupRequest(BaseModel):
    amount_inr: float

class PurchaseInitiateResponse(BaseModel):
    order_id: str
    amount: int
    currency: str = "INR"
    package_name: str

class PurchaseVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PurchaseVerifyResponse(BaseModel):
    success: bool
    message: str
    purchase: Optional[PurchaseResponse] = None

class PurchaseHistoryItem(BaseModel):
    id: int
    package_name: str
    amount: float
    coins_received: float
    status: str
    created_at: datetime

class PurchaseHistoryResponse(BaseModel):
    purchases: List[PurchaseHistoryItem]
    total_purchases: int

class PurchaseStatsResponse(BaseModel):
    total_coins_purchased: float
    total_amount_spent: float
    total_successful_purchases: int

class OrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    package_name: str

class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str 