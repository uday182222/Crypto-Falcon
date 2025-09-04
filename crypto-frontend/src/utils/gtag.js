// Google Tag Manager utility functions
// This file provides helper functions to track events in your crypto trading app

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Function to push events to GTM
export const gtag = (...args) => {
  window.dataLayer.push(args);
};

// Function to track page views
export const trackPageView = (page_path, page_title) => {
  gtag('config', 'G-8EDTRZRQ05', {
    page_path: page_path,
    page_title: page_title
  });
};

// Function to track trading events
export const trackTradeEvent = (action, coin, amount, value) => {
  gtag('event', 'trade', {
    event_category: 'Trading',
    event_label: `${action} ${coin}`,
    value: value,
    custom_parameters: {
      coin_symbol: coin,
      trade_amount: amount,
      trade_value: value
    }
  });
};

// Function to track portfolio events
export const trackPortfolioEvent = (action, holdings_count, total_value) => {
  gtag('event', 'portfolio', {
    event_category: 'Portfolio',
    event_label: action,
    value: total_value,
    custom_parameters: {
      holdings_count: holdings_count,
      portfolio_value: total_value
    }
  });
};

// Function to track user engagement
export const trackEngagement = (action, feature) => {
  gtag('event', 'engagement', {
    event_category: 'User Engagement',
    event_label: `${action} ${feature}`,
    custom_parameters: {
      feature_name: feature,
      action_type: action
    }
  });
};

// Function to track chatbot interactions
export const trackChatbotEvent = (action, message_type) => {
  gtag('event', 'chatbot', {
    event_category: 'Chatbot',
    event_label: action,
    custom_parameters: {
      message_type: message_type,
      action: action
    }
  });
};

// Function to track errors
export const trackError = (error_type, error_message) => {
  gtag('event', 'exception', {
    description: error_message,
    fatal: false,
    custom_parameters: {
      error_type: error_type
    }
  });
};

// Function to track user registration/login
export const trackUserEvent = (action, user_type) => {
  gtag('event', 'user_action', {
    event_category: 'User',
    event_label: action,
    custom_parameters: {
      user_type: user_type,
      action: action
    }
  });
};

// Function to track wallet events
export const trackWalletEvent = (action, amount, balance) => {
  gtag('event', 'wallet', {
    event_category: 'Wallet',
    event_label: action,
    value: amount,
    custom_parameters: {
      wallet_balance: balance,
      transaction_amount: amount
    }
  });
};

// Predefined events for common actions
export const events = {
  // Trading events
  BUY_CRYPTO: (coin, amount, value) => trackTradeEvent('buy', coin, amount, value),
  SELL_CRYPTO: (coin, amount, value) => trackTradeEvent('sell', coin, amount, value),
  
  // Portfolio events
  VIEW_PORTFOLIO: (holdings_count, total_value) => trackPortfolioEvent('view', holdings_count, total_value),
  ANALYZE_PORTFOLIO: (holdings_count, total_value) => trackPortfolioEvent('analyze', holdings_count, total_value),
  
  // Engagement events
  CLICK_FEATURE: (feature) => trackEngagement('click', feature),
  VIEW_PAGE: (page) => trackEngagement('view', page),
  
  // Chatbot events
  SEND_MESSAGE: (message_type) => trackChatbotEvent('send_message', message_type),
  RECEIVE_RESPONSE: (message_type) => trackChatbotEvent('receive_response', message_type),
  
  // Wallet events
  ADD_FUNDS: (amount, balance) => trackWalletEvent('add_funds', amount, balance),
  WITHDRAW_FUNDS: (amount, balance) => trackWalletEvent('withdraw_funds', amount, balance),
  
  // User events
  LOGIN: (user_type) => trackUserEvent('login', user_type),
  REGISTER: (user_type) => trackUserEvent('register', user_type),
  LOGOUT: (user_type) => trackUserEvent('logout', user_type)
};

export default gtag;
