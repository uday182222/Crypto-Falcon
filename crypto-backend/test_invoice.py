#!/usr/bin/env python3
"""
Test script for invoice generation functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.invoice_service import InvoiceService

def test_invoice_generation():
    """Test invoice PDF generation"""
    print("🧪 Testing Invoice Generation...")
    
    # Sample invoice data
    test_data = {
        "invoice_number": "INV-20250125-TEST123",
        "date": "2025-01-25",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "amount_paid": 1500.00,
        "payment_id": "pay_test123",
        "order_id": "order_test123",
        "business_name": "MotionFalcon Pvt. Ltd.",
        "business_address": "123 Tech Park, Hinjewadi, Pune, Maharashtra 411057, India",
        "gst_number": "27ABCDE1234F1Z5",
        "package_name": "Ramen Bubble Package",
        "coins_received": 1000000,
        "bonus_coins": 0,
        "conversion_rate": "₹1 = 50 coins"
    }
    
    try:
        # Initialize invoice service
        invoice_service = InvoiceService()
        print("✅ Invoice service initialized")
        
        # Generate PDF
        pdf_buffer = invoice_service.generate_invoice_pdf(test_data)
        print("✅ PDF generated successfully")
        print(f"📄 PDF size: {len(pdf_buffer.getvalue())} bytes")
        
        # Test saving to file
        test_file_path = "test_invoice.pdf"
        file_path = invoice_service.save_invoice_to_file(test_data, test_file_path)
        print(f"✅ Invoice saved to: {file_path}")
        
        # Check if file exists
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"📁 File exists with size: {file_size} bytes")
            
            # Clean up test file
            os.remove(file_path)
            print("🧹 Test file cleaned up")
        else:
            print("❌ File was not created")
            
        print("\n🎉 All tests passed! Invoice generation is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_invoice_generation()
    sys.exit(0 if success else 1)
