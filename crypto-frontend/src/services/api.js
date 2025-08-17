// MotionFalcon API Service for React Components
const API_BASE_URL = '/api';

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

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        
        // Handle different types of errors
        if (response.status === 0 || response.status === 500) {
          throw new Error('Cannot connect to server. Please check if the backend is running.');
        } else if (response.status === 422) {
          throw new Error(errorData.detail || 'Validation error. Please check your input.');
        } else if (response.status === 409) {
          throw new Error(errorData.detail || 'User already exists with this email or username.');
        } else {
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint) {
    return await this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return await this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put(endpoint, body) {
    return await this.request(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete(endpoint) {
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Login method
  async login(email, password) {
    try {
      const response = await this.post('/auth/login', {
        email,
        password
      });
      
      if (response.access_token) {
        this.setToken(response.access_token);
        return { success: true, data: response };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout method
  logout() {
    this.clearToken();
    // Redirect to login page
    window.location.href = '/login';
  }
}

// Create and export API instances
export const api = new MotionFalconAPI();

// Export specific API services
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update trading settings
  updateTradingSettings: async (settings) => {
    try {
      const response = await api.put('/auth/trading-settings', settings);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const achievementsAPI = {
  // Get user's achievements
  getUserAchievements: async () => {
    try {
      const response = await api.get('/achievements/user');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all available achievements
  getAllAchievements: async () => {
    try {
      const response = await api.get('/achievements/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get achievement statistics
  getStats: async () => {
    try {
      const response = await api.get('/achievements/stats');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update login streak
  updateLoginStreak: async () => {
    try {
      const response = await api.post('/achievements/login-streak');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.login(email, password);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  register: async (username, email, password) => {
    try {
      console.log('Attempting registration with:', { username, email });
      
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      
      console.log('Registration response:', response);
      
      // The backend now returns access_token directly
      if (response.access_token) {
        console.log('Access token found:', response.access_token);
        api.setToken(response.access_token);
        return { 
          success: true, 
          data: { 
            access_token: response.access_token, 
            user: response.user 
          } 
        };
      } else {
        console.error('No access token found in response:', response);
        throw new Error('No access token received from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    api.logout();
  },

  isAuthenticated: () => {
    return api.isAuthenticated();
  }
};

// New Dashboard API methods
export const dashboardAPI = {
  // Get user's portfolio data
  getPortfolio: async () => {
    try {
      const response = await api.get('/trade/portfolio');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get wallet summary
  getWalletSummary: async () => {
    try {
      const response = await api.get('/wallet/summary');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get real-time crypto prices from Binance API
  getCryptoPrices: async () => {
    try {
      // Use Binance API for live prices - expanded list of popular coins
      const symbols = [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
        'DOTUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT',
        'LTCUSDT', 'XRPUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT',
        'FTMUSDT', 'ALGOUSDT', 'VETUSDT', 'ICPUSDT', 'FILUSDT'
      ];
      
      const pricePromises = symbols.map(async (symbol) => {
        try {
          // Get 24hr ticker price change statistics
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
          const data = await response.json();
          
          return {
            symbol: symbol.replace('USDT', ''),
            name: getCoinName(symbol.replace('USDT', '')),
            price: parseFloat(data.lastPrice),
            change_24h: parseFloat(data.priceChange),
            change_24h_percent: parseFloat(data.priceChangePercent),
            volume: parseFloat(data.volume),
            high_24h: parseFloat(data.highPrice),
            low_24h: parseFloat(data.lowPrice),
            last_updated: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(pricePromises);
      const validResults = results.filter(result => result !== null);

      return { 
        success: true, 
        data: { 
          prices: validResults,
          source: 'Binance API',
          timestamp: new Date().toISOString()
        } 
      };
    } catch (error) {
      console.error('Error fetching Binance prices:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's trade history
  getTradeHistory: async () => {
    try {
      const response = await api.get('/trade/history');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Helper function to get coin names
function getCoinName(symbol) {
  const coinNames = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'ADA': 'Cardano',
    'SOL': 'Solana',
    'DOT': 'Polkadot',
    'AVAX': 'Avalanche',
    'MATIC': 'Polygon',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'LTC': 'Litecoin',
    'XRP': 'Ripple',
    'BCH': 'Bitcoin Cash',
    'ATOM': 'Cosmos',
    'NEAR': 'Near Protocol',
    'FTM': 'Fantom',
    'ALGO': 'Algorand',
    'VET': 'VeChain',
    'ICP': 'Internet Computer',
    'FIL': 'Filecoin'
  };
  return coinNames[symbol] || symbol;
}

export default api;
