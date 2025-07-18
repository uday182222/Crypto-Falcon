from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import Dict, List
from pydantic import BaseModel

from app.db import SessionLocal
from app.models.user import User
from app.auth import get_current_user
from app.services.currency_service import currency_service

router = APIRouter(prefix="/currency", tags=["currency"])

class CurrencyPreference(BaseModel):
    currency: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/rates")
def get_exchange_rates():
    """Get current exchange rates for all supported currencies"""
    return currency_service.get_rates()

@router.get("/supported")
def get_supported_currencies():
    """Get list of supported currencies"""
    return currency_service.get_supported_currencies()

@router.post("/preference")
def update_preferred_currency(
    preference: CurrencyPreference,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's preferred currency"""
    if preference.currency not in currency_service.get_supported_currencies():
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported currency. Must be one of: {', '.join(currency_service.get_supported_currencies().keys())}"
        )
    
    current_user.preferred_currency = preference.currency
    db.commit()
    return {"message": "Currency preference updated successfully"} 