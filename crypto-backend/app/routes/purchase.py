from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
import razorpay
import hmac
import hashlib
import os
import json
import time

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.purchase import DemoCoinPackage, Purchase
from app.schemas.purchase import (
    PackageResponse,
    PurchaseResponse,
    OrderResponse,
    PaymentVerificationRequest,
    PurchaseInitiateRequest,
    DirectTopupRequest
)
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/purchases", tags=["purchases"])

# Initialize Razorpay client with environment variables
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_rjWYPFN2F7k22B")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "NPN4XO7rYHETmevYRTUu0UWO")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/packages", response_model=List[PackageResponse])
async def get_packages(db: Session = Depends(get_db)):
    """Get all available coin packages"""
    packages = db.query(DemoCoinPackage).filter(DemoCoinPackage.is_active == True).all()
    return packages

@router.get("/history", response_model=List[PurchaseResponse])
async def get_purchase_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get purchase history for current user"""
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id
    ).order_by(Purchase.created_at.desc()).all()
    return purchases

@router.post("/create-order", response_model=OrderResponse)
async def create_order(
    request: PurchaseInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for a package"""
    # Get package
    package = db.query(DemoCoinPackage).filter(DemoCoinPackage.id == request.package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    # Create Razorpay order
    try:
        order_data = {
            "amount": int(package.price * 100),  # Amount in paise
            "currency": "INR",
            "receipt": f"order_{current_user.id}_{package.id}_{int(time.time())}",
            "notes": {
                "package_id": str(package.id),
                "user_id": str(current_user.id),
                "package_name": package.name
            }
        }
        order = client.order.create(data=order_data)

        # Create purchase record
        purchase = Purchase(
            user_id=current_user.id,
            package_id=package.id,
            amount=package.price,
            razorpay_order_id=order["id"],
            status="pending"
        )
        db.add(purchase)
        db.commit()
        db.refresh(purchase)

        return OrderResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            package_name=package.name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.post("/create-direct-topup-order")
async def create_direct_topup_order(
    request: DirectTopupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for direct top-up"""
    amount_inr = request.amount_inr
    
    if amount_inr <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # Conversion rate: ₹1 = 50 demo coins
    COINS_PER_RUPEE = 50
    coins_to_add = amount_inr * COINS_PER_RUPEE
    
    # Create Razorpay order
    try:
        order_data = {
            "amount": int(amount_inr * 100),  # Amount in paise
            "currency": "INR",
            "receipt": f"topup_{current_user.id}_{int(time.time())}",
            "notes": {
                "type": "direct_topup",
                "user_id": str(current_user.id),
                "amount_inr": str(amount_inr),
                "coins_to_add": str(coins_to_add)
            }
        }
        order = client.order.create(data=order_data)

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "amount_inr": amount_inr,
            "coins_to_add": coins_to_add,
            "conversion_rate": f"₹1 = {COINS_PER_RUPEE} coins",
            "description": f"Direct Top-up - {coins_to_add:,.0f} Demo Coins"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.post("/verify-payment")
async def verify_payment(
    request: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment and update purchase status"""
    try:
        # Verify payment signature
        razorpay_signature = request.razorpay_signature
        razorpay_order_id = request.razorpay_order_id
        razorpay_payment_id = request.razorpay_payment_id
        
        # Create signature verification string
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if razorpay_signature != expected_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Find and update purchase
        try:
            purchase = db.query(Purchase).filter(
                Purchase.razorpay_order_id == razorpay_order_id,
                Purchase.user_id == current_user.id
            ).first()
        except Exception as table_error:
            print(f"Purchase table error: {table_error}")
            # If table doesn't exist, treat as direct top-up
            purchase = None
        
        # Check if this is a direct top-up order (no purchase record)
        if not purchase:
            # Handle direct top-up order
            try:
                # Get order details from Razorpay to extract notes
                order_details = client.order.fetch(razorpay_order_id)
                notes = order_details.get('notes', {})
                
                if notes.get('type') == 'direct_topup':
                    amount_inr = float(notes.get('amount_inr', 0))
                    coins_to_add = float(notes.get('coins_to_add', 0))
                    
                    if amount_inr > 0 and coins_to_add > 0:
                        try:
                            # Update user's demo balance using wallet service
                            wallet_service = WalletService(db)
                            wallet_result = wallet_service.top_up_wallet(current_user.id, Decimal(str(coins_to_add)))
                            
                            return {
                                "success": True,
                                "message": "Direct top-up payment verified successfully",
                                "amount_paid_inr": amount_inr,
                                "coins_received": coins_to_add,
                                "new_balance": float(wallet_result['new_balance']),
                                "conversion_rate": "₹1 = 50 coins",
                                "order_id": razorpay_order_id,
                                "payment_id": razorpay_payment_id,
                                "invoice_ready": True
                            }
                        except Exception as wallet_error:
                            print(f"Wallet service error: {wallet_error}")
                            # Fallback: update user's demo balance directly
                            current_user.demo_balance += Decimal(str(coins_to_add))
                            db.commit()
                            
                            return {
                                "success": True,
                                "message": "Direct top-up payment verified successfully (fallback mode)",
                                "amount_paid_inr": amount_inr,
                                "coins_received": coins_to_add,
                                "new_balance": float(current_user.demo_balance),
                                "conversion_rate": "₹1 = 50 coins",
                                "order_id": razorpay_order_id,
                                "payment_id": razorpay_payment_id,
                                "invoice_ready": True
                            }
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid amount or coins in order notes"
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Order is not a direct top-up order"
                    )
            except Exception as e:
                print(f"Error processing direct top-up: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process direct top-up: {str(e)}"
                )
        
        if purchase.status == "completed":
            return {
                "success": True,
                "message": "Payment already verified",
                "coins_received": purchase.coins_received,
                "new_balance": current_user.demo_balance
            }
        
        # Update purchase status
        purchase.status = "completed"
        purchase.razorpay_payment_id = razorpay_payment_id
        
        # Get package details
        package = db.query(DemoCoinPackage).filter(DemoCoinPackage.id == purchase.package_id).first()
        if package:
            # Calculate coins with bonus
            base_coins = package.coins_per_inr * purchase.amount
            bonus_coins = base_coins * (package.bonus_percentage / 100)
            total_coins = base_coins + bonus_coins
            
            try:
                # Update user's demo balance using wallet service
                wallet_service = WalletService(db)
                wallet_result = wallet_service.top_up_wallet(current_user.id, Decimal(str(total_coins)))
                new_balance = float(wallet_result['new_balance'])
            except Exception as wallet_error:
                print(f"Wallet service error: {wallet_error}")
                # Fallback: update user's demo balance directly
                current_user.demo_balance += Decimal(str(total_coins))
                db.commit()
                new_balance = float(current_user.demo_balance)
            
            purchase.coins_received = total_coins
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found"
            )
        
        db.commit()
        
        return {
            "success": True,
            "message": "Payment verified successfully",
            "coins_received": float(purchase.coins_received),
            "new_balance": new_balance,
            "bonus_coins": float(bonus_coins) if package else 0,
            "order_id": razorpay_order_id,
            "payment_id": razorpay_payment_id,
            "invoice_ready": True
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error in verify_payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Razorpay webhook for payment events"""
    try:
        # Get webhook payload
        payload = await request.body()
        signature = request.headers.get("X-Razorpay-Signature")
        
        # Verify webhook signature
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if signature != expected_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Parse webhook data
        webhook_data = json.loads(payload)
        event = webhook_data.get("event")
        
        if event == "payment.captured":
            payment_data = webhook_data.get("payload", {}).get("payment", {})
            order_id = payment_data.get("order_id")
            payment_id = payment_data.get("id")
            
            # Find purchase by order ID
            purchase = db.query(Purchase).filter(
                Purchase.razorpay_order_id == order_id
            ).first()
            
            if purchase and purchase.status == "pending":
                # Get package details
                package = db.query(DemoCoinPackage).filter(DemoCoinPackage.id == purchase.package_id).first()
                if package:
                    # Calculate coins with bonus
                    base_coins = package.coins_per_inr * purchase.amount
                    bonus_coins = base_coins * (package.bonus_percentage / 100)
                    total_coins = base_coins + bonus_coins
                    
                    # Update purchase
                    purchase.status = "completed"
                    purchase.razorpay_payment_id = payment_id
                    purchase.coins_received = total_coins
                    
                    # Update user's wallet
                    wallet_service = WalletService(db)
                    wallet_service.top_up_wallet(purchase.user_id, Decimal(str(total_coins)))
                    
                    db.commit()
        
        return {"status": "success"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        ) 