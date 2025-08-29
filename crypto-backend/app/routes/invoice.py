from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import os
from datetime import datetime
import uuid

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.purchase import Purchase, DemoCoinPackage
from app.schemas.invoice import InvoiceData, InvoiceResponse
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoice", tags=["invoice"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate", response_model=InvoiceResponse)
async def generate_invoice(
    payment_id: str,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate invoice for a completed payment"""
    try:
        # Find the purchase record
        purchase = db.query(Purchase).filter(
            Purchase.razorpay_order_id == order_id,
            Purchase.user_id == current_user.id
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase record not found"
            )
        
        if purchase.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed yet"
            )
        
        # Get package details if available
        package = None
        if purchase.package_id:
            package = db.query(DemoCoinPackage).filter(
                DemoCoinPackage.id == purchase.package_id
            ).first()
        
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
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
            "business_address": "123 Tech Park, Hinjewadi, Pune, Maharashtra 411057, India",
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
                "conversion_rate": "₹1 = 50 coins"
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
