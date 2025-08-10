// MotionFalcon Packages Integration
class MotionFalconPackages {
    constructor() {
        this.api = new MotionFalconAPI();
        this.ui = new MotionFalconUI();
        this.packages = [];
        this.purchaseHistory = [];
        this.init();
    }

    async init() {
        console.log('Initializing packages...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'page-login.html';
            return;
        }

        // Load all packages data
        await this.loadPackages();
        await this.loadPurchaseHistory();
        this.setupEventListeners();
    }

    async loadPackages() {
        try {
            console.log('Loading packages...');
            const response = await this.api.getPackages();
            
            if (response.success) {
                this.packages = response.data || [];
                this.updatePackagesDisplay();
            } else {
                console.error('Failed to load packages:', response.message);
                this.showError('Failed to load packages');
            }
        } catch (error) {
            console.error('Error loading packages:', error);
            this.showError('Error loading packages');
        }
    }

    async loadPurchaseHistory() {
        try {
            console.log('Loading purchase history...');
            const response = await this.api.getPurchaseHistory();
            
            if (response.success) {
                this.purchaseHistory = response.data || [];
                this.updatePurchaseHistoryDisplay();
            } else {
                console.error('Failed to load purchase history:', response.message);
                this.showError('Failed to load purchase history');
            }
        } catch (error) {
            console.error('Error loading purchase history:', error);
            this.showError('Error loading purchase history');
        }
    }

    updatePackagesDisplay() {
        const container = document.getElementById('packages-container');
        if (!container) return;

        if (!this.packages || this.packages.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No packages available</p></div>';
            return;
        }

        let html = '';
        this.packages.forEach(package => {
            const features = package.features || [];
            const featuresHtml = features.map(feature => `<li>✓ ${feature}</li>`).join('');
            
            html += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card package-card h-100">
                        <div class="card-header text-center bg-primary text-white">
                            <h5 class="card-title mb-0">${package.name}</h5>
                        </div>
                        <div class="card-body text-center">
                            <div class="package-price mb-4">
                                <h2 class="text-primary mb-1">₹${parseFloat(package.price).toFixed(2)}</h2>
                                <p class="text-muted mb-0">${package.coins} Coins</p>
                            </div>
                            ${featuresHtml ? `<ul class="list-unstyled mb-4">${featuresHtml}</ul>` : ''}
                            <div class="package-description mb-4">
                                <p class="text-muted">${package.description || 'Get started with crypto trading'}</p>
                            </div>
                            <button class="btn btn-primary w-100" onclick="buyPackage(${package.id})">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    updatePurchaseHistoryDisplay() {
        const table = document.getElementById('purchase-history-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (!this.purchaseHistory || this.purchaseHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No purchase history available</td></tr>';
            return;
        }

        let html = '';
        this.purchaseHistory.forEach(purchase => {
            const date = new Date(purchase.created_at).toLocaleDateString();
            const statusClass = purchase.status === 'completed' ? 'success' : 
                              purchase.status === 'pending' ? 'warning' : 'danger';
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${purchase.package_name}</td>
                    <td>${purchase.coins} Coins</td>
                    <td>₹${parseFloat(purchase.amount).toFixed(2)}</td>
                    <td><span class="badge bg-${statusClass}">${purchase.status}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    async buyPackage(packageId) {
        try {
            console.log('Buying package:', packageId);
            
            // Show loading state
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Processing...';
            button.disabled = true;

            const response = await this.api.createOrder(packageId);
            
            if (response.success) {
                this.showSuccess('Package purchased successfully!');
                
                // Refresh data
                await this.loadPackages();
                await this.loadPurchaseHistory();
                
                // Update wallet balance if available
                this.updateWalletBalance();
            } else {
                this.showError(response.message || 'Purchase failed');
            }
        } catch (error) {
            console.error('Package purchase failed:', error);
            this.showError('Package purchase failed');
        } finally {
            // Reset button state
            const button = event.target;
            button.textContent = 'Buy Now';
            button.disabled = false;
        }
    }

    async updateWalletBalance() {
        try {
            const response = await this.api.getWallet();
            if (response.success && response.data) {
                const balanceElement = document.getElementById('wallet-balance');
                if (balanceElement) {
                    balanceElement.textContent = `$${parseFloat(response.data.balance || 0).toFixed(2)}`;
                }
            }
        } catch (error) {
            console.error('Failed to update wallet balance:', error);
        }
    }

    setupEventListeners() {
        // Setup refresh buttons
        const refreshButtons = document.querySelectorAll('[onclick*="refresh"]');
        refreshButtons.forEach(button => {
            button.addEventListener('click', async () => {
                await this.refreshData();
            });
        });

        // Setup search functionality
        const searchInput = document.getElementById('package-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPackages(e.target.value);
            });
        }
    }

    async refreshData() {
        try {
            await Promise.all([
                this.loadPackages(),
                this.loadPurchaseHistory()
            ]);
            this.showSuccess('Data refreshed successfully!');
        } catch (error) {
            console.error('Data refresh failed:', error);
            this.showError('Failed to refresh data');
        }
    }

    filterPackages(searchTerm) {
        const packageCards = document.querySelectorAll('.package-card');
        
        packageCards.forEach(card => {
            const packageName = card.querySelector('.card-title').textContent.toLowerCase();
            const packageDesc = card.querySelector('.package-description p').textContent.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            if (packageName.includes(searchLower) || packageDesc.includes(searchLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showSuccess(message) {
        this.ui.showSuccess(message);
    }

    showError(message) {
        this.ui.showError(message);
    }

    showInfo(message) {
        this.ui.showNotification(message, 'info');
    }
}

// Initialize packages
let packages;

document.addEventListener('DOMContentLoaded', () => {
    packages = new MotionFalconPackages();
});

// Global functions for onclick handlers
function buyPackage(packageId) {
    if (packages) {
        packages.buyPackage(packageId);
    }
}

function refreshPackages() {
    if (packages) {
        packages.refreshData();
    }
}

function searchPackages() {
    const searchInput = document.getElementById('package-search');
    if (searchInput && packages) {
        packages.filterPackages(searchInput.value);
    }
} 