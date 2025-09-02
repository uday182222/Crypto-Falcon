// BitcoinPro API Service for React Components
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bitcoinpro-backend.onrender.com';

class BitcoinProAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('bitcoinpro_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('bitcoinpro_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('bitcoinpro_token');
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
      console.log('Request config:', config);
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', response.headers);
      
      // Check if response has content
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      if (!response.ok) {
        let errorData = {};
        try {
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { detail: responseText || 'Unknown error' };
        }
        
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
      
      // Parse response as JSON
      let responseData;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
          throw new Error('Empty response body');
        }
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
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
export const api = new BitcoinProAPI();

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
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get wallet summary
  getWalletSummary: async () => {
    try {
      const response = await api.get('/wallet/summary');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get real-time crypto prices with smart fallback system
  getCryptoPrices: async () => {
    // First try backend price service (with backup API support)
    try {
      console.log('Attempting to fetch prices from backend...');
      const response = await api.get('/trade/prices');
      
      if (response && response.prices) {
        console.log('✅ Backend prices fetched successfully');
        // Format the response to match frontend expectations
        const formattedPrices = response.prices.map(coin => ({
          symbol: coin.symbol,
          name: getCoinName(coin.symbol),
          price: parseFloat(coin.price),
          change_24h: parseFloat(coin.change_24h || 0),
          change_24h_percent: parseFloat(coin.change_24h_percent || 0),
          volume: parseFloat(coin.volume || 0),
          high_24h: parseFloat(coin.high_24h || coin.price),
          low_24h: parseFloat(coin.low_24h || coin.price),
          last_updated: coin.last_updated || new Date().toISOString()
        }));

        return { 
          success: true, 
          data: { 
            prices: formattedPrices,
            source: response.source || 'Backend Price Service',
            timestamp: response.timestamp || new Date().toISOString()
          } 
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.warn('⚠️ Backend price service failed:', error.message);
      
      // Fallback to direct Binance API
      console.log('🔄 Falling back to direct Binance API...');
      try {
        const symbols = [
          // Major cryptocurrencies
          'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 
          'DOGEUSDT', 'TRXUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT',
          'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'BCHUSDT', 'ETCUSDT', 'XLMUSDT',
          'XMRUSDT', 'DASHUSDT', 'ZECUSDT', 'EOSUSDT', 'XTZUSDT', 'AAVEUSDT',
          
          // DeFi tokens
          'COMPUSDT', 'MKRUSDT', 'SNXUSDT', 'YFIUSDT', 'SUSHIUSDT', 'CRVUSDT',
          '1INCHUSDT', 'BALUSDT', 'LRCUSDT', 'ZRXUSDT', 'NEARUSDT', 'FTMUSDT',
          'ALGOUSDT', 'VETUSDT', 'ICPUSDT', 'FILUSDT',
          
          // Gaming & NFT
          'AXSUSDT', 'SANDUSDT', 'MANAUSDT', 'ENJUSDT', 'GALAUSDT', 'ILVUSDT',
          'CHZUSDT', 'FLOWUSDT', 'IMXUSDT', 'APEUSDT',
          
          // Meme coins
          'SHIBUSDT', 'PEPEUSDT', 'FLOKIUSDT', 'BONKUSDT', 'WIFUSDT', 'BABYDOGEUSDT',
          
          // AI & Big Data
          'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'GRTUSDT', 'RLCUSDT', 'NUMUSDT',
          
          // Storage & Infrastructure
          'ARUSDT', 'SCUSDT', 'STORJUSDT', 'BTTUSDT', 'HOTUSDT',
          
          // Privacy coins
          'DCRUSDT', 'ZENUSDT',
          
          // Stablecoins
          'USDTUSDT', 'USDCUSDT', 'BUSDUSDT', 'DAIUSDT', 'TUSDUSDT', 'USDPUSDT',
          'FRAXUSDT', 'LUSDUSDT',
          
          // Exchange tokens
          'FTTUSDT', 'LEOUSDT', 'CROUSDT', 'KCSUSDT', 'HTUSDT', 'OKBUSDT', 'GTUSDT',
          
          // Oracle & Data
          'BANDUSDT', 'TRBUSDT', 'API3USDT', 'UMAUSDT', 'REPUSDT',
          
          // Cross-Chain & Bridges
          'RUNEUSDT', 'KAVAUSDT', 'INJUSDT', 'OSMOUSDT', 'JUNOUSDT',
          
          // Layer 2 Solutions
          'OPUSDT', 'ARBUSDT',
          
          // Emerging & Trending
          'SUIUSDT', 'APTUSDT', 'SEIUSDT', 'TIAUSDT', 'JTOUSDT', 'PYTHUSDT',
          'WLDUSDT', 'BLURUSDT'
        ];
        
        const pricePromises = symbols.map(async (symbol) => {
          try {
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

        console.log(`✅ Binance fallback successful: ${validResults.length} prices fetched`);
        return { 
          success: true, 
          data: { 
            prices: validResults,
            source: 'Binance API (Fallback)',
            timestamp: new Date().toISOString()
          } 
        };
      } catch (fallbackError) {
        console.error('❌ All price sources failed:', fallbackError);
        return { success: false, error: 'All price sources failed' };
      }
    }
  },

  // Get user's trade history
  getTradeHistory: async () => {
    try {
      const response = await api.get('/trade/history');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buy cryptocurrency
  buyCrypto: async (buyData) => {
    try {
      const response = await api.post('/trade/buy', buyData);
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sell cryptocurrency
  sellCrypto: async (sellData) => {
    try {
      const response = await api.post('/trade/sell', sellData);
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get updated wallet balance after trade
  getUpdatedBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return { success: true, ...response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Helper function to get coin names
function getCoinName(symbol) {
  const coinNames = {
    // Major cryptocurrencies
    'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'Binance Coin', 'XRP': 'Ripple',
    'ADA': 'Cardano', 'SOL': 'Solana', 'DOGE': 'Dogecoin', 'TRX': 'TRON',
    'AVAX': 'Avalanche', 'DOT': 'Polkadot', 'MATIC': 'Polygon', 'LINK': 'Chainlink',
    'UNI': 'Uniswap', 'ATOM': 'Cosmos', 'LTC': 'Litecoin', 'BCH': 'Bitcoin Cash',
    'ETC': 'Ethereum Classic', 'XLM': 'Stellar', 'XMR': 'Monero', 'DASH': 'Dash',
    'ZEC': 'Zcash', 'EOS': 'EOS', 'XTZ': 'Tezos', 'AAVE': 'Aave',
    
    // DeFi tokens
    'COMP': 'Compound', 'MKR': 'Maker', 'SNX': 'Synthetix', 'YFI': 'Yearn Finance',
    'SUSHI': 'SushiSwap', 'CRV': 'Curve', '1INCH': '1inch', 'BAL': 'Balancer',
    'LRC': 'Loopring', 'ZRX': '0x Protocol', 'NEAR': 'NEAR Protocol', 'FTM': 'Fantom',
    'ALGO': 'Algorand', 'VET': 'VeChain', 'ICP': 'Internet Computer', 'FIL': 'Filecoin',
    
    // Gaming & NFT
    'AXS': 'Axie Infinity', 'SAND': 'The Sandbox', 'MANA': 'Decentraland', 'ENJ': 'Enjin Coin',
    'GALA': 'Gala', 'ILV': 'Illuvium', 'CHZ': 'Chiliz', 'FLOW': 'Flow',
    'IMX': 'Immutable X', 'APE': 'ApeCoin',
    
    // Meme coins
    'SHIB': 'Shiba Inu', 'PEPE': 'Pepe', 'FLOKI': 'Floki', 'BONK': 'Bonk',
    'WIF': 'Dogwifcoin', 'BABYDOGE': 'Baby Doge Coin',
    
    // AI & Big Data
    'FET': 'Fetch.ai', 'AGIX': 'SingularityNET', 'OCEAN': 'Ocean Protocol', 'GRT': 'The Graph',
    'RLC': 'iExec RLC', 'NUM': 'Numbers Protocol',
    
    // Storage & Infrastructure
    'AR': 'Arweave', 'SC': 'Siacoin', 'STORJ': 'Storj', 'BTT': 'BitTorrent', 'HOT': 'Holo',
    
    // Privacy coins
    'DCR': 'Decred', 'ZEN': 'Horizen',
    
    // Stablecoins
    'USDT': 'Tether', 'USDC': 'USD Coin', 'BUSD': 'Binance USD', 'DAI': 'Dai',
    'TUSD': 'TrueUSD', 'USDP': 'Pax Dollar', 'FRAX': 'Frax', 'LUSD': 'Liquity USD',
    
    // Exchange tokens
    'FTT': 'FTX Token', 'LEO': 'LEO Token', 'CRO': 'Cronos', 'KCS': 'KuCoin Token',
    'HT': 'Huobi Token', 'OKB': 'OKB', 'GT': 'GateToken',
    
    // Oracle & Data
    'BAND': 'Band Protocol', 'TRB': 'Tellor', 'API3': 'API3', 'UMA': 'UMA', 'REP': 'Augur',
    
    // Cross-Chain & Bridges
    'RUNE': 'THORChain', 'KAVA': 'Kava', 'INJ': 'Injective', 'OSMO': 'Osmosis', 'JUNO': 'Juno Network',
    
    // Layer 2 Solutions
    'OP': 'Optimism', 'ARB': 'Arbitrum',
    
    // Emerging & Trending
    'SUI': 'Sui', 'APT': 'Aptos', 'SEI': 'Sei Network', 'TIA': 'Celestia',
    'JTO': 'Jito', 'PYTH': 'Pyth Network', 'WLD': 'Worldcoin', 'BLUR': 'Blur'
  };
  return coinNames[symbol] || symbol;
}

export default api;
