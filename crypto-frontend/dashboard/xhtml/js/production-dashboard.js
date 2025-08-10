/**
 * MotionFalcon Production Dashboard
 * Complete frontend solution for all backend features
 */

class MotionFalconDashboard {
    constructor() {
        this.api = new MotionFalconAPI();
        this.currentUser = null;
        this.prices = [];
        this.portfolio = null;
        this.achievements = [];
        this.leaderboard = [];
        this.packages = [];
        this.purchaseHistory = [];
        this.tradeHistory = [];
        this.walletData = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing MotionFalcon Dashboard...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'page-login.html';
            return;
        }

        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showLoginModal();
        }
    }

    async loadUserProfile() {
        try {
            const response = await this.api.getProfile();
            this.currentUser = response;
            this.updateUserDisplay();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            throw error;
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        // Update header displays
        const balanceElement = document.getElementById('user-balance');
        const levelElement = document.getElementById('user-level');
        const avatarElement = document.getElementById('user-avatar');
        
        if (balanceElement) {
            balanceElement.textContent = `$${parseFloat(this.currentUser.demo_balance || 0).toFixed(2)}`;
        }
        
        if (levelElement) {
            levelElement.textContent = `Level ${this.currentUser.level || 1}`;
        }
        
        // Update user avatar if available
        if (avatarElement && this.currentUser.avatar) {
            avatarElement.src = this.currentUser.avatar;
        }
    }

    async loadDashboardData() {
        try {
            // Load all data in parallel for better performance
            await Promise.all([
                this.loadPrices(),
                this.loadPortfolio(),
                this.loadAchievements(),
                this.loadLeaderboard(),
                this.loadPackages(),
                this.loadTradeHistory(),
                this.loadPurchaseHistory(),
                this.loadWalletData()
            ]);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadPrices() {
        try {
            const response = await this.api.getPrices();
            this.prices = response.data || [];
            this.updatePricesDisplay();
        } catch (error) {
            console.error('Failed to load prices:', error);
        }
    }

    async loadPortfolio() {
        try {
            const response = await this.api.getPortfolio();
            this.portfolio = response.data || {};
            this.updatePortfolioDisplay();
        } catch (error) {
            console.error('Failed to load portfolio:', error);
        }
    }

    async loadAchievements() {
        try {
            const response = await this.api.getUserAchievements();
            this.achievements = response.data || [];
            this.updateAchievementsDisplay();
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }

    async loadLeaderboard() {
        try {
            const response = await this.api.getLeaderboard();
            this.leaderboard = response.data || [];
            this.updateLeaderboardDisplay();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    async loadPackages() {
        try {
            const response = await this.api.getPackages();
            this.packages = response.data || [];
            this.updatePackagesDisplay();
        } catch (error) {
            console.error('Failed to load packages:', error);
        }
    }

    async loadTradeHistory() {
        try {
            const response = await this.api.getTradeHistory();
            this.tradeHistory = response.data || [];
            this.updateTradeHistoryDisplay();
        } catch (error) {
            console.error('Failed to load trade history:', error);
        }
    }

    async loadPurchaseHistory() {
        try {
            const response = await this.api.getPurchaseHistory();
            this.purchaseHistory = response.data || [];
            this.updatePurchaseHistoryDisplay();
        } catch (error) {
            console.error('Failed to load purchase history:', error);
        }
    }

    async loadWalletData() {
        try {
            const response = await this.api.getWallet();
            this.walletData = response.data || {};
            this.updateWalletDisplay();
        } catch (error) {
            console.error('Failed to load wallet data:', error);
        }
    }

    updatePricesDisplay() {
        // Update crypto cards with real prices
        const cryptoCards = document.querySelectorAll('.crypto-card');
        cryptoCards.forEach(card => {
            const coinSymbol = card.getAttribute('data-coin');
            const price = this.prices.find(p => p.symbol === coinSymbol);
            
            if (price) {
                const priceElement = card.querySelector('.crypto-price');
                const changeElement = card.querySelector('.crypto-change');
                
                if (priceElement) {
                    priceElement.textContent = `$${parseFloat(price.price).toFixed(2)}`;
                }
                
                if (changeElement) {
                    const change = price.change_percentage || 0;
                    changeElement.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                    changeElement.className = `crypto-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });

        // Update trading prices table
        this.updateTradingPricesTable();
    }

    updateTradingPricesTable() {
        const table = document.getElementById('trading-prices-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        let html = '';
        this.prices.forEach((price, index) => {
            const change = price.change_percentage || 0;
            const changeClass = change >= 0 ? 'text-success' : 'text-danger';
            const changeIcon = change >= 0 ? '↗' : '↘';
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="images/coin/${price.symbol.toLowerCase()}.png" alt="${price.symbol}" class="me-2" style="width: 24px; height: 24px;">
                            <span class="fw-bold">${price.symbol}</span>
                        </div>
                    </td>
                    <td class="fw-bold">$${parseFloat(price.price).toFixed(2)}</td>
                    <td class="${changeClass}">
                        ${changeIcon} ${Math.abs(change).toFixed(2)}%
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="quickTrade('${price.symbol}', 'buy')">Buy</button>
                        <button class="btn btn-sm btn-outline-primary" onclick="quickTrade('${price.symbol}', 'sell')">Sell</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updatePortfolioDisplay() {
        // Update portfolio summary
        const totalValueElement = document.getElementById('portfolio-total-value');
        const totalPnLElement = document.getElementById('portfolio-total-pnl');
        const totalTradesElement = document.getElementById('total-trades');
        
        if (totalValueElement && this.portfolio.total_value !== undefined) {
            totalValueElement.textContent = `$${parseFloat(this.portfolio.total_value).toFixed(2)}`;
        }
        
        if (totalPnLElement && this.portfolio.total_pnl !== undefined) {
            const pnl = parseFloat(this.portfolio.total_pnl);
            totalPnLElement.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
            totalPnLElement.className = `fw-bold ${pnl >= 0 ? 'text-success' : 'text-danger'}`;
        }
        
        if (totalTradesElement && this.portfolio.total_trades !== undefined) {
            totalTradesElement.textContent = this.portfolio.total_trades;
        }

        // Update portfolio holdings table
        this.updatePortfolioHoldingsTable();
    }

    updatePortfolioHoldingsTable() {
        const table = document.getElementById('portfolio-holdings-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (!this.portfolio.holdings || this.portfolio.holdings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No holdings available</td></tr>';
            return;
        }

        let html = '';
        this.portfolio.holdings.forEach(holding => {
            const pnl = parseFloat(holding.pnl || 0);
            const pnlClass = pnl >= 0 ? 'text-success' : 'text-danger';
            const pnlIcon = pnl >= 0 ? '↗' : '↘';
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="images/coin/${holding.symbol.toLowerCase()}.png" alt="${holding.symbol}" class="me-2" style="width: 24px; height: 24px;">
                            <span class="fw-bold">${holding.symbol}</span>
                        </div>
                    </td>
                    <td>${parseFloat(holding.quantity).toFixed(4)}</td>
                    <td>$${parseFloat(holding.current_value).toFixed(2)}</td>
                    <td class="${pnlClass}">
                        ${pnlIcon} $${Math.abs(pnl).toFixed(2)}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="quickTrade('${holding.symbol}', 'buy')">Buy More</button>
                        <button class="btn btn-sm btn-outline-primary" onclick="quickTrade('${holding.symbol}', 'sell')">Sell</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateTradeHistoryDisplay() {
        const table = document.getElementById('trade-history-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (!this.tradeHistory || this.tradeHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No trade history available</td></tr>';
            return;
        }

        let html = '';
        this.tradeHistory.forEach(trade => {
            const tradeType = trade.trade_type || 'buy';
            const typeClass = tradeType === 'buy' ? 'text-success' : 'text-danger';
            const typeIcon = tradeType === 'buy' ? '↗' : '↘';
            
            html += `
                <tr>
                    <td>${new Date(trade.created_at).toLocaleDateString()}</td>
                    <td class="${typeClass}">
                        ${typeIcon} ${tradeType.toUpperCase()}
                    </td>
                    <td>${trade.coin_symbol}</td>
                    <td>${parseFloat(trade.quantity).toFixed(4)}</td>
                    <td>$${parseFloat(trade.price).toFixed(2)}</td>
                    <td>$${parseFloat(trade.total_amount).toFixed(2)}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateLeaderboardDisplay() {
        // Update global leaderboard
        this.updateGlobalLeaderboard();
        
        // Update weekly leaderboard
        this.updateWeeklyLeaderboard();
    }

    updateGlobalLeaderboard() {
        const table = document.getElementById('global-leaderboard-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (!this.leaderboard.global || this.leaderboard.global.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No leaderboard data available</td></tr>';
            return;
        }

        let html = '';
        this.leaderboard.global.forEach((user, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="images/avatar/${user.avatar || 'default.jpg'}" alt="${user.username}" class="rounded-circle me-2" style="width: 32px; height: 32px;">
                            <span>${user.username}</span>
                        </div>
                    </td>
                    <td>$${parseFloat(user.balance).toFixed(2)}</td>
                    <td>Level ${user.level || 1}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateWeeklyLeaderboard() {
        const table = document.getElementById('weekly-leaderboard-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (!this.leaderboard.weekly || this.leaderboard.weekly.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No weekly data available</td></tr>';
            return;
        }

        let html = '';
        this.leaderboard.weekly.forEach((user, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="images/avatar/${user.avatar || 'default.jpg'}" alt="${user.username}" class="rounded-circle me-2" style="width: 32px; height: 32px;">
                            <span>${user.username}</span>
                        </div>
                    </td>
                    <td>$${parseFloat(user.balance).toFixed(2)}</td>
                    <td>Level ${user.level || 1}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateAchievementsDisplay() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        if (!this.achievements || this.achievements.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No achievements available</p></div>';
            return;
        }

        let html = '';
        this.achievements.forEach(achievement => {
            const isCompleted = achievement.is_completed;
            const progress = achievement.current_progress || 0;
            const requirement = achievement.requirement_value || 1;
            const progressPercent = Math.min((progress / requirement) * 100, 100);
            
            html += `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card achievement-card ${isCompleted ? 'completed' : 'in-progress'}">
                        <div class="card-body text-center">
                            <div class="achievement-icon mb-3">
                                ${achievement.icon || '🏆'}
                            </div>
                            <h6 class="achievement-name">${achievement.name}</h6>
                            <p class="achievement-description text-muted">${achievement.description}</p>
                            <div class="achievement-progress">
                                <div class="progress">
                                    <div class="progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}" 
                                         style="width: ${progressPercent}%"></div>
                                </div>
                                <small class="text-muted">${progress}/${requirement}</small>
                            </div>
                            ${isCompleted ? '<span class="badge bg-success mt-2">Completed!</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
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
            html += `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card package-card">
                        <div class="card-body text-center">
                            <h5 class="card-title">${package.name}</h5>
                            <div class="package-price mb-3">
                                <h3 class="text-primary">₹${parseFloat(package.price).toFixed(2)}</h3>
                                <p class="text-muted">${package.coins} Coins</p>
                            </div>
                            <ul class="list-unstyled mb-3">
                                ${package.features ? package.features.map(feature => `<li>✓ ${feature}</li>`).join('') : ''}
                            </ul>
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
            html += `
                <tr>
                    <td>${new Date(purchase.created_at).toLocaleDateString()}</td>
                    <td>${purchase.package_name}</td>
                    <td>${purchase.coins} Coins</td>
                    <td>₹${parseFloat(purchase.amount).toFixed(2)}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateWalletDisplay() {
        if (!this.walletData) return;

        const demoBalanceElement = document.getElementById('wallet-demo-balance');
        const totalValueElement = document.getElementById('wallet-total-value');
        const availableElement = document.getElementById('wallet-available');
        
        if (demoBalanceElement) {
            demoBalanceElement.textContent = `$${parseFloat(this.walletData.balance || 0).toFixed(2)}`;
        }
        
        if (totalValueElement) {
            totalValueElement.textContent = `$${parseFloat(this.walletData.total_value || 0).toFixed(2)}`;
        }
        
        if (availableElement) {
            availableElement.textContent = `$${parseFloat(this.walletData.available_balance || 0).toFixed(2)}`;
        }
    }

    setupEventListeners() {
        // Setup trading form
        const tradingForm = document.getElementById('trading-form');
        if (tradingForm) {
            tradingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.executeQuickTrade();
            });
        }

        // Setup coin select
        this.populateCoinSelect();

        // Setup refresh buttons
        const refreshButtons = document.querySelectorAll('[onclick*="refresh"]');
        refreshButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.refreshData();
            });
        });
    }

    populateCoinSelect() {
        const coinSelect = document.getElementById('coin-select');
        if (!coinSelect) return;

        let html = '<option value="">Select Coin</option>';
        this.prices.forEach(price => {
            html += `<option value="${price.symbol}">${price.symbol}</option>`;
        });

        coinSelect.innerHTML = html;
    }

    async executeQuickTrade() {
        const coinSelect = document.getElementById('coin-select');
        const quantityInput = document.getElementById('trade-quantity');
        const tradeType = document.querySelector('input[name="trade-type"]:checked');

        if (!coinSelect.value || !quantityInput.value || !tradeType) {
            this.showAlert('Please fill in all fields', 'warning');
            return;
        }

        const tradeData = {
            coin_symbol: coinSelect.value,
            trade_type: tradeType.value,
            quantity: parseFloat(quantityInput.value)
        };

        try {
            const response = await this.api.executeTrade(tradeData);
            
            if (response.success) {
                this.showAlert('Trade executed successfully!', 'success');
                // Refresh data
                await this.refreshData();
            } else {
                this.showAlert(response.message || 'Trade failed', 'error');
            }
        } catch (error) {
            console.error('Trade execution failed:', error);
            this.showAlert('Trade execution failed', 'error');
        }
    }

    async quickTrade(coin, action) {
        const quantity = prompt(`Enter quantity to ${action} ${coin}:`);
        if (!quantity || isNaN(quantity)) return;

        try {
            const response = await this.api.executeTrade({
                coin_symbol: coin,
                trade_type: action,
                quantity: parseFloat(quantity)
            });
            
            if (response.success) {
                this.showAlert(`${action.toUpperCase()} order executed successfully!`, 'success');
                await this.refreshData();
            } else {
                this.showAlert(response.message || `${action.toUpperCase()} failed`, 'error');
            }
        } catch (error) {
            console.error('Quick trade failed:', error);
            this.showAlert('Quick trade failed', 'error');
        }
    }

    async buyPackage(packageId) {
        try {
            const response = await this.api.createOrder(packageId);
            
            if (response.success) {
                this.showAlert('Package purchased successfully!', 'success');
                await this.refreshData();
            } else {
                this.showAlert(response.message || 'Purchase failed', 'error');
            }
        } catch (error) {
            console.error('Package purchase failed:', error);
            this.showAlert('Package purchase failed', 'error');
        }
    }

    async refreshData() {
        try {
            await this.loadDashboardData();
            this.showAlert('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Data refresh failed:', error);
            this.showAlert('Failed to refresh data', 'error');
        }
    }

    startRealTimeUpdates() {
        // Update prices every 30 seconds
        setInterval(async () => {
            try {
                await this.loadPrices();
            } catch (error) {
                console.error('Failed to update prices:', error);
            }
        }, 30000);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showLoginModal() {
        window.location.href = 'page-login.html';
    }

    // Section navigation methods
    showDashboard() {
        this.showSection('dashboard-section');
    }

    showTrading() {
        this.showSection('trading-section');
    }

    showPortfolio() {
        this.showSection('portfolio-section');
    }

    showHistory() {
        this.showSection('history-section');
    }

    showLeaderboard() {
        this.showSection('leaderboard-section');
    }

    showAchievements() {
        this.showSection('achievements-section');
    }

    showWallet() {
        this.showSection('wallet-section');
    }

    showPurchases() {
        window.location.href = 'packages.html';
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.dashboard-content');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update active nav item
        const navItems = document.querySelectorAll('#menu li a');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Find and activate the corresponding nav item
        const activeNavItem = document.querySelector(`[onclick*="${sectionId.replace('-section', '')}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    async refreshWallet() {
        try {
            await this.loadWalletData();
            this.showAlert('Wallet refreshed successfully!', 'success');
        } catch (error) {
            console.error('Wallet refresh failed:', error);
            this.showAlert('Failed to refresh wallet', 'error');
        }
    }

    async handleLogout() {
        this.api.logout();
        window.location.href = 'page-login.html';
    }

    showProfile() {
        // Implement profile modal or redirect
        this.showAlert('Profile feature coming soon!', 'info');
    }

    showSettings() {
        // Implement settings modal or redirect
        this.showAlert('Settings feature coming soon!', 'info');
    }
}

// Initialize dashboard
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new MotionFalconDashboard();
});

// Global functions for onclick handlers
function showDashboard() { dashboard.showDashboard(); }
function showTrading() { dashboard.showTrading(); }
function showPortfolio() { dashboard.showPortfolio(); }
function showHistory() { dashboard.showHistory(); }
function showLeaderboard() { dashboard.showLeaderboard(); }
function showAchievements() { dashboard.showAchievements(); }
function showWallet() { dashboard.showWallet(); }
function showPurchases() { dashboard.showPurchases(); }
function showProfile() { dashboard.showProfile(); }
function showSettings() { dashboard.showSettings(); }
function handleLogout() { dashboard.handleLogout(); }
function refreshWallet() { dashboard.refreshWallet(); }
function quickTrade(coin, action) { dashboard.quickTrade(coin, action); }
function buyPackage(packageId) { dashboard.buyPackage(packageId); } 