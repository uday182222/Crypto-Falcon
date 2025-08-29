const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class InvoiceAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('bitcoinpro_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async generateInvoice(paymentId, orderId) {
        try {
            const response = await fetch(`${this.baseURL}/invoice/generate`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    payment_id: paymentId,
                    order_id: orderId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }

    async downloadInvoice(filename) {
        try {
            const response = await fetch(`${this.baseURL}/invoice/download/${filename}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true, message: 'Invoice downloaded successfully' };
        } catch (error) {
            console.error('Error downloading invoice:', error);
            throw error;
        }
    }

    async listInvoices() {
        try {
            const response = await fetch(`${this.baseURL}/invoice/list`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error listing invoices:', error);
            throw error;
        }
    }

    // Generate and download invoice in one call
    async generateAndDownloadInvoice(paymentId, orderId) {
        try {
            // First generate the invoice
            const invoiceResponse = await this.generateInvoice(paymentId, orderId);
            
            if (invoiceResponse.success && invoiceResponse.pdf_url) {
                // Extract filename from URL
                const filename = invoiceResponse.pdf_url.split('/').pop();
                
                // Download the invoice
                await this.downloadInvoice(filename);
                
                return {
                    success: true,
                    message: 'Invoice generated and downloaded successfully',
                    invoice_data: invoiceResponse.invoice_data
                };
            } else {
                throw new Error('Failed to generate invoice');
            }
        } catch (error) {
            console.error('Error in generate and download:', error);
            throw error;
        }
    }
}

export const invoiceAPI = new InvoiceAPI();
