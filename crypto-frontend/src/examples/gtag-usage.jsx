// Example usage of Google Tag Manager tracking in React components
// This file shows how to integrate GTM tracking into your crypto trading app

import React from 'react';
import { events, trackPageView, trackError } from '../utils/gtag';

// Example: Trading component with GTM tracking
const TradingComponent = () => {
  const handleBuyCrypto = (coin, amount, value) => {
    // Your trading logic here
    console.log(`Buying ${amount} ${coin} for $${value}`);
    
    // Track the trade event
    events.BUY_CRYPTO(coin, amount, value);
  };

  const handleSellCrypto = (coin, amount, value) => {
    // Your trading logic here
    console.log(`Selling ${amount} ${coin} for $${value}`);
    
    // Track the trade event
    events.SELL_CRYPTO(coin, amount, value);
  };

  return (
    <div>
      <button onClick={() => handleBuyCrypto('BTC', 0.1, 11000)}>
        Buy Bitcoin
      </button>
      <button onClick={() => handleSellCrypto('BTC', 0.1, 11000)}>
        Sell Bitcoin
      </button>
    </div>
  );
};

// Example: Portfolio component with GTM tracking
const PortfolioComponent = ({ holdings, totalValue }) => {
  React.useEffect(() => {
    // Track portfolio view when component mounts
    events.VIEW_PORTFOLIO(holdings.length, totalValue);
  }, [holdings.length, totalValue]);

  const handleAnalyzePortfolio = () => {
    // Track portfolio analysis
    events.ANALYZE_PORTFOLIO(holdings.length, totalValue);
    
    // Your analysis logic here
    console.log('Analyzing portfolio...');
  };

  return (
    <div>
      <h2>Portfolio</h2>
      <p>Holdings: {holdings.length}</p>
      <p>Total Value: ${totalValue}</p>
      <button onClick={handleAnalyzePortfolio}>
        Analyze Portfolio
      </button>
    </div>
  );
};

// Example: Chatbot component with GTM tracking
const ChatbotComponent = () => {
  const handleSendMessage = (message) => {
    // Track chatbot interaction
    events.SEND_MESSAGE('user_message');
    
    // Your chatbot logic here
    console.log('Sending message:', message);
  };

  const handleReceiveResponse = (response) => {
    // Track chatbot response
    events.RECEIVE_RESPONSE('bot_response');
    
    // Your response handling logic here
    console.log('Received response:', response);
  };

  return (
    <div>
      <input 
        placeholder="Ask me about crypto trading..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage(e.target.value);
          }
        }}
      />
    </div>
  );
};

// Example: Wallet component with GTM tracking
const WalletComponent = ({ balance }) => {
  const handleAddFunds = (amount) => {
    // Track wallet event
    events.ADD_FUNDS(amount, balance);
    
    // Your add funds logic here
    console.log(`Adding $${amount} to wallet`);
  };

  return (
    <div>
      <h3>Wallet Balance: ${balance}</h3>
      <button onClick={() => handleAddFunds(1000)}>
        Add $1000
      </button>
    </div>
  );
};

// Example: Error boundary with GTM tracking
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Track error in GTM
    trackError('react_error', error.message);
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Example: Page component with GTM tracking
const PageComponent = ({ pageName }) => {
  React.useEffect(() => {
    // Track page view
    trackPageView(`/${pageName}`, `BitcoinPro - ${pageName}`);
  }, [pageName]);

  return (
    <div>
      <h1>{pageName} Page</h1>
      {/* Your page content */}
    </div>
  );
};

export {
  TradingComponent,
  PortfolioComponent,
  ChatbotComponent,
  WalletComponent,
  ErrorBoundary,
  PageComponent
};
