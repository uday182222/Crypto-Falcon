// MotionFalcon Wallet Integration
class MotionFalconWallet {
    constructor() {
        this.api = new MotionFalconAPI();
        this.ui = new MotionFalconUI();
        this.init();
    }

    async init() {
        console.log('Initializing wallet...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'page-login.html';
            return;
        }

        // Load wallet data
        await this.loadWalletBalance();
        await this.loadWalletSummary();
    }

    async loadWalletBalance() {
        try {
            console.log('Loading wallet balance...');
            const response = await this.api.get('/wallet/');
            
            if (response.success) {
                this.updateWalletBalance(response.data);
            } else {
                console.error('Failed to load wallet balance:', response.message);
                this.showError('Failed to load wallet balance');
            }
        } catch (error) {
            console.error('Error loading wallet balance:', error);
            this.showError('Error loading wallet balance');
        }
    }

    async loadWalletSummary() {
        try {
            console.log('Loading wallet summary...');
            const response = await this.api.get('/wallet/summary');
            
            if (response.success) {
                this.updateWalletSummary(response.data);
            } else {
                console.error('Failed to load wallet summary:', response.message);
                this.showError('Failed to load wallet summary');
            }
        } catch (error) {
            console.error('Error loading wallet summary:', error);
            this.showError('Error loading wallet summary');
        }
    }

    updateWalletBalance(data) {
        const element = document.getElementById('wallet-balance');
        if (element) {
            const balance = data.balance || 0;
            element.textContent = this.ui.formatCurrency(balance);
        }
    }

    updateWalletSummary(data) {
        const container = document.getElementById('wallet-summary');
        if (!container) return;

        const summary = data || {};
        
        html = `
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h4>₹${this.ui.formatCurrency(summary.total_balance || 0)}</h4>
                        <p>Total Balance</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📈</div>
                    <div class="summary-content">
                        <h4>₹${this.ui.formatCurrency(summary.total_deposits || 0)}</h4>
                        <p>Total Deposits</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📉</div>
                    <div class="summary-content">
                        <h4>₹${this.ui.formatCurrency(summary.total_withdrawals || 0)}</h4>
                        <p>Total Withdrawals</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🔄</div>
                    <div class="summary-content">
                        <h4>${summary.transaction_count || 0}</h4>
                        <p>Total Transactions</p>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    async topUpWallet(amount) {
        try {
            console.log('Topping up wallet with amount:', amount);
            const response = await this.api.post('/wallet/top-up', { amount: parseFloat(amount) });
            
            if (response.success) {
                this.ui.showSuccess('Wallet topped up successfully!');
                await this.loadWalletBalance();
                await this.loadWalletSummary();
            } else {
                console.error('Failed to top up wallet:', response.message);
                this.ui.showError(response.message || 'Failed to top up wallet');
            }
        } catch (error) {
            console.error('Error topping up wallet:', error);
            this.ui.showError('Error topping up wallet');
        }
    }

    async directTopUp(amountInr) {
        try {
            console.log('Direct top up with INR amount:', amountInr);
            const response = await this.api.post('/wallet/direct-topup', { amount_inr: parseFloat(amountInr) });
            
            if (response.success) {
                this.ui.showSuccess('Direct top up successful!');
                await this.loadWalletBalance();
                await this.loadWalletSummary();
            } else {
                console.error('Failed to direct top up:', response.message);
                this.ui.showError(response.message || 'Failed to direct top up');
            }
        } catch (error) {
            console.error('Error direct top up:', error);
            this.ui.showError('Error direct top up');
        }
    }

    async resetWallet() {
        try {
            console.log('Resetting wallet...');
            const response = await this.api.post('/wallet/reset');
            
            if (response.success) {
                this.ui.showSuccess('Wallet reset successfully!');
                await this.loadWalletBalance();
                await this.loadWalletSummary();
            } else {
                console.error('Failed to reset wallet:', response.message);
                this.ui.showError(response.message || 'Failed to reset wallet');
            }
        } catch (error) {
            console.error('Error resetting wallet:', error);
            this.ui.showError('Error resetting wallet');
        }
    }

    showError(message) {
        this.ui.showError(message);
    }
}

// Global wallet instance
let walletInstance;

// Initialize wallet when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wallet page loaded, initializing...');
    walletInstance = new MotionFalconWallet();
});

// Global functions for wallet actions
function showTopUpModal() {
    const amount = prompt('Enter amount to top up:');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        walletInstance.topUpWallet(amount);
    } else if (amount !== null) {
        walletInstance.ui.showError('Please enter a valid amount');
    }
}

function showDirectTopUpModal() {
    const amount = prompt('Enter INR amount to convert to demo coins (₹1 = 50 coins):');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        walletInstance.directTopUp(amount);
    } else if (amount !== null) {
        walletInstance.ui.showError('Please enter a valid amount');
    }
}

function showResetModal() {
    const confirm = window.confirm('Are you sure you want to reset your wallet to ₹100,000? This action cannot be undone.');
    if (confirm) {
        walletInstance.resetWallet();
    }
}

// Add some CSS for wallet styling
const walletStyles = `
<style>
.wallet-balance {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    color: #fff;
    margin-bottom: 30px;
}

.balance-display {
    text-align: center;
}

.balance-amount {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 10px;
}

.currency {
    font-size: 32px;
    margin-right: 5px;
}

.amount {
    font-size: 48px;
}

.balance-label {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
}

.wallet-actions {
    display: flex;
    gap: 15px;
}

.wallet-actions .btn {
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    border: none;
    transition: all 0.3s ease;
}

.wallet-actions .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.summary-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.summary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.summary-icon {
    font-size: 24px;
    margin-right: 15px;
}

.summary-content h4 {
    margin: 0;
    font-weight: bold;
    color: #333;
    font-size: 18px;
}

.summary-content p {
    margin: 5px 0 0 0;
    font-size: 12px;
    color: #666;
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.action-btn {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #fff;
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;
}

.action-btn:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateX(5px);
}

.action-icon {
    font-size: 24px;
    margin-right: 15px;
    min-width: 30px;
}

.action-text h6 {
    margin: 0;
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.action-text p {
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #666;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .wallet-balance {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }
    
    .wallet-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .summary-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', walletStyles); 