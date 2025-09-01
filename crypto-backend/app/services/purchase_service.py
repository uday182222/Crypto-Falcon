import os
import razorpay
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime
from typing import Optional, Dict, List
import hmac
import hashlib
import uuid
from dotenv import load_dotenv

from app.models.user import User
from app.models.purchase import DemoCoinPurchase, DemoCoinPackage, PurchaseStatus
from app.schemas.purchase import (
    PurchaseInitiateRequest,
    PurchaseInitiateResponse,
    PurchaseVerifyRequest,
    PurchaseVerifyResponse,
    PurchaseHistoryResponse,
    PurchaseHistoryItem,
    DemoCoinPackageResponse
)

# Load environment variables
load_dotenv()

class PurchaseService:
    """Service for handling DemoCoin purchases with Razorpay"""
    
    def __init__(self, db: Session):
        self.db = db
        self.is_test_mode = os.getenv("RAZORPAY_TEST_MODE", "true").lower() == "true"
        
        # Initialize Razorpay client
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        self.razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        
        if not self.is_test_mode and (not self.razorpay_key_id or not self.razorpay_key_secret):
            raise ValueError("Razorpay credentials not found")
            
        self.client = razorpay.Client(
            auth=(self.razorpay_key_id, self.razorpay_key_secret)
        )
        
        # Default coin packages
        self.default_packages = [
            {
                "name": "Starter Pack",
                "description": "Perfect for beginners! Start your trading journey with 1,000 coins.",
                "coins": 1000,
                "price_inr": 99,
                "bonus_percentage": 0
            },
            {
                "name": "Pro Pack",
                "description": "Most Popular! Get 5,000 coins plus 10% bonus coins.",
                "coins": 5000,
                "price_inr": 399,
                "bonus_percentage": 10
            },
            {
                "name": "Premium Pack",
                "description": "Best Value! Get 25,000 coins plus 20% bonus coins and priority trading.",
                "coins": 25000,
                "price_inr": 1499,
                "bonus_percentage": 20
            }
        ]
    
    def get_or_create_packages(self) -> List[DemoCoinPackage]:
        """Get or create default DemoCoin packages"""
        existing_packages = self.db.query(DemoCoinPackage).filter(
            DemoCoinPackage.is_active == True
        ).all()
        
        if existing_packages:
            return existing_packages
        
        # Create default packages
        packages = []
        for pkg_data in self.default_packages:
            coins_per_inr = pkg_data["coins"] / pkg_data["price_inr"]
            package = DemoCoinPackage(
                name=pkg_data["name"],
                description=pkg_data["description"],
                coins=Decimal(str(pkg_data["coins"])),
                price_inr=Decimal(str(pkg_data["price_inr"])),
                coins_per_inr=Decimal(str(coins_per_inr)),
                bonus_percentage=pkg_data["bonus_percentage"],
                is_active=True
            )
            packages.append(package)
            self.db.add(package)
        
        self.db.commit()
        return packages
    
    def get_packages(self) -> List[DemoCoinPackageResponse]:
        """Get all active DemoCoin packages"""
        packages = self.get_or_create_packages()
        return [DemoCoinPackageResponse.model_validate(pkg) for pkg in packages]
    
    def get_package_by_id(self, package_id: uuid.UUID) -> Optional[DemoCoinPackage]:
        """Get a package by ID"""
        return self.db.query(DemoCoinPackage).filter(DemoCoinPackage.id == package_id).first()

    def calculate_coins_for_amount(self, amount_inr: Decimal) -> Decimal:
        """Calculate coins for custom amount (default rate: 50 coins per INR)"""
        return amount_inr * Decimal("50")
    
    def initiate_purchase(self, request: PurchaseInitiateRequest, user: User) -> PurchaseInitiateResponse:
        """Initiate a DemoCoin purchase"""
        
        # Determine amount and coins
        if request.package_id:
            package = self.db.query(DemoCoinPackage).filter(
                DemoCoinPackage.id == request.package_id,
                DemoCoinPackage.is_active == True
            ).first()
            
            if not package:
                raise ValueError("Package not found")
            
            amount_inr = package.price_inr
            coins_to_purchase = package.coins
            coins_per_inr = package.coins_per_inr
            
        elif request.custom_amount_inr:
            amount_inr = request.custom_amount_inr
            coins_to_purchase = self.calculate_coins_for_amount(amount_inr)
            coins_per_inr = coins_to_purchase / amount_inr
            
        else:
            raise ValueError("Either package_id or custom_amount_inr must be provided")
        
        # Create Razorpay order
        order_data = {
            "amount": int(amount_inr * 100),  # Razorpay expects amount in paise
            "currency": "INR",
            "receipt": f"democoin_purchase_{user.id}_{datetime.now().timestamp()}",
            "notes": {
                "user_id": str(user.id),
                "coins": str(coins_to_purchase),
                "coins_per_inr": str(coins_per_inr)
            }
        }
        
        if self.is_test_mode:
            # Test mode - create virtual order
            razorpay_order = {
                "id": f"order_test_{user.id}_{int(datetime.now().timestamp())}",
                "amount": int(amount_inr * 100),
                "currency": "INR",
                "status": "created",
                "receipt": order_data["receipt"],
                "notes": order_data["notes"]
            }
        else:
            try:
                razorpay_order = self.client.order.create(order_data)
            except Exception as e:
                raise Exception(f"Failed to create Razorpay order: {str(e)}")
        
        # Create purchase record
        purchase = DemoCoinPurchase(
            user_id=user.id,
            razorpay_order_id=razorpay_order["id"],
            amount_inr=amount_inr,
            coins_purchased=coins_to_purchase,
            coins_per_inr=coins_per_inr,
            status=PurchaseStatus.PENDING
        )
        
        self.db.add(purchase)
        self.db.commit()
        self.db.refresh(purchase)
        
        return PurchaseInitiateResponse(
            success=True,
            purchase_id=purchase.id,
            razorpay_order_id=razorpay_order["id"],
            amount_inr=amount_inr,
            coins_to_purchase=coins_to_purchase,
            razorpay_key=self.razorpay_key_id,
            order_details=razorpay_order
        )
    
    def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay signature"""
        if self.is_test_mode:
            # Test mode - accept any signature that starts with "test_"
            return signature.startswith("test_")
        
        message = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(
            self.razorpay_key_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(generated_signature, signature)
    
    def verify_payment(self, request: PurchaseVerifyRequest, user: User) -> PurchaseVerifyResponse:
        """Verify payment and update user balance"""
        
        # Get purchase record
        purchase = self.db.query(DemoCoinPurchase).filter(
            DemoCoinPurchase.id == request.purchase_id,
            DemoCoinPurchase.user_id == user.id,
            DemoCoinPurchase.status == PurchaseStatus.PENDING
        ).first()
        
        if not purchase:
            return PurchaseVerifyResponse(
                success=False,
                message="Purchase not found or already processed",
                purchase_id=request.purchase_id,
                coins_added=Decimal("0"),
                new_balance=user.demo_balance
            )
        
        # Verify signature
        if not self.verify_signature(
            purchase.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        ):
            # Mark as failed
            purchase.status = PurchaseStatus.FAILED
            self.db.commit()
            
            return PurchaseVerifyResponse(
                success=False,
                message="Invalid payment signature",
                purchase_id=request.purchase_id,
                coins_added=Decimal("0"),
                new_balance=user.demo_balance
            )
        
        # Check for duplicate payment
        existing_payment = self.db.query(DemoCoinPurchase).filter(
            DemoCoinPurchase.razorpay_payment_id == request.razorpay_payment_id,
            DemoCoinPurchase.status == PurchaseStatus.SUCCESS
        ).first()
        
        if existing_payment:
            return PurchaseVerifyResponse(
                success=False,
                message="Payment already processed",
                purchase_id=request.purchase_id,
                coins_added=Decimal("0"),
                new_balance=user.demo_balance
            )
        
        # Update purchase record
        purchase.razorpay_payment_id = request.razorpay_payment_id
        purchase.razorpay_signature = request.razorpay_signature
        purchase.status = PurchaseStatus.SUCCESS
        purchase.payment_completed_at = datetime.utcnow()
        
        # Add coins to user balance
        # Get user from database to avoid session issues
        db_user = self.db.query(User).filter(User.id == user.id).first()
        if db_user:
            db_user.demo_balance += purchase.coins_purchased
            self.db.commit()
            self.db.refresh(db_user)
            user.demo_balance = db_user.demo_balance  # Update the passed user object
        
        return PurchaseVerifyResponse(
            success=True,
            message=f"Successfully added {purchase.coins_purchased} DemoCoins",
            purchase_id=purchase.id,
            coins_added=purchase.coins_purchased,
            new_balance=user.demo_balance,
            transaction_id=request.razorpay_payment_id
        )
    
    def get_purchase_history(self, user: User, limit: int = 50) -> PurchaseHistoryResponse:
        """Get user's purchase history"""
        purchases = self.db.query(DemoCoinPurchase).filter(
            DemoCoinPurchase.user_id == user.id
        ).order_by(DemoCoinPurchase.created_at.desc()).limit(limit).all()
        
        # Calculate totals
        total_spent = sum(
            p.amount_inr for p in purchases if p.status == PurchaseStatus.SUCCESS
        )
        total_coins = sum(
            p.coins_purchased for p in purchases if p.status == PurchaseStatus.SUCCESS
        )
        
        purchase_items = [
            PurchaseHistoryItem.model_validate(purchase) for purchase in purchases
        ]
        
        return PurchaseHistoryResponse(
            total_purchases=len(purchases),
            total_spent_inr=total_spent,
            total_coins_purchased=total_coins,
            purchases=purchase_items
        ) 