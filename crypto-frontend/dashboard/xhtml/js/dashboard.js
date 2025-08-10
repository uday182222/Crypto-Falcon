// MotionFalcon Dashboard Integration
// Handles dashboard data loading and user interactions

let dashboardInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard.js loaded');
    console.log('Current URL:', window.location.href);
    console.log('MotionFalconUI available:', typeof MotionFalconUI !== 'undefined');
    console.log('API available:', typeof api !== 'undefined');
    
    // Check if we're on the login page
    if (window.location.pathname.includes('page-login.html')) {
        console.log('On login page, skipping dashboard init');
        return; // Don't initialize dashboard on login page
    }
    
    // Check authentication
    if (!MotionFalconUI.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login...');
        MotionFalconUI.redirect('page-login.html');
        return;
    }

    console.log('User authenticated, initializing dashboard...');
    console.log('Token:', localStorage.getItem('motionfalcon_token'));
    
    // Prevent multiple initializations
    if (dashboardInitialized) {
        console.log('Dashboard already initialized, skipping...');
        return;
    }
    
    dashboardInitialized = true;
    
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'dashboard-loading';
    loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;';
    loadingDiv.innerHTML = '<h3>Loading Dashboard...</h3><p>Please wait while we load your data.</p>';
    document.body.appendChild(loadingDiv);
    
    // Initialize dashboard with timeout
    const initTimeout = setTimeout(() => {
        console.error('Dashboard initialization timed out');
        MotionFalconUI.showError('Dashboard failed to load. Please refresh the page.');
        dashboardInitialized = false;
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    }, 10000); // 10 second timeout
    
    initializeDashboard().finally(() => {
        clearTimeout(initTimeout);
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    });
    
    // Set up periodic data refresh
    setInterval(refreshDashboardData, 30000); // Refresh every 30 seconds
});

// Initialize dashboard
async function initializeDashboard() {
    try {
        console.log('Initializing dashboard...');
        console.log('Starting dashboard initialization...');
        
        // Show loading state
        const loadingElement = document.querySelector('.loading-spinner');
        if (loadingElement) {
            loadingElement.innerHTML = '<div style="text-align: center; padding: 50px;"><h3>Loading Dashboard...</h3></div>';
        } else {
            console.log('No loading spinner element found');
        }
        
        // Load user profile
        console.log('Loading user profile...');
        await loadUserProfile();
        
        // Load portfolio data
        console.log('Loading portfolio data...');
        await loadPortfolioData();
        
        // Load market prices
        console.log('Loading market prices...');
        await loadMarketPrices();
        
        // Load recent trades
        console.log('Loading recent trades...');
        await loadRecentTrades();
        
        // Load achievements
        console.log('Loading achievements...');
        await loadAchievements();
        
        // Update navigation with user info
        updateNavigation();
        
        console.log('Dashboard initialized successfully');
        
        // Hide loading state
        if (loadingElement) {
            loadingElement.innerHTML = '';
        } else {
            console.log('No loading element to clear');
        }
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        MotionFalconUI.showError('Failed to load dashboard data: ' + error.message);
        
        // Show error state
        const errorElement = document.querySelector('.loading-spinner');
        if (errorElement) {
            errorElement.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h3>Dashboard Error</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button>
                </div>
            `;
        } else {
            console.log('No error element found, showing error notification');
            MotionFalconUI.showError('Dashboard Error: ' + error.message);
        }
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        console.log('Loading user profile...');
        const profile = await api.getProfile();
        
        // Update user info in the UI
        updateUserInfo(profile);
        
        console.log('User profile loaded:', profile);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        // If profile load fails, user might be logged out
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            MotionFalconUI.logout();
        }
        // Don't throw error, just log it
    }
}

// Load portfolio data
async function loadPortfolioData() {
    try {
        console.log('Loading portfolio data...');
        const portfolio = await api.getPortfolio();
        
        // Update portfolio display
        updatePortfolioDisplay(portfolio);
        
        console.log('Portfolio data loaded:', portfolio);
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        // Don't throw error, just log it
    }
}

// Load market prices
async function loadMarketPrices() {
    try {
        const prices = await api.getPrices();
        
        // Update market prices display
        updateMarketPricesDisplay(prices);
        
    } catch (error) {
        console.error('Error loading market prices:', error);
    }
}

// Load recent trades
async function loadRecentTrades() {
    try {
        const trades = await api.getTradeHistory();
        
        // Update recent trades display
        updateRecentTradesDisplay(trades);
        
    } catch (error) {
        console.error('Error loading recent trades:', error);
    }
}

// Load achievements
async function loadAchievements() {
    try {
        const achievements = await api.getUserAchievements();
        
        // Update achievements display
        updateAchievementsDisplay(achievements);
        
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

// Update user info in the UI
function updateUserInfo(user) {
    // Update user name in navigation
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = user.username || 'User';
    });
    
    // Update user level
    const userLevelElements = document.querySelectorAll('.user-level');
    userLevelElements.forEach(element => {
        element.textContent = `Level ${user.level || 1}`;
    });
    
    // Update user balance
    const balanceElements = document.querySelectorAll('.user-balance');
    balanceElements.forEach(element => {
        element.textContent = MotionFalconUI.formatCurrency(user.demo_balance || 0);
    });
}

// Update portfolio display
function updatePortfolioDisplay(portfolio) {
    console.log('Updating portfolio display:', portfolio);
    
    // Update total portfolio value - look for various possible elements
    const totalValueSelectors = [
        '.portfolio-total-value',
        '.total-value',
        '.balance-amount',
        '.blance p',
        '[data-portfolio-total]'
    ];
    
    let totalValueElement = null;
    for (const selector of totalValueSelectors) {
        totalValueElement = document.querySelector(selector);
        if (totalValueElement) break;
    }
    
    if (totalValueElement) {
        totalValueElement.textContent = MotionFalconUI.formatCurrency(portfolio.total_value || 0);
        console.log('Updated portfolio total value');
    } else {
        console.log('No portfolio total value element found');
    }
    
    // Update portfolio holdings - look for various possible containers
    const holdingsSelectors = [
        '.portfolio-holdings',
        '.holdings-container',
        '.assets-list',
        '[data-portfolio-holdings]'
    ];
    
    let holdingsContainer = null;
    for (const selector of holdingsSelectors) {
        holdingsContainer = document.querySelector(selector);
        if (holdingsContainer) break;
    }
    
    if (holdingsContainer && portfolio.holdings) {
        holdingsContainer.innerHTML = '';
        
        portfolio.holdings.forEach(holding => {
            const holdingElement = createHoldingElement(holding);
            holdingsContainer.appendChild(holdingElement);
        });
        console.log('Updated portfolio holdings');
    } else {
        console.log('No portfolio holdings container found');
    }
}

// Create holding element
function createHoldingElement(holding) {
    const div = document.createElement('div');
    div.className = 'holding-item d-flex justify-content-between align-items-center p-3 border-bottom';
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <h6 class="mb-0">${holding.coin_symbol}</h6>
                <small class="text-muted">${holding.coin_name}</small>
            </div>
        </div>
        <div class="text-end">
            <h6 class="mb-0">${MotionFalconUI.formatCrypto(holding.amount, holding.coin_symbol)}</h6>
            <small class="text-muted">${MotionFalconUI.formatCurrency(holding.value_usd)}</small>
        </div>
    `;
    return div;
}

// Update market prices display
function updateMarketPricesDisplay(prices) {
    console.log('Updating market prices display:', prices);
    
    // Look for various possible market price containers
    const pricesSelectors = [
        '.market-prices',
        '.prices-container',
        '.market-data',
        '.market-list',
        '.market-previews',
        '[data-market-prices]'
    ];
    
    let pricesContainer = null;
    for (const selector of pricesSelectors) {
        pricesContainer = document.querySelector(selector);
        if (pricesContainer) break;
    }
    
    if (pricesContainer && prices.prices) {
        pricesContainer.innerHTML = '';
        
        prices.prices.forEach(price => {
            const priceElement = createPriceElement(price);
            pricesContainer.appendChild(priceElement);
        });
        console.log('Updated market prices');
    } else {
        console.log('No market prices container found');
    }
}

// Create price element
function createPriceElement(price) {
    const div = document.createElement('div');
    div.className = 'price-item d-flex justify-content-between align-items-center p-3 border-bottom';
    
    const changeClass = price.change_24h_percent >= 0 ? 'text-success' : 'text-danger';
    const changeIcon = price.change_24h_percent >= 0 ? '↗' : '↘';
    
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <h6 class="mb-0">${price.symbol}</h6>
                <small class="text-muted">${price.name}</small>
            </div>
        </div>
        <div class="text-end">
            <h6 class="mb-0">${MotionFalconUI.formatCurrency(price.price)}</h6>
            <small class="${changeClass}">${changeIcon} ${MotionFalconUI.formatPercentage(price.change_24h_percent)}</small>
        </div>
    `;
    return div;
}

// Update recent trades display
function updateRecentTradesDisplay(trades) {
    console.log('Updating recent trades display:', trades);
    
    // Look for various possible trade containers
    const tradesSelectors = [
        '.recent-trades',
        '.trades-container',
        '.trade-history',
        '.dataTabletrade',
        '[data-recent-trades]'
    ];
    
    let tradesContainer = null;
    for (const selector of tradesSelectors) {
        tradesContainer = document.querySelector(selector);
        if (tradesContainer) break;
    }
    
    if (tradesContainer) {
        tradesContainer.innerHTML = '';
        
        trades.slice(0, 10).forEach(trade => {
            const tradeElement = createTradeElement(trade);
            tradesContainer.appendChild(tradeElement);
        });
        console.log('Updated recent trades');
    } else {
        console.log('No recent trades container found');
    }
}

// Create trade element
function createTradeElement(trade) {
    const div = document.createElement('div');
    div.className = 'trade-item d-flex justify-content-between align-items-center p-3 border-bottom';
    
    const tradeTypeClass = trade.trade_type === 'buy' ? 'text-success' : 'text-danger';
    const tradeTypeIcon = trade.trade_type === 'buy' ? '↗' : '↘';
    
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <h6 class="mb-0">${trade.coin_symbol}</h6>
                <small class="text-muted">${new Date(trade.timestamp).toLocaleDateString()}</small>
            </div>
        </div>
        <div class="text-end">
            <h6 class="mb-0 ${tradeTypeClass}">${tradeTypeIcon} ${trade.trade_type.toUpperCase()}</h6>
            <small class="text-muted">${MotionFalconUI.formatCrypto(trade.amount, trade.coin_symbol)}</small>
        </div>
    `;
    return div;
}

// Update achievements display
function updateAchievementsDisplay(achievements) {
    console.log('Updating achievements display:', achievements);
    
    // Look for various possible achievement containers
    const achievementsSelectors = [
        '.user-achievements',
        '.achievements-container',
        '.achievements-list',
        '[data-achievements]'
    ];
    
    let achievementsContainer = null;
    for (const selector of achievementsSelectors) {
        achievementsContainer = document.querySelector(selector);
        if (achievementsContainer) break;
    }
    
    if (achievementsContainer && achievements.achievements) {
        achievementsContainer.innerHTML = '';
        
        achievements.achievements.forEach(achievement => {
            const achievementElement = createAchievementElement(achievement);
            achievementsContainer.appendChild(achievementElement);
        });
        console.log('Updated achievements');
    } else {
        console.log('No achievements container found');
    }
}

// Create achievement element
function createAchievementElement(achievement) {
    const div = document.createElement('div');
    div.className = 'achievement-item p-3 border-bottom';
    
    const progressPercent = achievement.progress_percentage || 0;
    const isCompleted = achievement.is_completed;
    
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${achievement.name}</h6>
            ${isCompleted ? '<span class="badge bg-success">Completed</span>' : ''}
        </div>
        <p class="text-muted small mb-2">${achievement.description}</p>
        <div class="progress mb-2" style="height: 8px;">
            <div class="progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}" 
                 style="width: ${progressPercent}%"></div>
        </div>
        <small class="text-muted">${progressPercent.toFixed(1)}% complete</small>
    `;
    return div;
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem('motionfalcon_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Update navigation with user info
function updateNavigation() {
    const user = getCurrentUser();
    if (user) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.username || 'User';
        });
    }
}

// Refresh dashboard data
async function refreshDashboardData() {
    try {
        await loadMarketPrices();
        await loadPortfolioData();
    } catch (error) {
        console.error('Error refreshing dashboard data:', error);
    }
}

// Handle logout
function handleLogout() {
    MotionFalconUI.logout();
}

// Export functions for use in other files
window.handleLogout = handleLogout;
window.refreshDashboardData = refreshDashboardData; 