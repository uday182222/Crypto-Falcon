from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.services.wallet_service import WalletService
from app.schemas.wallet import (
    WalletResponse,
    WalletUpdateRequest,
    WalletTopUpRequest,
    WalletTransactionResponse
)

router = APIRouter(prefix="/wallet", tags=["wallet"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=WalletResponse)
async def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's wallet information"""
    
    wallet_service = WalletService(db)
    wallet = wallet_service.get_or_create_wallet(current_user.id)
    
    return WalletResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        balance=wallet.balance,
        created_at=wallet.created_at,
        updated_at=wallet.updated_at
    )

@router.get("/summary")
async def get_wallet_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive wallet summary"""
    
    wallet_service = WalletService(db)
    summary = wallet_service.get_wallet_summary(current_user.id)
    
    return summary

@router.post("/top-up", response_model=WalletTransactionResponse)
async def top_up_wallet(
    top_up_request: WalletTopUpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Top up wallet with specified amount"""
    
    wallet_service = WalletService(db)
    
    try:
        result = wallet_service.top_up_wallet(current_user.id, top_up_request.amount)
        
        return WalletTransactionResponse(
            success=result['success'],
            new_balance=result['new_balance'],
            previous_balance=result['previous_balance'],
            amount_changed=result['amount_changed'],
            message=result['message'],
            timestamp=result['timestamp']
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/direct-topup")
async def direct_topup(
    amount_inr: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Direct top-up with INR amount - converts to demo coins"""
    
    if amount_inr <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Conversion rate: ₹1 = 50 demo coins
    COINS_PER_RUPEE = 50
    coins_to_add = Decimal(str(amount_inr * COINS_PER_RUPEE))
    
    wallet_service = WalletService(db)
    
    try:
        result = wallet_service.top_up_wallet(current_user.id, coins_to_add)
        
        return {
            "success": True,
            "amount_paid_inr": amount_inr,
            "coins_added": float(coins_to_add),
            "new_balance": float(result['new_balance']),
            "previous_balance": float(result['previous_balance']),
            "conversion_rate": f"₹1 = {COINS_PER_RUPEE} coins",
            "message": f"Successfully added {coins_to_add:,.0f} coins for ₹{amount_inr}",
            "timestamp": result['timestamp']
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/update", response_model=WalletTransactionResponse)
async def update_wallet_balance(
    update_request: WalletUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update wallet balance (add or subtract)"""
    
    wallet_service = WalletService(db)
    
    try:
        result = wallet_service.update_balance(
            current_user.id, 
            update_request.amount, 
            update_request.operation
        )
        
        return WalletTransactionResponse(
            success=result['success'],
            new_balance=result['new_balance'],
            previous_balance=result['previous_balance'],
            amount_changed=result['amount_changed'],
            message=result['message'],
            timestamp=result['timestamp']
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/deduct", response_model=WalletTransactionResponse)
async def deduct_from_wallet(
    amount: Decimal,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deduct amount from wallet"""
    
    wallet_service = WalletService(db)
    
    try:
        result = wallet_service.deduct_from_wallet(current_user.id, amount)
        
        return WalletTransactionResponse(
            success=result['success'],
            new_balance=result['new_balance'],
            previous_balance=result['previous_balance'],
            amount_changed=result['amount_changed'],
            message=result['message'],
            timestamp=result['timestamp']
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/reset")
async def reset_wallet(
    new_balance: Decimal = Decimal('100000.0'),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset wallet to initial balance (admin function)"""
    
    wallet_service = WalletService(db)
    
    try:
        result = wallet_service.reset_wallet(current_user.id, new_balance)
        
        return {
            "success": True,
            "message": f"Wallet reset to ${new_balance}",
            "new_balance": result['new_balance'],
            "timestamp": result['timestamp']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset wallet: {str(e)}"
        )

@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current wallet balance (simple endpoint)"""
    
    wallet_service = WalletService(db)
    wallet = wallet_service.get_or_create_wallet(current_user.id)
    
    return {
        "balance": wallet.balance,
        "currency": "USD",
        "last_updated": wallet.updated_at or wallet.created_at
    } 