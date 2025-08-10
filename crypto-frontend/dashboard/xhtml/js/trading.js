// MotionFalcon Trading Integration
// Handles trading functionality, price updates, and form submissions

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!MotionFalconUI.isAuthenticated()) {
        MotionFalconUI.redirect('page-login.html');
        return;
    }

    // Initialize trading page
    initializeTrading();
    
    // Set up real-time price updates
    setInterval(updatePrices, 10000); // Update every 10 seconds
});

// Initialize trading functionality
async function initializeTrading() {
    try {
        // Load supported coins
        await loadSupportedCoins();
        
        // Load current prices
        await loadCurrentPrices();
        
        // Load user portfolio
        await loadUserPortfolio();
        
        // Set up trading forms
        setupTradingForms();
        
    } catch (error) {
        console.error('Trading initialization error:', error);
        MotionFalconUI.showError('Failed to load trading data');
    }
}

// Load supported coins
async function loadSupportedCoins() {
    try {
        const coins = await api.getSupportedCoins();
        
        // Populate coin selectors
        populateCoinSelectors(coins);
        
    } catch (error) {
        console.error('Error loading supported coins:', error);
    }
}

// Load current prices
async function loadCurrentPrices() {
    try {
        const prices = await api.getPrices();
        
        // Update price display
        updatePriceDisplay(prices);
        
    } catch (error) {
        console.error('Error loading prices:', error);
    }
}

// Load user portfolio
async function loadUserPortfolio() {
    try {
        const portfolio = await api.getPortfolio();
        
        // Update portfolio display
        updatePortfolioDisplay(portfolio);
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

// Populate coin selectors
function populateCoinSelectors(coins) {
    const coinSelectors = document.querySelectorAll('.coin-selector');
    
    coinSelectors.forEach(selector => {
        selector.innerHTML = '';
        
        coins.forEach(coin => {
            const option = document.createElement('option');
            option.value = coin;
            option.textContent = coin;
            selector.appendChild(option);
        });
    });
}

// Update price display
function updatePriceDisplay(prices) {
    if (!prices.prices) return;
    
    prices.prices.forEach(price => {
        // Update price elements
        const priceElements = document.querySelectorAll(`[data-coin="${price.symbol}"]`);
        priceElements.forEach(element => {
            if (element.classList.contains('price-value')) {
                element.textContent = MotionFalconUI.formatCurrency(price.price);
            } else if (element.classList.contains('price-change')) {
                const changeClass = price.change_24h_percent >= 0 ? 'text-success' : 'text-danger';
                const changeIcon = price.change_24h_percent >= 0 ? '↗' : '↘';
                element.className = `price-change ${changeClass}`;
                element.textContent = `${changeIcon} ${MotionFalconUI.formatPercentage(price.change_24h_percent)}`;
            }
        });
    });
}

// Update portfolio display
function updatePortfolioDisplay(portfolio) {
    // Update total balance
    const balanceElement = document.querySelector('.user-balance');
    if (balanceElement) {
        balanceElement.textContent = MotionFalconUI.formatCurrency(portfolio.demo_balance || 0);
    }
    
    // Update portfolio holdings
    const holdingsContainer = document.querySelector('.portfolio-holdings');
    if (holdingsContainer && portfolio.holdings) {
        holdingsContainer.innerHTML = '';
        
        portfolio.holdings.forEach(holding => {
            const holdingElement = createHoldingElement(holding);
            holdingsContainer.appendChild(holdingElement);
        });
    }
}

// Create holding element
function createHoldingElement(holding) {
    const div = document.createElement('div');
    div.className = 'holding-item d-flex justify-content-between align-items-center p-2 border-bottom';
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-2">
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

// Setup trading forms
function setupTradingForms() {
    // Buy form
    const buyForm = document.querySelector('#buy-form');
    if (buyForm) {
        buyForm.addEventListener('submit', handleBuyTrade);
    }
    
    // Sell form
    const sellForm = document.querySelector('#sell-form');
    if (sellForm) {
        sellForm.addEventListener('submit', handleSellTrade);
    }
    
    // Setup amount calculation
    setupAmountCalculation();
}

// Handle buy trade
async function handleBuyTrade(event) {
    event.preventDefault();
    
    const form = event.target;
    const coinSelect = form.querySelector('.coin-selector');
    const amountInput = form.querySelector('input[name="amount"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const coinSymbol = coinSelect.value;
    const amount = parseFloat(amountInput.value);
    
    // Validation
    if (!coinSymbol || !amount || amount <= 0) {
        MotionFalconUI.showError('Please enter valid amount');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    
    try {
        MotionFalconUI.showLoading(submitButton);
        
        const response = await api.buyCrypto(coinSymbol, amount);
        
        MotionFalconUI.showSuccess('Buy order executed successfully!');
        
        // Clear form
        amountInput.value = '';
        
        // Refresh portfolio
        await loadUserPortfolio();
        
        // Refresh prices
        await loadCurrentPrices();
        
    } catch (error) {
        console.error('Buy trade error:', error);
        MotionFalconUI.showError(error.message || 'Failed to execute buy order');
    } finally {
        MotionFalconUI.hideLoading(submitButton, originalButtonText);
    }
}

// Handle sell trade
async function handleSellTrade(event) {
    event.preventDefault();
    
    const form = event.target;
    const coinSelect = form.querySelector('.coin-selector');
    const amountInput = form.querySelector('input[name="amount"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const coinSymbol = coinSelect.value;
    const amount = parseFloat(amountInput.value);
    
    // Validation
    if (!coinSymbol || !amount || amount <= 0) {
        MotionFalconUI.showError('Please enter valid amount');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    
    try {
        MotionFalconUI.showLoading(submitButton);
        
        const response = await api.sellCrypto(coinSymbol, amount);
        
        MotionFalconUI.showSuccess('Sell order executed successfully!');
        
        // Clear form
        amountInput.value = '';
        
        // Refresh portfolio
        await loadUserPortfolio();
        
        // Refresh prices
        await loadCurrentPrices();
        
    } catch (error) {
        console.error('Sell trade error:', error);
        MotionFalconUI.showError(error.message || 'Failed to execute sell order');
    } finally {
        MotionFalconUI.hideLoading(submitButton, originalButtonText);
    }
}

// Setup amount calculation
function setupAmountCalculation() {
    const amountInputs = document.querySelectorAll('input[name="amount"]');
    const priceDisplays = document.querySelectorAll('.price-display');
    
    amountInputs.forEach(input => {
        input.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const priceElement = this.closest('.trading-form').querySelector('.current-price');
            const totalElement = this.closest('.trading-form').querySelector('.total-amount');
            
            if (priceElement && totalElement) {
                const price = parseFloat(priceElement.dataset.price) || 0;
                const total = amount * price;
                totalElement.textContent = MotionFalconUI.formatCurrency(total);
            }
        });
    });
}

// Update prices periodically
async function updatePrices() {
    try {
        await loadCurrentPrices();
    } catch (error) {
        console.error('Error updating prices:', error);
    }
}

// Get current price for a coin
async function getCurrentPrice(coinSymbol) {
    try {
        const price = await api.getCoinPrice(coinSymbol);
        return price.price_usd;
    } catch (error) {
        console.error('Error getting current price:', error);
        return 0;
    }
}

// Calculate trade value
function calculateTradeValue(amount, price) {
    return amount * price;
}

// Export functions for use in other files
window.handleBuyTrade = handleBuyTrade;
window.handleSellTrade = handleSellTrade;
window.getCurrentPrice = getCurrentPrice;
window.calculateTradeValue = calculateTradeValue; 