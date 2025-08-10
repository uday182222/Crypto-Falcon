// MotionFalcon API Integration
// This file handles all API communication with the FastAPI backend

const API_BASE_URL = 'http://127.0.0.1:8000'; // Backend API URL

// API Service Class
class MotionFalconAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('motionfalcon_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('motionfalcon_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('motionfalcon_token');
    }

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method (returns RAW JSON)
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Convenience helpers used by page scripts (wrap to { success, data })
    async get(endpoint) {
        const data = await this.request(endpoint, { method: 'GET' });
        return { success: true, data };
    }

    async post(endpoint, body) {
        // Special-case endpoints that expect query params instead of JSON body
        if (endpoint.startsWith('/wallet/direct-topup') && body && typeof body.amount_inr !== 'undefined') {
            const amount = encodeURIComponent(body.amount_inr);
            const data = await this.request(`/wallet/direct-topup?amount_inr=${amount}`, { method: 'POST' });
            return { success: true, data };
        }
        const data = await this.request(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
        return { success: true, data };
    }

    // Simple working login method
    async simpleLogin(email, password) {
        const url = `${this.baseURL}/simple-login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.access_token) {
                this.setToken(data.access_token);
            }
            
            return data;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Authentication Methods
    async login(email, password) {
        // Try the proper authentication endpoint first
        try {
            const url = `${this.baseURL}/auth/test-login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.access_token) {
                this.setToken(data.access_token);
            }
            
            return { success: true, data };
        } catch (error) {
            // Fallback to simple login
            try {
                const data = await this.simpleLogin(email, password);
                return { success: true, data };
            } catch (error) {
                return { success: false, message: error.message, data: null };
            }
        }
    }

    async register(username, email, password) {
        try {
            const data = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password })
            });
            
            if (data.access_token) {
                this.setToken(data.access_token);
            }
            
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message, data: null };
        }
    }

    async forgotPassword(email) {
        try {
            const data = await this.request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message, data: null };
        }
    }

    async resetPassword(token, new_password) {
        try {
            const data = await this.request('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, new_password })
            });
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message, data: null };
        }
    }

    async getProfile() {
        return await this.get('/auth/profile');
    }

    // Trading Methods
    async getSupportedCoins() {
        return await this.get('/trade/supported-coins');
    }

    async getPrices() {
        return await this.get('/trade/prices');
    }

    async getCoinPrice(coinSymbol) {
        return await this.get(`/trade/price/${coinSymbol}`);
    }

    async buyCrypto(coinSymbol, quantity) {
        return await this.post('/trade/buy', {
            coin_symbol: coinSymbol,
            quantity: quantity
        });
    }

    async sellCrypto(coinSymbol, quantity) {
        return await this.post('/trade/sell', {
            coin_symbol: coinSymbol,
            quantity: quantity
        });
    }

    async executeTrade({ coin_symbol, trade_type, quantity }) {
        const endpoint = trade_type === 'buy' ? '/trade/buy' : '/trade/sell';
        return await this.post(endpoint, {
            coin_symbol,
            quantity
        });
    }

    // Purchase Methods
    async getPackages() {
        return await this.get('/purchases/packages');
    }

    async createOrder(package_id) {
        return await this.post('/purchases/create-order', {
            package_id: package_id
        });
    }

    async getPurchaseHistory() {
        return await this.get('/purchases/history');
    }

    // Portfolio and History
    async getPortfolio() {
        return await this.get('/trade/portfolio');
    }

    async getTradeHistory() {
        return await this.get('/trade/history');
    }

    // Achievements
    async getUserAchievements() {
        return await this.get('/achievements/user');
    }

    async getAllAchievements() {
        return await this.get('/achievements/all');
    }

    // Leaderboard
    async getLeaderboard() {
        return await this.get('/leaderboard/global');
    }

    // Wallet
    async getWallet() {
        return await this.get('/wallet/');
    }

    // Utility Methods
    isAuthenticated() {
        return !!this.token;
    }

    logout() {
        this.clearToken();
        window.location.href = 'page-login.html';
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatPercentage(value) {
        return `${value.toFixed(2)}%`;
    }

    formatCrypto(amount, symbol) {
        return `${parseFloat(amount).toFixed(8)} ${symbol}`;
    }
}

// Global API instance
const api = new MotionFalconAPI();

// Utility functions for UI integration
const MotionFalconUI = {
    // Show loading spinner
    showLoading(element) {
        if (element) {
            element.disabled = true;
            element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        }
    },

    // Hide loading spinner
    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    },

    // Show success message
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },

    // Show error message
    showError(message, duration = 5000) {
        this.showNotification(message, 'danger', duration);
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    },

    // Redirect to page
    redirect(url) {
        window.location.href = url;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!api.token;
    },

    // Logout user
    logout() {
        api.clearToken();
        this.redirect('page-login.html');
    },

    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format percentage
    formatPercentage(value) {
        return `${value.toFixed(2)}%`;
    },

    // Format crypto amount
    formatCrypto(amount, symbol) {
        return `${parseFloat(amount).toFixed(8)} ${symbol}`;
    }
};

// Export for use in other files
window.MotionFalconAPI = MotionFalconAPI;
window.api = api;
window.MotionFalconUI = MotionFalconUI; 