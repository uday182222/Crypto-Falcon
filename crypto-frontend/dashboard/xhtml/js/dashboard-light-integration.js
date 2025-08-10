// MotionFalcon Dashboard Light Integration
// Enhances the existing light theme dashboard with backend features

class DashboardLightIntegration {
    constructor() {
        this.currentUser = null;
        this.portfolio = null;
        this.prices = [];
        this.achievements = [];
        this.tradeHistory = [];
        this.leaderboard = [];
        this.refreshInterval = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Dashboard Light Integration...');
            
            // Check authentication
            if (!api.isAuthenticated()) {
                console.log('User not authenticated, redirecting to login...');
                this.redirectToLogin();
                return;
            }

            // Load initial data
            await this.loadInitialData();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Initialize UI enhancements
            this.initializeUIEnhancements();
            
            this.isInitialized = true;
            console.log('✅ Dashboard Light Integration initialized successfully');
            
        } catch (error) {
            console.error('❌ Dashboard Light Integration initialization failed:', error);
            this.showError('Failed to initialize dashboard integration. Please refresh the page.');
        }
    }

    async loadInitialData() {
        console.log('📊 Loading initial data for light dashboard...');
        
        const promises = [
            this.loadUserProfile(),
            this.loadPortfolio(),
            this.loadPrices(),
            this.loadAchievements(),
            this.loadTradeHistory(),
            this.loadLeaderboard()
        ];

        await Promise.allSettled(promises);
        console.log('✅ Initial data loaded for light dashboard');
    }

    async loadUserProfile() {
        try {
            this.currentUser = await api.getProfile();
            this.updateUserInfo();
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    async loadPortfolio() {
        try {
            this.portfolio = await api.getPortfolio();
            this.updatePortfolioDisplay();
        } catch (error) {
            console.error('Failed to load portfolio:', error);
        }
    }

    async loadPrices() {
        try {
            const response = await api.getPrices();
            this.prices = response.prices || [];
            this.updatePricesDisplay();
        } catch (error) {
            console.error('Failed to load prices:', error);
        }
    }

    async loadAchievements() {
        try {
            this.achievements = await api.getUserAchievements();
            this.updateAchievementsDisplay();
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }

    async loadTradeHistory() {
        try {
            this.tradeHistory = await api.getTradeHistory();
            this.updateTradeHistoryDisplay();
        } catch (error) {
            console.error('Failed to load trade history:', error);
        }
    }

    async loadLeaderboard() {
        try {
            this.leaderboard = await api.getLeaderboard();
            this.updateLeaderboardDisplay();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    setupRealTimeUpdates() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(async () => {
            await this.refreshData();
        }, 30000);

        console.log('🔄 Real-time updates enabled (30s interval)');
    }

    async refreshData() {
        console.log('🔄 Refreshing light dashboard data...');
        
        const promises = [
            this.loadPortfolio(),
            this.loadPrices()
        ];

        await Promise.allSettled(promises);
    }

    initializeUIEnhancements() {
        // Add trading functionality to existing elements
        this.addTradingFunctionality();
        
        // Add portfolio updates to existing cards
        this.updatePortfolioCards();
        
        // Add price updates to existing price elements
        this.updatePriceElements();
        
        // Add achievement notifications
        this.addAchievementNotifications();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    addTradingFunctionality() {
        // Add quick trading buttons to price cards
        const priceCards = document.querySelectorAll('.market-preview');
        priceCards.forEach((card, index) => {
            if (this.prices[index]) {
                const price = this.prices[index];
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'mt-2';
                actionsDiv.innerHTML = `
                    <button class="btn btn-sm btn-primary me-1" onclick="dashboardLight.quickTrade('${price.symbol}', 'buy')">Buy</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboardLight.quickTrade('${price.symbol}', 'sell')">Sell</button>
                `;
                card.appendChild(actionsDiv);
            }
        });
    }

    updatePortfolioCards() {
        if (!this.portfolio) return;

        // Update portfolio value in existing cards
        const portfolioValueElements = document.querySelectorAll('.portfolio-value');
        portfolioValueElements.forEach(el => {
            el.textContent = api.formatCurrency(this.portfolio.total_portfolio_value);
        });

        // Update profit/loss in existing cards
        const profitLossElements = document.querySelectorAll('.profit-loss');
        profitLossElements.forEach(el => {
            const pnl = this.portfolio.total_profit_loss;
            const pnlPercent = this.portfolio.total_profit_loss_percent;
            const isPositive = pnl >= 0;
            
            el.textContent = `${isPositive ? '+' : ''}${api.formatCurrency(pnl)} (${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}%)`;
            el.className = isPositive ? 'text-success' : 'text-danger';
        });
    }

    updatePriceElements() {
        if (!this.prices || this.prices.length === 0) return;

        // Update price elements in existing dashboard
        this.prices.forEach((price, index) => {
            const priceElements = document.querySelectorAll(`[data-coin="${price.symbol}"]`);
            priceElements.forEach(el => {
                el.textContent = api.formatCurrency(price.price);
            });

            const changeElements = document.querySelectorAll(`[data-coin-change="${price.symbol}"]`);
            changeElements.forEach(el => {
                const isPositive = price.change_24h_percent >= 0;
                el.textContent = `${isPositive ? '+' : ''}${price.change_24h_percent.toFixed(2)}%`;
                el.className = isPositive ? 'text-success' : 'text-danger';
            });
        });
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        // Update user name in existing elements
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.username || 'User';
        });

        // Update user level in existing elements
        const userLevelElements = document.querySelectorAll('.user-level');
        userLevelElements.forEach(el => {
            el.textContent = `Level ${this.currentUser.level || 1}`;
        });
    }

    updatePortfolioDisplay() {
        if (!this.portfolio) return;

        // Update portfolio summary in existing dashboard
        const totalValueEl = document.getElementById('total-portfolio-value');
        if (totalValueEl) {
            totalValueEl.textContent = api.formatCurrency(this.portfolio.total_portfolio_value);
        }

        const totalInvestedEl = document.getElementById('total-invested');
        if (totalInvestedEl) {
            totalInvestedEl.textContent = api.formatCurrency(this.portfolio.total_invested);
        }

        const totalProfitLossEl = document.getElementById('total-profit-loss');
        if (totalProfitLossEl) {
            const pnl = this.portfolio.total_profit_loss;
            const pnlPercent = this.portfolio.total_profit_loss_percent;
            const isPositive = pnl >= 0;
            
            totalProfitLossEl.textContent = `${isPositive ? '+' : ''}${api.formatCurrency(pnl)} (${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}%)`;
            totalProfitLossEl.className = isPositive ? 'text-success' : 'text-danger';
        }

        // Update holdings in existing tables
        this.updateHoldingsTable();
    }

    updateHoldingsTable() {
        if (!this.portfolio || !this.portfolio.holdings) return;

        const holdingsTable = document.getElementById('holdings-table');
        if (!holdingsTable) return;

        const tbody = holdingsTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.portfolio.holdings.forEach(holding => {
            const row = document.createElement('tr');
            const isPositive = holding.profit_loss >= 0;
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="images/coin.png" alt="${holding.coin_symbol}" class="me-2" style="width: 24px; height: 24px;">
                        <span class="fw-bold">${holding.coin_symbol}</span>
                    </div>
                </td>
                <td>${holding.quantity.toFixed(6)}</td>
                <td>${api.formatCurrency(holding.current_price)}</td>
                <td>${api.formatCurrency(holding.current_value)}</td>
                <td>${api.formatCurrency(holding.avg_buy_price)}</td>
                <td class="${isPositive ? 'text-success' : 'text-danger'}">
                    ${isPositive ? '+' : ''}${api.formatCurrency(holding.profit_loss)} (${isPositive ? '+' : ''}${holding.profit_loss_percent.toFixed(2)}%)
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updatePricesDisplay() {
        if (!this.prices || this.prices.length === 0) return;

        // Update price cards in existing dashboard
        this.prices.slice(0, 6).forEach((price, index) => {
            const cardId = `price-card-${index + 1}`;
            const card = document.getElementById(cardId);
            
            if (card) {
                const symbolEl = card.querySelector('.price-symbol');
                const priceEl = card.querySelector('.price-value');
                const changeEl = card.querySelector('.price-change');
                
                if (symbolEl) symbolEl.textContent = price.symbol;
                if (priceEl) priceEl.textContent = api.formatCurrency(price.price);
                
                if (changeEl) {
                    const isPositive = price.change_24h_percent >= 0;
                    changeEl.textContent = `${isPositive ? '+' : ''}${price.change_24h_percent.toFixed(2)}%`;
                    changeEl.className = isPositive ? 'text-success' : 'text-danger';
                }
            }
        });

        // Update price table if exists
        this.updatePricesTable();
        
        // Update market previews and overview
        this.updateMarketPreviews();
        this.updateMarketOverview();
    }

    updatePricesTable() {
        const pricesTable = document.getElementById('prices-table');
        if (!pricesTable) return;

        const tbody = pricesTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.prices.forEach(price => {
            const row = document.createElement('tr');
            const isPositive = price.change_24h_percent >= 0;
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="images/coin.png" alt="${price.symbol}" class="me-2" style="width: 24px; height: 24px;">
                        <span class="fw-bold">${price.symbol}</span>
                        <small class="text-muted ms-1">${price.name}</small>
                    </div>
                </td>
                <td class="fw-bold">${api.formatCurrency(price.price)}</td>
                <td class="${isPositive ? 'text-success' : 'text-danger'}">
                    ${isPositive ? '+' : ''}${api.formatCurrency(price.change_24h)} (${isPositive ? '+' : ''}${price.change_24h_percent.toFixed(2)}%)
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboardLight.quickTrade('${price.symbol}', 'buy')">Buy</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboardLight.quickTrade('${price.symbol}', 'sell')">Sell</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateAchievementsDisplay() {
        if (!this.achievements || this.achievements.length === 0) return;

        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;

        achievementsContainer.innerHTML = '';

        this.achievements.forEach(achievement => {
            const isUnlocked = achievement.unlocked;
            const card = document.createElement('div');
            card.className = `col-lg-4 col-md-6 mb-3`;
            
            card.innerHTML = `
                <div class="card ${isUnlocked ? 'border-success' : 'border-secondary'}">
                    <div class="card-body text-center">
                        <div class="achievement-icon mb-3">
                            <i class="fas fa-${achievement.icon || 'trophy'}" style="font-size: 2rem; color: ${isUnlocked ? '#28a745' : '#6c757d'};"></i>
                        </div>
                        <h6 class="card-title">${achievement.title}</h6>
                        <p class="card-text small">${achievement.description}</p>
                        ${isUnlocked ? 
                            `<span class="badge bg-success">Unlocked</span>` : 
                            `<span class="badge bg-secondary">Locked</span>`
                        }
                    </div>
                </div>
            `;
            
            achievementsContainer.appendChild(card);
        });
    }

    updateTradeHistoryDisplay() {
        if (!this.tradeHistory || this.tradeHistory.length === 0) return;

        const historyTable = document.getElementById('trade-history-table');
        if (!historyTable) return;

        const tbody = historyTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.tradeHistory.slice(0, 10).forEach(trade => {
            const row = document.createElement('tr');
            const isBuy = trade.side === 'buy';
            
            row.innerHTML = `
                <td>
                    <span class="badge ${isBuy ? 'bg-success' : 'bg-danger'}">${trade.side.toUpperCase()}</span>
                </td>
                <td>${trade.coin_symbol}</td>
                <td>${trade.quantity.toFixed(6)}</td>
                <td>${api.formatCurrency(trade.price_at_trade)}</td>
                <td>${api.formatCurrency(trade.total_cost)}</td>
                <td>${new Date(trade.timestamp).toLocaleString()}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateLeaderboardDisplay() {
        if (!this.leaderboard || this.leaderboard.length === 0) return;

        const leaderboardTable = document.getElementById('leaderboard-table');
        if (!leaderboardTable) return;

        const tbody = leaderboardTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.leaderboard.forEach((user, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-${index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'danger' : 'primary'} me-2">${index + 1}</span>
                        <img src="images/avatar/${user.avatar || '1.jpg'}" alt="${user.username}" class="rounded-circle me-2" style="width: 32px; height: 32px;">
                        <span class="fw-bold">${user.username}</span>
                    </div>
                </td>
                <td>Level ${user.level}</td>
                <td>${api.formatCurrency(user.total_value)}</td>
                <td>${user.total_trades}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateMarketPreviews() {
        if (!this.prices || this.prices.length === 0) {
            return;
        }

        const container = document.getElementById('market-previews-container');
        if (!container) {
            console.log('Market previews container not found');
            return;
        }

        const previewsHTML = this.prices.slice(0, 4).map(price => {
            const changePercent = price.change_percentage || 0;
            const isPositive = changePercent >= 0;
            const bgClass = isPositive ? 'bg-success' : 'bg-danger';
            const textClass = isPositive ? 'text-success' : 'text-danger';
            
            return `
                <div class="previews-info-list">
                    <div class="pre-icon">
                        <span class="icon-box icon-box-sm ${bgClass}">
                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5 13.7222H7.72226C7.44585 13.7236 7.17885 13.6219 6.9734 13.437C6.76794 13.2521 6.63878 12.9972 6.61115 12.7222L6.9667 9.05553L10.2445 8.16664C10.5392 8.08707 10.7902 7.8937 10.9423 7.62907C11.0944 7.36443 11.1352 7.05021 11.0556 6.75553C10.976 6.46084 10.7827 6.20983 10.518 6.05772C10.2534 5.90561 9.93916 5.86485 9.64448 5.94442L7.21115 6.6333L7.72226 1.61108C7.75173 1.3164 7.66292 1.02208 7.47539 0.792865C7.28785 0.563654 7.01694 0.418329 6.72226 0.38886C6.42757 0.359392 6.13325 0.448194 5.90404 0.63573C5.67483 0.823266 5.5295 1.09418 5.50004 1.38886L4.91115 7.3333L1.8667 8.16664C1.57202 8.20642 1.30521 8.36164 1.12496 8.59814C0.944719 8.83464 0.865809 9.13306 0.905592 9.42775C0.945374 9.72243 1.10059 9.98925 1.33709 10.1695C1.5736 10.3497 1.87202 10.4286 2.1667 10.3889C2.26605 10.405 2.36736 10.405 2.4667 10.3889L4.68893 9.75553L4.38892 12.6111C4.38892 13.4951 4.74011 14.343 5.36523 14.9681C5.99036 15.5932 6.8382 15.9444 7.72226 15.9444H15.5C15.7947 15.9444 16.0773 15.8274 16.2857 15.619C16.4941 15.4106 16.6111 15.128 16.6111 14.8333C16.6111 14.5386 16.4941 14.256 16.2857 14.0476C16.0773 13.8393 15.7947 13.7222 15.5 13.7222Z" fill="#FCFCFC"></path>
                            </svg>	
                        </span>
                        <div class="ms-2">
                            <h6>${price.coin_symbol}/USD</h6>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="count">
                        <h6>${price.price ? parseFloat(price.price).toFixed(2) : '0.00'}</h6>
                        <span class="${textClass}">${changePercent.toFixed(2)}%</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = previewsHTML;
    }

    updateMarketOverview() {
        if (!this.prices || this.prices.length === 0) {
            return;
        }

        const container = document.getElementById('market-overview-container');
        if (!container) {
            console.log('Market overview container not found');
            return;
        }

        const overviewHTML = this.prices.slice(0, 6).map(price => {
            const changePercent = price.change_percentage || 0;
            const isPositive = changePercent >= 0;
            
            return `
                <div class="d-flex justify-content-between align-items-center market-preview-3">
                    <div class="d-flex align-items-center">
                        <span>
                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.6654 24.2783C21.2382 24.4206 20.7623 24.4206 20.3351 24.2783L15.7502 22.75L21.0002 31.5L26.2502 22.75L21.6654 24.2783Z" fill="#00ADA3"/>
                                <path d="M21.0002 21L26.2502 18.9001L21.0002 10.5L15.7502 18.9001L21.0002 21Z" fill="#00ADA3"/>
                                <path d="M21.0001 0C9.40216 0 0.00012207 9.40204 0.00012207 21C0.00012207 32.5979 9.40216 41.9999 21.0001 41.9999C32.598 41.9999 42.0001 32.5979 42.0001 21C41.9873 9.40753 32.5925 0.0128174 21.0001 0ZM29.8418 20.171L22.3418 35.171C21.9715 35.9121 21.0701 36.2124 20.3295 35.8421C20.0388 35.697 19.8035 35.4617 19.6584 35.171L12.1584 20.171C11.9254 19.7031 11.9519 19.1479 12.2284 18.7043L19.7284 6.70443C20.2269 6.00222 21.1997 5.8365 21.9019 6.33501C22.0452 6.43664 22.1701 6.56115 22.2718 6.70443L29.7713 18.7043C30.0483 19.1479 30.0748 19.7031 29.8418 20.171Z" fill="#00ADA3"/>
                            </svg>
                        </span>
                        <div class="ms-3">
                            <a href="javascript:void(0);"><h5 class="fs-14 font-w600 mb-0">${price.coin_symbol}/USD</h5></a>
                            <span class="fs-12 font-w400">${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>	
                    <div class="d-flex align-items-center">
                        <span class="peity-line" data-width="100%">8,3,8,6,5,3,5,7,5</span>
                    </div>	
                </div>
            `;
        }).join('');

        container.innerHTML = overviewHTML;
    }

    addAchievementNotifications() {
        // Add achievement notification system
        if (this.achievements) {
            const newAchievements = this.achievements.filter(a => a.unlocked && !a.notified);
            newAchievements.forEach(achievement => {
                this.showNotification(`🎉 Achievement Unlocked: ${achievement.title}!`, 'success');
                achievement.notified = true;
            });
        }
    }

    quickTrade(symbol, side) {
        const amount = prompt(`Enter amount of ${symbol} to ${side}:`);
        if (!amount || isNaN(amount)) return;

        if (side === 'buy') {
            this.handleQuickBuy(symbol, parseFloat(amount));
        } else {
            this.handleQuickSell(symbol, parseFloat(amount));
        }
    }

    async handleQuickBuy(symbol, amount) {
        try {
            await api.buyCrypto(symbol, amount);
            this.showSuccess(`Successfully bought ${amount} ${symbol}!`);
            await this.loadPortfolio();
        } catch (error) {
            this.showError(`Failed to buy ${symbol}: ${error.message}`);
        }
    }

    async handleQuickSell(symbol, amount) {
        try {
            await api.sellCrypto(symbol, amount);
            this.showSuccess(`Successfully sold ${amount} ${symbol}!`);
            await this.loadPortfolio();
        } catch (error) {
            this.showError(`Failed to sell ${symbol}: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Add refresh button functionality
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Add logout button functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Add trading form functionality
        this.setupTradingForms();
    }

    setupTradingForms() {
        // Buy form
        const buyForm = document.getElementById('buy-form');
        if (buyForm) {
            buyForm.addEventListener('submit', (e) => this.handleBuyTrade(e));
        }

        // Sell form
        const sellForm = document.getElementById('sell-form');
        if (sellForm) {
            sellForm.addEventListener('submit', (e) => this.handleSellTrade(e));
        }
    }

    async handleBuyTrade(e) {
        e.preventDefault();
        
        const form = e.target;
        const coinSymbol = form.querySelector('[name="coin_symbol"]').value;
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        
        if (!coinSymbol || !amount) {
            this.showError('Please fill in all fields');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            api.showLoading(submitBtn);
            
            const result = await api.buyCrypto(coinSymbol, amount);
            
            this.showSuccess(`Successfully bought ${amount} ${coinSymbol}!`);
            
            // Refresh portfolio and prices
            await this.loadPortfolio();
            await this.loadPrices();
            
            // Reset form
            form.reset();
            
        } catch (error) {
            this.showError(`Failed to buy ${coinSymbol}: ${error.message}`);
        } finally {
            api.hideLoading(submitBtn, originalText);
        }
    }

    async handleSellTrade(e) {
        e.preventDefault();
        
        const form = e.target;
        const coinSymbol = form.querySelector('[name="coin_symbol"]').value;
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        
        if (!coinSymbol || !amount) {
            this.showError('Please fill in all fields');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            api.showLoading(submitBtn);
            
            const result = await api.sellCrypto(coinSymbol, amount);
            
            this.showSuccess(`Successfully sold ${amount} ${coinSymbol}!`);
            
            // Refresh portfolio and prices
            await this.loadPortfolio();
            await this.loadPrices();
            
            // Reset form
            form.reset();
            
        } catch (error) {
            this.showError(`Failed to sell ${coinSymbol}: ${error.message}`);
        } finally {
            api.hideLoading(submitBtn, originalText);
        }
    }

    async handleLogout() {
        try {
            api.logout();
            this.showSuccess('Logged out successfully');
            setTimeout(() => {
                window.location.href = 'page-login.html';
            }, 1000);
        } catch (error) {
            this.showError('Failed to logout');
        }
    }

    redirectToLogin() {
        window.location.href = 'page-login.html';
    }

    showSuccess(message) {
        api.showSuccess(message);
    }

    showError(message) {
        api.showError(message);
    }

    showNotification(message, type = 'info') {
        api.showNotification(message, type);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        console.log('🔄 Dashboard Light Integration destroyed');
    }
}

// Initialize dashboard light integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardLight = new DashboardLightIntegration();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.dashboardLight) {
        window.dashboardLight.destroy();
    }
}); 