from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional

class WalletResponse(BaseModel):
    """Response model for wallet data"""
    id: int
    user_id: int
    balance: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class WalletUpdateRequest(BaseModel):
    """Request model for updating wallet balance"""
    amount: Decimal = Field(..., description="Amount to add/subtract from balance")
    operation: str = Field(..., description="Operation: 'add' or 'subtract'")
    reason: Optional[str] = Field(None, description="Reason for balance change")

class WalletTopUpRequest(BaseModel):
    """Request model for topping up wallet"""
    amount: Decimal = Field(..., gt=0, description="Amount to add to wallet")
    payment_method: Optional[str] = Field("demo", description="Payment method used")

class WalletTransactionResponse(BaseModel):
    """Response model for wallet transactions"""
    success: bool
    new_balance: Decimal
    previous_balance: Decimal
    amount_changed: Decimal
    message: str
    timestamp: datetime 