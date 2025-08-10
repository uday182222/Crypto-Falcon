// MotionFalcon API Service for React Components
const API_BASE_URL = 'http://127.0.0.1:8000';

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
        return { success: true, data };
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

  logout: () => {
    api.logout();
  },

  isAuthenticated: () => {
    return api.isAuthenticated();
  }
};

export default api;
