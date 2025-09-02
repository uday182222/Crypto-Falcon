from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from io import BytesIO
import os
from datetime import datetime
from typing import Dict, Any

class InvoiceService:
    """Service for generating PDF invoices"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles for the invoice"""
        # Custom styles
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='BusinessName',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=10,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=10,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='NormalText',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='FooterText',
            parent=self.styles['Normal'],
            fontSize=8,
            spaceAfter=0,
            alignment=TA_CENTER,
            textColor=colors.grey
        ))
    
    def generate_invoice_pdf(self, invoice_data: Dict[str, Any]) -> BytesIO:
        """Generate PDF invoice from invoice data"""
        # Create PDF buffer
        buffer = BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Add content to story
        story.extend(self._create_header(invoice_data))
        story.append(Spacer(1, 20))
        story.extend(self._create_invoice_info(invoice_data))
        story.append(Spacer(1, 20))
        story.extend(self._create_customer_info(invoice_data))
        story.append(Spacer(1, 20))
        story.extend(self._create_transaction_details(invoice_data))
        story.append(Spacer(1, 30))
        story.extend(self._create_footer())
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def _create_header(self, data: Dict[str, Any]):
        """Create invoice header with business details"""
        elements = []
        
        # Business details (left side)
        business_info = [
            Paragraph(f"<b>{data['business_name']}</b>", self.styles['BusinessName']),
            Paragraph(f"Email: {data['business_email']}", self.styles['NormalText']),
            Paragraph(f"GSTIN: {data['gst_number']}", self.styles['NormalText'])
        ]
        
        # Invoice title (right side)
        invoice_title = [
            Paragraph("INVOICE", self.styles['InvoiceTitle']),
            Paragraph(f"Invoice No: {data['invoice_number']}", self.styles['SectionHeader']),
            Paragraph(f"Date: {data['date']}", self.styles['NormalText'])
        ]
        
        # Create table for header layout
        header_data = [
            [business_info, invoice_title]
        ]
        
        header_table = Table(header_data, colWidths=[3*inch, 3*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (1, 0), 'TOP'),
            ('LEFTPADDING', (0, 0), (1, 0), 0),
            ('RIGHTPADDING', (0, 0), (1, 0), 0),
            ('TOPPADDING', (0, 0), (1, 0), 0),
            ('BOTTOMPADDING', (0, 0), (1, 0), 0),
        ]))
        
        elements.append(header_table)
        return elements
    
    def _create_invoice_info(self, data: Dict[str, Any]):
        """Create invoice information section"""
        elements = []
        
        elements.append(Paragraph("Invoice Information", self.styles['SectionHeader']))
        
        # Create invoice info table
        info_data = [
            ['Invoice Number:', data['invoice_number']],
            ['Invoice Date:', data['date']],
            ['Payment ID:', data['payment_id']],
            ['Order ID:', data['order_id']]
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
            ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(info_table)
        return elements
    
    def _create_customer_info(self, data: Dict[str, Any]):
        """Create customer information section"""
        elements = []
        
        elements.append(Paragraph("Customer Information", self.styles['SectionHeader']))
        
        # Create customer info table
        customer_data = [
            ['Customer Name:', data['customer_name']],
            ['Customer Email:', data['customer_email']]
        ]
        
        customer_table = Table(customer_data, colWidths=[2*inch, 4*inch])
        customer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
            ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(customer_table)
        return elements
    
    def _create_transaction_details(self, data: Dict[str, Any]):
        """Create transaction details section"""
        elements = []
        
        elements.append(Paragraph("Transaction Details", self.styles['SectionHeader']))
        
        # Prepare transaction data
        transaction_data = [
            ['Description', 'Details', 'Amount']
        ]
        
        # Add package details if available
        if data.get('package_name'):
            transaction_data.append([
                f"Package: {data['package_name']}",
                f"Virtual Coins: {data.get('coins_received', 0):,}",
                f"Rs. {data.get('base_price', data['amount_paid']):,.2f}"
            ])
            
            if data.get('bonus_coins', 0) > 0:
                transaction_data.append([
                    "Bonus Coins",
                    f"+{data['bonus_coins']:,} Virtual Coins",
                    "FREE"
                ])
        else:
            # Direct top-up
            transaction_data.append([
                "Direct Top-up",
                f"Virtual Coins: {data.get('coins_received', 0):,}",
                f"Rs. {data.get('base_price', data['amount_paid']):,.2f}"
            ])
        
        # Add price breakdown - match spreadsheet format
        if data.get('base_price') and data.get('gst_tax'):
            transaction_data.append([
                "Tax",
                "18% GST",
                f"Rs. {data['gst_tax']:,.2f}"
            ])
        
        # Add total row
        transaction_data.append([
            "",
            "Total Service Fee",
            f"Rs. {data['total_amount']:,.2f}"
        ])
        
        # Create transaction table
        transaction_table = Table(transaction_data, colWidths=[2.5*inch, 2.5*inch, 1*inch])
        transaction_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgreen),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            # Add special styling for tax row
            ('BACKGROUND', (0, -2), (-1, -2), colors.lightyellow),  # Tax row
            ('FONTNAME', (0, -2), (-1, -2), 'Helvetica-Bold'),     # Bold for tax
            # Make total row bold
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),     # Bold for total row
        ]))
        
        elements.append(transaction_table)
        return elements
    
    def _create_footer(self):
        """Create invoice footer"""
        elements = []
        
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Thank you for choosing BitcoinPro.in!", self.styles['NormalText']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("This is a computer generated invoice.", self.styles['FooterText']))
        elements.append(Paragraph("For any queries, contact us at support@bitcoinpro.in", self.styles['FooterText']))
        
        return elements
    
    def save_invoice_to_file(self, invoice_data: Dict[str, Any], file_path: str) -> str:
        """Save invoice PDF to file and return file path"""
        try:
            pdf_buffer = self.generate_invoice_pdf(invoice_data)
            
            # Ensure directory exists (only if file_path has a directory)
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            # Write PDF to file
            with open(file_path, 'wb') as f:
                f.write(pdf_buffer.getvalue())
            
            return file_path
        except Exception as e:
            print(f"Error saving invoice to file: {e}")
            raise e
