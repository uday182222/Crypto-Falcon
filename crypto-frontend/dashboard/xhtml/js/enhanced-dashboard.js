// Enhanced MotionFalcon Dashboard Integration
// Connects the beautiful frontend with the backend APIs

class EnhancedDashboard {
    constructor() {
        this.api = new MotionFalconAPI();
        this.refreshInterval = null;
        this.chartInstances = {};
        this.currentPrices = {};
        this.userProfile = null;
        this.portfolio = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Enhanced Dashboard...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to login...');
            window.location.href = 'page-login.html';
            return;
        }

        // Show loading overlay
        this.showLoadingOverlay('Loading your dashboard...');

        try {
            // Load all dashboard data
            await this.loadDashboardData();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize charts
            this.initializeCharts();
            
            console.log('✅ Dashboard initialized successfully!');
            
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard. Please refresh the page.');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    async loadDashboardData() {
        console.log('📊 Loading dashboard data...');
        
        // Load data in parallel for better performance
        const [userProfile, portfolio, prices, achievements, leaderboard] = await Promise.all([
            this.loadUserProfile(),
            this.loadPortfolio(),
            this.loadMarketPrices(),
            this.loadAchievements(),
            this.loadLeaderboard()
        ]);

        // Update UI with loaded data
        this.updateUserInterface(userProfile, portfolio, prices, achievements, leaderboard);
    }

    async loadUserProfile() {
        try {
            const response = await this.api.get('/auth/profile');
            this.userProfile = response.data;
            return this.userProfile;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    }

    async loadPortfolio() {
        try {
            const response = await this.api.get('/trade/portfolio');
            this.portfolio = response.data;
            return this.portfolio;
        } catch (error) {
            console.error('Failed to load portfolio:', error);
            return { holdings: [], total_value: 0, total_pnl: 0 };
        }
    }

    async loadMarketPrices() {
        try {
            const response = await this.api.get('/trade/prices');
            this.currentPrices = response.data.prices.reduce((acc, price) => {
                acc[price.symbol] = price;
                return acc;
            }, {});
            return response.data.prices;
        } catch (error) {
            console.error('Failed to load market prices:', error);
            return [];
        }
    }

    async loadAchievements() {
        try {
            const response = await this.api.get('/achievement/user');
            return response.data;
        } catch (error) {
            console.error('Failed to load achievements:', error);
            return [];
        }
    }

    async loadLeaderboard() {
        try {
            const response = await this.api.get('/leaderboard/global');
            return response.data;
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    }

    updateUserInterface(userProfile, portfolio, prices, achievements, leaderboard) {
        // Update user info in header
        this.updateUserInfo(userProfile);
        
        // Update portfolio display
        this.updatePortfolioDisplay(portfolio);
        
        // Update market prices
        this.updateMarketPricesDisplay(prices);
        
        // Update achievements
        this.updateAchievementsDisplay(achievements);
        
        // Update leaderboard
        this.updateLeaderboardDisplay(leaderboard);
        
        // Update navigation
        this.updateNavigation();
    }

    updateUserInfo(user) {
        if (!user) return;

        // Update balance display
        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
            balanceElement.textContent = this.api.formatCurrency(user.demo_balance);
        }

        // Update level display
        const levelElement = document.getElementById('user-level');
        if (levelElement) {
            levelElement.textContent = `Level ${user.level}`;
        }

        // Update user avatar
        const avatarElement = document.getElementById('user-avatar');
        if (avatarElement && user.username) {
            // Generate avatar from username
            const initials = user.username.substring(0, 2).toUpperCase();
            avatarElement.style.backgroundColor = '#9568FF';
            avatarElement.style.color = 'white';
            avatarElement.style.borderRadius = '50%';
            avatarElement.style.display = 'flex';
            avatarElement.style.alignItems = 'center';
            avatarElement.style.justifyContent = 'center';
            avatarElement.style.fontWeight = 'bold';
            avatarElement.textContent = initials;
        }

        // Update page title
        const pageTitleElement = document.getElementById('current-page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = 'Dashboard';
        }
    }

    updatePortfolioDisplay(portfolio) {
        // Update total balance
        const totalBalanceElement = document.getElementById('total-balance');
        if (totalBalanceElement) {
            totalBalanceElement.textContent = this.api.formatCurrency(portfolio.total_value || 0);
        }

        // Update total P&L
        const totalPnLElement = document.getElementById('total-pnl');
        if (totalPnLElement) {
            const pnl = portfolio.total_pnl || 0;
            totalPnLElement.textContent = this.api.formatCurrency(pnl);
            totalPnLElement.style.color = pnl >= 0 ? '#28a745' : '#dc3545';
        }

        // Update holdings display
        this.updateHoldingsDisplay(portfolio.holdings || []);
    }

    updateHoldingsDisplay(holdings) {
        const container = document.getElementById('portfolio-holdings');
        if (!container) return;

        if (holdings.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">No holdings yet. Start trading to build your portfolio!</div>';
            return;
        }

        const holdingsHTML = holdings.map(holding => `
            <div class="holding-item d-flex justify-content-between align-items-center p-3 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="coin-icon me-3">
                        <i class="material-icons text-primary">currency_bitcoin</i>
                    </div>
                    <div>
                        <h6 class="mb-0">${holding.coin_symbol}</h6>
                        <small class="text-muted">${holding.quantity} ${holding.coin_symbol}</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${this.api.formatCurrency(holding.current_value)}</div>
                    <small class="${holding.pnl >= 0 ? 'text-success' : 'text-danger'}">
                        ${holding.pnl >= 0 ? '+' : ''}${this.api.formatCurrency(holding.pnl)}
                    </small>
                </div>
            </div>
        `).join('');

        container.innerHTML = holdingsHTML;
    }

    updateMarketPricesDisplay(prices) {
        // Update market previews
        this.updateMarketPreviews(prices.slice(0, 4));
        
        // Update market overview
        this.updateMarketOverview(prices.slice(0, 5));
        
        // Update trading table
        this.updateTradingTable(prices);
        
        // Update crypto cards
        this.updateCryptoCards(prices.slice(0, 6));
    }

    updateMarketPreviews(prices) {
        const container = document.getElementById('market-previews-container');
        if (!container) return;

        const previewsHTML = prices.map(price => `
            <div class="market-preview-item d-flex justify-content-between align-items-center p-3 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="coin-icon me-2">
                        <i class="material-icons text-success">trending_up</i>
                    </div>
                    <div>
                        <div class="fw-bold">${price.symbol}/USD</div>
                        <small class="text-muted">${new Date().toLocaleDateString()}</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${this.api.formatCurrency(price.price)}</div>
                    <small class="${price.change_24h_percent >= 0 ? 'text-success' : 'text-danger'}">
                        ${price.change_24h_percent >= 0 ? '+' : ''}${price.change_24h_percent.toFixed(2)}%
                    </small>
                </div>
            </div>
        `).join('');

        container.innerHTML = previewsHTML;
    }

    updateMarketOverview(prices) {
        const container = document.getElementById('market-overview-container');
        if (!container) return;

        const overviewHTML = prices.map(price => `
            <div class="market-overview-item d-flex justify-content-between align-items-center p-3 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="coin-icon me-2">
                        <i class="material-icons text-primary">diamond</i>
                    </div>
                    <div>
                        <div class="fw-bold">${price.symbol}/USD</div>
                        <small class="text-muted">${new Date().toLocaleDateString()}</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${this.api.formatCurrency(price.price)}</div>
                    <small class="${price.change_24h_percent >= 0 ? 'text-success' : 'text-danger'}">
                        ${price.change_24h_percent >= 0 ? '+' : ''}${price.change_24h_percent.toFixed(2)}%
                    </small>
                </div>
            </div>
        `).join('');

        container.innerHTML = overviewHTML;
    }

    updateTradingTable(prices) {
        const tbody = document.querySelector('#trading-prices-table tbody');
        if (!tbody) return;

        const tableHTML = prices.map(price => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="material-icons text-primary me-2">currency_bitcoin</i>
                        <div>
                            <div class="fw-bold">${price.symbol}</div>
                            <small class="text-muted">${price.name}</small>
                        </div>
                    </div>
                </td>
                <td class="fw-bold">${this.api.formatCurrency(price.price)}</td>
                <td>
                    <span class="badge ${price.change_24h_percent >= 0 ? 'bg-success' : 'bg-danger'}">
                        ${price.change_24h_percent >= 0 ? '+' : ''}${price.change_24h_percent.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="dashboard.executeTrade('${price.symbol}', 'buy')">
                        Buy
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboard.executeTrade('${price.symbol}', 'sell')">
                        Sell
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = tableHTML;
    }

    updateCryptoCards(prices) {
        const wrapper = document.getElementById('crypto-cards-wrapper');
        if (!wrapper) return;

        const cardsHTML = prices.map(price => `
            <div class="swiper-slide">
                <div class="card crypto-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="d-flex align-items-center">
                                <i class="material-icons text-primary me-2">currency_bitcoin</i>
                                <h6 class="mb-0">${price.symbol}</h6>
                            </div>
                            <span class="badge ${price.change_24h_percent >= 0 ? 'bg-success' : 'bg-danger'}">
                                ${price.change_24h_percent >= 0 ? '+' : ''}${price.change_24h_percent.toFixed(2)}%
                            </span>
                        </div>
                        <h4 class="mb-2">${this.api.formatCurrency(price.price)}</h4>
                        <small class="text-muted">${price.name}</small>
                    </div>
                </div>
            </div>
        `).join('');

        wrapper.innerHTML = cardsHTML;
    }

    updateAchievementsDisplay(achievements) {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        if (achievements.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">No achievements yet. Start trading to unlock achievements!</div>';
            return;
        }

        const achievementsHTML = achievements.map(achievement => `
            <div class="achievement-item d-flex align-items-center p-3 border-bottom">
                <div class="achievement-icon me-3">
                    <i class="material-icons text-warning">emoji_events</i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${achievement.name}</h6>
                    <p class="mb-0 text-muted">${achievement.description}</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">Unlocked</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = achievementsHTML;
    }

    updateLeaderboardDisplay(leaderboard) {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        const leaderboardHTML = leaderboard.slice(0, 10).map((entry, index) => `
            <div class="leaderboard-item d-flex justify-content-between align-items-center p-3 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="rank me-3">
                        <span class="badge ${index < 3 ? 'bg-warning' : 'bg-secondary'}">${index + 1}</span>
                    </div>
                    <div>
                        <h6 class="mb-0">${entry.username}</h6>
                        <small class="text-muted">Level ${entry.level}</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${this.api.formatCurrency(entry.portfolio_value)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = leaderboardHTML;
    }

    updateNavigation() {
        // Update navigation with user info
        const user = this.userProfile;
        if (!user) return;

        // Update any navigation elements that show user info
        const navElements = document.querySelectorAll('[data-user-info]');
        navElements.forEach(element => {
            const infoType = element.dataset.userInfo;
            switch (infoType) {
                case 'username':
                    element.textContent = user.username;
                    break;
                case 'balance':
                    element.textContent = this.api.formatCurrency(user.demo_balance);
                    break;
                case 'level':
                    element.textContent = `Level ${user.level}`;
                    break;
            }
        });
    }

    setupRealTimeUpdates() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000);

        // Also refresh when user becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
    }

    async refreshData() {
        try {
            console.log('🔄 Refreshing dashboard data...');
            
            // Refresh prices and portfolio
            const [portfolio, prices] = await Promise.all([
                this.loadPortfolio(),
                this.loadMarketPrices()
            ]);

            // Update displays
            this.updatePortfolioDisplay(portfolio);
            this.updateMarketPricesDisplay(prices);
            
            console.log('✅ Dashboard data refreshed');
        } catch (error) {
            console.error('❌ Failed to refresh dashboard data:', error);
        }
    }

    setupEventListeners() {
        // Trading form submission
        const tradingForm = document.getElementById('quick-trade-form');
        if (tradingForm) {
            tradingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTradeSubmission();
            });
        }

        // Navigation clicks
        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Logout button
        const logoutBtn = document.querySelector('[onclick="handleLogout()"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    async handleTradeSubmission() {
        const coinSelect = document.getElementById('trade-coin-select');
        const actionSelect = document.getElementById('trade-action-select');
        const amountInput = document.getElementById('trade-amount');

        if (!coinSelect.value || !actionSelect.value || !amountInput.value) {
            this.showError('Please fill in all fields');
            return;
        }

        const tradeData = {
            coin_symbol: coinSelect.value,
            trade_type: actionSelect.value,
            quantity: parseFloat(amountInput.value)
        };

        try {
            this.showLoading('Executing trade...');
            
            const response = await this.api.post('/trade/', tradeData);
            
            this.showSuccess('Trade executed successfully!');
            
            // Refresh portfolio data
            await this.refreshData();
            
            // Reset form
            document.getElementById('quick-trade-form').reset();
            
        } catch (error) {
            this.showError(`Trade failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async executeTrade(coinSymbol, action) {
        const amount = prompt(`Enter amount to ${action} ${coinSymbol}:`);
        if (!amount || isNaN(amount)) return;

        try {
            this.showLoading(`Executing ${action} order...`);
            
            const tradeData = {
                coin_symbol: coinSymbol,
                trade_type: action,
                quantity: parseFloat(amount)
            };

            const response = await this.api.post('/trade/', tradeData);
            
            this.showSuccess(`${action.charAt(0).toUpperCase() + action.slice(1)} order executed!`);
            
            // Refresh data
            await this.refreshData();
            
        } catch (error) {
            this.showError(`Trade failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.dashboard-content');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update active navigation
        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionName) {
                link.classList.add('active');
            }
        });
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.api.logout();
            window.location.href = 'page-login.html';
        }
    }

    initializeCharts() {
        // TradingView widget is handled by tradingview-widget.js
        // The widget will be initialized automatically when the page loads
        console.log('TradingView chart initialization handled by tradingview-widget.js');
    }

    // Method to update TradingView chart symbol
    updateTradingViewSymbol(symbol) {
        if (window.tradingViewWidget) {
            window.tradingViewWidget.changeSymbol(symbol);
        }
    }

    // Method to update TradingView chart timeframe
    updateTradingViewTimeframe(timeframe) {
        if (window.tradingViewWidget) {
            window.tradingViewWidget.changeTimeframe(timeframe);
        }
    }

    showLoadingOverlay(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="spinner-border mb-3" role="status"></div>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showLoading(message = 'Loading...') {
        this.showLoadingOverlay(message);
    }

    hideLoading() {
        this.hideLoadingOverlay();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('index-1.html') || 
        window.location.pathname.includes('dashboard') ||
        window.location.pathname === '/') {
        
        // Initialize the enhanced dashboard
        window.dashboard = new EnhancedDashboard();
    }
});

// Export for global access
window.EnhancedDashboard = EnhancedDashboard; 