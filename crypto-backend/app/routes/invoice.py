from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import os
from datetime import datetime
import uuid
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.purchase import Purchase, DemoCoinPackage
from app.schemas.invoice import InvoiceData, InvoiceResponse
from app.services.invoice_service import InvoiceService
from app.models.wallet_transaction import WalletTransaction

router = APIRouter(prefix="/invoice", tags=["invoice"])

class InvoiceRequest(BaseModel):
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    transaction_id: Optional[int] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate", response_model=InvoiceResponse)
async def generate_invoice(
    request: InvoiceRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate invoice for a completed payment or existing transaction"""
    try:
        print(f"🔍 Invoice generation request received:")
        print(f"   - User ID: {current_user.id}")
        print(f"   - User email: {current_user.email}")
        print(f"   - Request data: {request}")
        print(f"   - Transaction ID: {request.transaction_id}")
        print(f"   - Order ID: {request.order_id}")
        print(f"   - Payment ID: {request.payment_id}")
        
        purchase = None

        # Try to find purchase by order_id first (for new payments)
        if request.order_id:
            print(f"🔍 Searching for purchase by order_id: {request.order_id}")
            purchase = db.query(Purchase).filter(
                Purchase.razorpay_order_id == request.order_id,
                Purchase.user_id == current_user.id
            ).first()
            print(f"   - Found purchase by order_id: {purchase}")

        # If not found and we have transaction_id, try to find by transaction ID
        if not purchase and request.transaction_id:
            print(f"🔍 Searching for purchase by transaction_id: {request.transaction_id}")
            purchase = db.query(Purchase).filter(
                Purchase.id == request.transaction_id,
                Purchase.user_id == current_user.id
            ).first()
            print(f"   - Found purchase by transaction_id: {purchase}")
            
            # Also check all purchases for this user
            all_purchases = db.query(Purchase).filter(
                Purchase.user_id == current_user.id
            ).all()
            print(f"🔍 All purchases for user {current_user.id}:")
            for p in all_purchases:
                print(f"   - Purchase ID: {p.id}, Amount: {p.amount}, Status: {p.status}")

        # If still not found, try to find any completed purchase for this user
        if not purchase:
            print(f"🔍 Searching for any completed purchase for user: {current_user.id}")
            purchase = db.query(Purchase).filter(
                Purchase.user_id == current_user.id,
                Purchase.status == "completed"
            ).order_by(Purchase.created_at.desc()).first()
            print(f"   - Found any completed purchase: {purchase}")
            
            # Debug: Show ALL purchases in the database
            all_purchases_all_users = db.query(Purchase).all()
            print(f"🔍 ALL purchases in database (all users):")
            for p in all_purchases_all_users:
                print(f"   - Purchase ID: {p.id}, User ID: {p.user_id}, Amount: {p.amount}, Status: {p.status}")
            
            # Debug: Show ALL wallet transactions in the database
            all_wallet_transactions = db.query(WalletTransaction).all()
            print(f"🔍 ALL wallet transactions in database (all users):")
            for wt in all_wallet_transactions:
                print(f"   - Transaction ID: {wt.id}, User ID: {wt.user_id}, Amount: {wt.amount}, Status: {wt.status}, Type: {wt.transaction_type}")
            
            # If no purchase found, try to find a wallet transaction
            if not purchase:
                print(f"🔍 Searching for wallet transaction with ID: {request.transaction_id}")
                wallet_transaction = db.query(WalletTransaction).filter(
                    WalletTransaction.id == request.transaction_id,
                    WalletTransaction.user_id == current_user.id,
                    WalletTransaction.status == "completed"
                ).first()
                print(f"   - Found wallet transaction: {wallet_transaction}")
                
                if wallet_transaction:
                    # Create a virtual purchase record from the wallet transaction
                    print(f"🔍 Creating virtual purchase from wallet transaction")
                    purchase = type('obj', (object,), {
                        'id': wallet_transaction.id,
                        'user_id': wallet_transaction.user_id,
                        'amount': float(wallet_transaction.amount),
                        'status': wallet_transaction.status,
                        'razorpay_order_id': wallet_transaction.order_id or f"WT_{wallet_transaction.id}",
                        'razorpay_payment_id': wallet_transaction.payment_id or f"PAY_{wallet_transaction.id}",
                        'created_at': wallet_transaction.created_at,
                        'package_id': wallet_transaction.package_id or 'wallet_topup',
                        'coins_received': float(wallet_transaction.amount)  # Add missing attribute
                    })()
                    print(f"   - Virtual purchase created: {purchase}")

        if not purchase:
            print(f"❌ No purchase found for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No completed purchase found for this user"
            )
        
        if purchase.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed yet"
            )
        
        # Get package details if available
        package = None
        if purchase.package_id:
            # Handle both integer package IDs (from Purchase) and string package IDs (from WalletTransaction)
            if isinstance(purchase.package_id, int):
                # Integer package ID - query DemoCoinPackage table
                package = db.query(DemoCoinPackage).filter(
                    DemoCoinPackage.id == purchase.package_id
                ).first()
            else:
                # String package ID - create virtual package object for wallet transactions
                print(f"🔍 Creating virtual package for string package_id: {purchase.package_id}")
                package = type('obj', (object,), {
                    'id': purchase.package_id,
                    'name': purchase.package_id.replace('-', ' ').title(),
                    'coins_per_inr': 500,  # Default conversion rate
                    'bonus_percentage': 0
                })()
                print(f"   - Virtual package created: {package}")
        
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Use actual payment_id and order_id if available, otherwise generate them
        payment_id = request.payment_id or purchase.razorpay_payment_id or f"PAY-{purchase.id}"
        order_id = request.order_id or purchase.razorpay_order_id or f"ORD-{purchase.id}"
        
        # Prepare invoice data
        invoice_data = {
            "invoice_number": invoice_number,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "customer_name": current_user.username,
            "customer_email": current_user.email,
            "amount_paid": float(purchase.amount),
            "payment_id": payment_id,
            "order_id": order_id,
            "business_name": "MotionFalcon Pvt. Ltd.",
            "business_email": "support@motionfalcon.com",
            "gst_number": "27ABCDE1234F1Z5"
        }
        
        # Add package-specific details
        if package:
            invoice_data.update({
                "package_name": package.name,
                "coins_received": int(purchase.coins_received) if purchase.coins_received else 0,
                "bonus_coins": int(purchase.coins_received * (package.bonus_percentage / 100)) if package.bonus_percentage else 0,
                "conversion_rate": f"₹1 = {package.coins_per_inr} coins"
            })
        else:
            # Direct top-up
            invoice_data.update({
                "package_name": "Direct Top-up",
                "coins_received": int(purchase.coins_received) if purchase.coins_received else 0,
                "bonus_coins": 0,
                "conversion_rate": "₹1 = 500 coins"
            })
        
        # Calculate price breakdown
        base_price = float(purchase.amount) * 0.95  # 95% of total amount
        charges = float(purchase.amount) * 0.05     # 5% charges
        
        invoice_data.update({
            "base_price": base_price,
            "charges": charges,
            "total_amount": float(purchase.amount)
        })
        
        # Generate PDF invoice
        invoice_service = InvoiceService()
        
        # Create invoices directory if it doesn't exist
        invoices_dir = "invoices"
        os.makedirs(invoices_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"invoice_{invoice_number}_{current_user.id}_{int(datetime.now().timestamp())}.pdf"
        file_path = os.path.join(invoices_dir, filename)
        
        # Save invoice to file
        invoice_service.save_invoice_to_file(invoice_data, file_path)
        
        return InvoiceResponse(
            success=True,
            message="Invoice generated successfully",
            invoice_data=InvoiceData(**invoice_data),
            pdf_url=f"/invoice/download/{filename}"
        )
        
    except Exception as e:
        print(f"Error generating invoice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate invoice: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_invoice(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Download generated invoice PDF"""
    try:
        # Validate filename format for security
        if not filename.startswith("invoice_") or not filename.endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename format"
            )
        
        # Check if file exists
        file_path = os.path.join("invoices", filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice file not found"
            )
        
        # Return file for download
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/pdf"
        )
        
    except Exception as e:
        print(f"Error downloading invoice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download invoice: {str(e)}"
        )

@router.get("/list")
async def list_user_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all invoices for the current user"""
    try:
        # Get all completed purchases for the user
        purchases = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.status == "completed"
        ).order_by(Purchase.created_at.desc()).all()
        
        invoices = []
        for purchase in purchases:
            # Generate invoice number for display
            invoice_number = f"INV-{purchase.created_at.strftime('%Y%m%d')}-{str(purchase.id).zfill(6)}"
            
            invoices.append({
                "invoice_number": invoice_number,
                "date": purchase.created_at.strftime("%Y-%m-%d"),
                "amount": float(purchase.amount),
                "order_id": purchase.razorpay_order_id,
                "payment_id": purchase.razorpay_payment_id,
                "package_name": "Direct Top-up" if not purchase.package_id else "Package Purchase",
                "coins_received": int(purchase.coins_received) if purchase.coins_received else 0
            })
        
        return {
            "success": True,
            "invoices": invoices
        }
        
    except Exception as e:
        print(f"Error listing invoices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list invoices: {str(e)}"
        )
