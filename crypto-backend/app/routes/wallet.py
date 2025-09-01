from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime
import razorpay
import os
import hmac
import hashlib

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.wallet_transaction import WalletTransaction
from app.services.wallet_service import WalletService
from app.schemas.wallet import (
    WalletResponse,
    WalletUpdateRequest,
    WalletTopUpRequest,
    WalletTransactionResponse
)

# Add new schema for top-up order
from pydantic import BaseModel

class WalletTopUpOrderRequest(BaseModel):
    amount: float
    package_id: str = None  # Optional package ID for game USD conversion

class WalletTopUpVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    amount: float
    package_id: str = None  # Optional package ID for game USD conversion

# PhonePe integration types
class PhonePeTopUpOrderRequest(BaseModel):
    amount: float
    package_id: str | None = None

class PhonePeTopUpVerifyRequest(BaseModel):
    merchant_transaction_id: str
    amount: float
    package_id: str | None = None

router = APIRouter(prefix="/wallet", tags=["wallet"])

# Initialize Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_rjWYPFN2F7k22B")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "NPN4XO7rYHETmevYRTUu0UWO")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# PhonePe client (lazy import to avoid hard dependency if not configured)
try:
    from app.services.phonepe_client import PhonePeClient
    phonepe_client: PhonePeClient | None = PhonePeClient()
except Exception:
    phonepe_client = None

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

@router.post("/create-topup-order")
async def create_wallet_topup_order(
    request: WalletTopUpOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for wallet top-up"""
    
    if request.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Add reasonable limits for test mode
    if request.amount > 10000:  # Max ₹10,000 for test mode
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount cannot exceed ₹10,000 for test mode"
        )
    
    if request.amount < 1:  # Min ₹1
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be at least ₹1"
        )
    
    try:
        # Amount is already in INR (sent from frontend)
        amount_inr = request.amount
        
        # Create Razorpay order
        order_data = {
            "amount": int(amount_inr * 100),  # Amount in paise
            "currency": "INR",
            "receipt": f"wallet_topup_{current_user.id}_{int(datetime.utcnow().timestamp())}",
            "notes": {
                "user_id": str(current_user.id),
                "amount_inr": str(request.amount),
                "type": "wallet_topup"
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return {
            "success": True,
            "order_id": order["id"],
            "amount": request.amount,
            "amount_inr": amount_inr,
            "currency": "INR",
            "receipt": order["receipt"]
        }
        
    except Exception as e:
        error_msg = str(e)
        if "maximum amount" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount too high for test mode. Please try ₹1000 or less."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create order: {error_msg}"
            )

@router.post("/create-topup-order-phonepe")
async def create_wallet_topup_order_phonepe(
    request: PhonePeTopUpOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a PhonePe Pay Page order and return redirect URL."""
    if phonepe_client is None:
        raise HTTPException(status_code=500, detail="PhonePe is not configured")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    amount_inr = request.amount
    # Create a unique merchant transaction id
    merchant_txn_id = f"MFWT_{current_user.id}_{int(datetime.utcnow().timestamp())}"

    try:
        result = phonepe_client.create_pay_page(
            merchant_transaction_id=merchant_txn_id,
            merchant_user_id=str(current_user.id),
            amount_in_inr=float(amount_inr),
            package_id=request.package_id,
        )

        return {
            "success": True,
            "merchant_transaction_id": result["merchant_transaction_id"],
            "redirect_url": result.get("redirect_url"),
            "amount": float(amount_inr),
            "currency": "INR",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PhonePe order failed: {str(e)}")

@router.post("/verify-topup-payment")
async def verify_wallet_topup_payment(
    request: WalletTopUpVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment and top up wallet"""
    
    try:
        # Verify payment signature
        text = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            text.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != request.razorpay_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Verify payment with Razorpay
        payment = razorpay_client.payment.fetch(request.razorpay_payment_id)
        
        if payment["status"] != "captured":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed"
            )
        
        if payment["order_id"] != request.razorpay_order_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order ID mismatch"
            )
        
        # Top up wallet with game USD amount based on package
        # Use package ID to determine the exact USD amount to give
        game_usd_amount = 0
        
        if request.package_id:
            # Package-based top-up with new package IDs
            if request.package_id == 'crypto-crumbs':
                game_usd_amount = 100000  # ₹10 = 100,000 USD
            elif request.package_id == 'rookie-pack':
                game_usd_amount = 200000  # ₹20 = 200,000 USD
            elif request.package_id == 'lambo-baron':
                game_usd_amount = 500000  # ₹50 = 500,000 USD
            elif request.package_id == 'ramen-bubble':
                game_usd_amount = 1000000  # ₹100 = 1,000,000 USD
            elif request.package_id == 'digi-dynasty':
                game_usd_amount = 2500000  # ₹250 = 2,500,000 USD
            elif request.package_id == 'block-mogul':
                game_usd_amount = 5000000  # ₹500 = 5,000,000 USD
            elif request.package_id == 'satoshi-vault':
                game_usd_amount = 100000000  # ₹1000 = 100,000,000 USD
            elif request.package_id == 'custom':
                # Custom top-up amount - amount is in INR
                # For custom top-up, assume ₹1 = 500 USD in game
                game_usd_amount = request.amount * 500  # Direct conversion
            else:
                # Fallback: calculate based on amount
                game_usd_amount = request.amount * 500  # Default: ₹1 = 500 USD
        else:
            # Direct top-up (custom amount)
            game_usd_amount = request.amount * 500  # Default: ₹1 = 500 USD
        
        wallet_service = WalletService(db)
        result = wallet_service.top_up_wallet(current_user.id, Decimal(str(game_usd_amount)))
        
        # Store the transaction in the database
        transaction = WalletTransaction(
            user_id=current_user.id,
            transaction_type='topup' if request.package_id == 'custom' else 'package',
            amount=Decimal(str(game_usd_amount)),
            currency='USD',
            payment_id=request.razorpay_payment_id,
            order_id=request.razorpay_order_id,
            package_id=request.package_id,
            description=f"Added ${game_usd_amount:,} USD to wallet",
            status='completed'
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {
            "success": True,
            "payment_id": request.razorpay_payment_id,
            "order_id": request.razorpay_order_id,
            "amount_added": game_usd_amount,
            "new_balance": float(result['new_balance']),
            "previous_balance": float(result['previous_balance']),
            "message": f"Successfully added ${game_usd_amount:,} USD to wallet",
            "timestamp": result['timestamp']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

@router.get("/transactions")
async def get_wallet_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wallet transaction history"""
    
    try:
        # Query wallet transactions for the current user
        transactions = db.query(WalletTransaction).filter(
            WalletTransaction.user_id == current_user.id
        ).order_by(WalletTransaction.created_at.desc()).all()
        
        # Convert to response format
        transaction_list = []
        for tx in transactions:
            transaction_list.append({
                "id": tx.id,
                "type": tx.transaction_type,
                "amount": float(tx.amount),
                "currency": tx.currency,
                "payment_id": tx.payment_id,
                "order_id": tx.order_id,
                "package_id": tx.package_id,
                "description": tx.description,
                "status": tx.status,
                "timestamp": tx.created_at.isoformat() if tx.created_at else None
            })
        
        return {
            "success": True,
            "data": transaction_list,
            "count": len(transaction_list)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transactions: {str(e)}"
        ) 

@router.post("/verify-topup-payment-phonepe")
async def verify_wallet_topup_payment_phonepe(
    request: PhonePeTopUpVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify PhonePe transaction using status API and credit wallet."""
    if phonepe_client is None:
        raise HTTPException(status_code=500, detail="PhonePe is not configured")

    try:
        status_data = phonepe_client.get_status(request.merchant_transaction_id)
        # Expect code == 'PAYMENT_SUCCESS' or similar status mapping
        code = (status_data or {}).get("code")
        success = code in ("PAYMENT_SUCCESS", "SUCCESS")
        if not success:
            raise HTTPException(status_code=400, detail=f"Payment not successful: {code}")

        # Determine game USD amount based on package or default mapping
        if request.package_id:
            mapping = {
                'crypto-crumbs': 100000,
                'rookie-pack': 200000,
                'lambo-baron': 500000,
                'ramen-bubble': 1000000,
                'digi-dynasty': 2500000,
                'block-mogul': 5000000,
                'satoshi-vault': 100000000,
            }
            game_usd_amount = mapping.get(request.package_id, request.amount * 500)
        else:
            game_usd_amount = request.amount * 500

        wallet_service = WalletService(db)
        result = wallet_service.top_up_wallet(current_user.id, Decimal(str(game_usd_amount)))

        # Extract a payment id if present
        payment_id = request.merchant_transaction_id
        try:
            payment_id = (
                status_data.get("data", {})
                .get("paymentInstrument", {})
                .get("transactionId", payment_id)
            )
        except Exception:
            payment_id = request.merchant_transaction_id

        # Store transaction
        transaction = WalletTransaction(
            user_id=current_user.id,
            transaction_type='topup' if request.package_id == 'custom' else 'package',
            amount=Decimal(str(game_usd_amount)),
            currency='USD',
            payment_id=str(payment_id),
            order_id=request.merchant_transaction_id,
            package_id=request.package_id,
            description=f"Added ${game_usd_amount:,} USD to wallet",
            status='completed'
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": request.merchant_transaction_id,
            "amount_added": game_usd_amount,
            "new_balance": float(result['new_balance']),
            "previous_balance": float(result['previous_balance']),
            "message": f"Successfully added ${game_usd_amount:,} USD to wallet",
            "timestamp": result['timestamp']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PhonePe verification failed: {str(e)}")