from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class InvoiceData(BaseModel):
    invoice_number: str
    date: str
    customer_name: str
    customer_email: str
    amount_paid: float
    payment_id: str
    order_id: str
    business_name: str = "MotionFalcon Pvt. Ltd."
    business_address: str = "123 Tech Park, Hinjewadi, Pune, Maharashtra 411057, India"
    gst_number: str = "27ABCDE1234F1Z5"
    package_name: Optional[str] = None
    coins_received: Optional[int] = None
    bonus_coins: Optional[int] = None
    conversion_rate: Optional[str] = None

class InvoiceResponse(BaseModel):
    success: bool
    message: str
    invoice_data: Optional[InvoiceData] = None
    pdf_url: Optional[str] = None
