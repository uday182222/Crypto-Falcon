import axios from 'axios';

const API_URL = 'https://crypto-falcon-backend.onrender.com';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Error handling utility
export const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const data = error.response.data;
        if (data.detail) {
            return data.detail;
        } else if (typeof data === 'string') {
            return data;
        }
        return 'An error occurred while processing your request';
    } else if (error.request) {
        // The request was made but no response was received
        return 'No response received from server. Please check your connection';
    } else {
        // Something happened in setting up the request that triggered an Error
        return error.message || 'An unexpected error occurred';
    }
};

// Trading API object
export const tradingAPI = {
    getPortfolio: () => api.get('/trade/portfolio'),
    getCryptoPrices: () => api.get('/trade/prices'),
    executeTrade: (data) => api.post('/trade/buy', data),
    getSupportedCoins: () => api.get('/trade/supported-coins'),
    getPrice: (symbol) => api.get(`/trade/price/${symbol}`),
    buyTrade: (data) => api.post('/trade/buy', data),
    sellTrade: (data) => api.post('/trade/sell', data),
};

// Achievement API object
export const achievementAPI = {
    getUserAchievements: () => api.get('/achievements/user'),
    getAchievements: () => api.get('/achievements'),
    checkAchievements: () => api.post('/achievements/check'),
    getAchievementStats: () => api.get('/achievements/stats'),
    initializeAchievements: () => api.post('/achievements/initialize'),
};

// Leaderboard API object
export const leaderboardAPI = {
    getGlobalLeaderboard: () => api.get('/leaderboard/global'),
    getWeeklyLeaderboard: () => api.get('/leaderboard/weekly'),
    getMyRank: () => api.get('/leaderboard/my-rank'),
    getLeaderboardStats: () => api.get('/leaderboard/stats'),
    updateRankings: () => api.post('/leaderboard/update-rankings'),
    getUserRank: (userId) => api.get(`/leaderboard/user/${userId}/rank`),
};

// Currency API functions
export const getSupportedCurrencies = () => api.get('/currency/supported');
export const updatePreferredCurrency = (data) => api.post('/currency/preference', data);
export const getCurrencyRates = () => api.get('/currency/rates');

// Auth endpoints
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/profile');
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// Leaderboard endpoints
export const getLeaderboard = () => api.get('/leaderboard/global');
export const getWeeklyLeaderboard = () => api.get('/leaderboard/weekly');
export const getMyRank = () => api.get('/leaderboard/my-rank');

// Achievement endpoints (legacy - use achievementAPI instead)
export const getAchievements = () => api.get('/achievements');
export const getUserAchievements = () => api.get('/achievements/user');
export const checkAchievements = () => api.post('/achievements/check');

// Purchase API object
export const purchaseAPI = {
    getPackages: () => api.get('/purchases/packages'),
    createOrder: (data) => api.post('/purchases/create-order', data),
    createDirectTopupOrder: (data) => api.post('/purchases/create-direct-topup-order', data),
    verifyPayment: (data) => api.post('/purchases/verify-payment', data),
    getPurchaseHistory: () => api.get('/purchases/history'),
};

export default api; 