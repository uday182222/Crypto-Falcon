import React, { useState, useEffect, useRef } from 'react';

/**
 * TradingView Chart Component
 * Embeds live TradingView charts for cryptocurrency trading
 * 
 * @param {string} coinSymbol - The cryptocurrency symbol (e.g., "BTC", "ETH")
 * @param {string} className - Additional CSS classes for styling
 * @param {number} height - Chart height in pixels (default: 500px, mobile: 300px)
 * @param {boolean} showLoading - Whether to show loading spinner (default: true)
 */
const TradingChart = ({ 
  coinSymbol = "BTC", 
  className = "", 
  height = 500,
  showLoading = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // Convert coin symbol to TradingView format
  const getTradingViewSymbol = (symbol) => {
    const symbolMap = {
      'BTC': 'BINANCE:BTCUSDT',
      'ETH': 'BINANCE:ETHUSDT',
      'BNB': 'BINANCE:BNBUSDT',
      'ADA': 'BINANCE:ADAUSDT',
      'SOL': 'BINANCE:SOLUSDT',
      'DOT': 'BINANCE:DOTUSDT',
      'AVAX': 'BINANCE:AVAXUSDT',
      'MATIC': 'BINANCE:MATICUSDT',
      'LINK': 'BINANCE:LINKUSDT',
      'UNI': 'BINANCE:UNIUSDT',
      'ATOM': 'BINANCE:ATOMUSDT',
      'LTC': 'BINANCE:LTCUSDT',
      'XRP': 'BINANCE:XRPUSDT',
      'DOGE': 'BINANCE:DOGEUSDT',
      'SHIB': 'BINANCE:SHIBUSDT',
      'TRX': 'BINANCE:TRXUSDT',
      'ALGO': 'BINANCE:ALGOUSDT',
      'VET': 'BINANCE:VETUSDT',
      'FIL': 'BINANCE:FILUSDT',
      'ICP': 'BINANCE:ICPUSDT'
    };
    
    return symbolMap[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}USDT`;
  };

  // Get responsive height based on screen size
  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return Math.min(height, 300); // Mobile height
    }
    return height;
  };

  // Build TradingView widget URL
  const getTradingViewUrl = (symbol) => {
    const tradingViewSymbol = getTradingViewSymbol(symbol);
    const chartHeight = getResponsiveHeight();
    
    const params = new URLSearchParams({
      symbol: tradingViewSymbol,
      interval: 'D', // Daily interval
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1', // Candlestick chart
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: `tradingview_${symbol.toLowerCase()}`,
      width: '100%',
      height: chartHeight.toString()
    });

    return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
  };

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  // Handle iframe load errors
  const handleIframeError = () => {
    setIsLoading(false);
    console.warn(`Failed to load TradingView chart for ${coinSymbol}`);
  };

  // Update chart when coin symbol changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1); // Force iframe reload

    // Set a timeout to hide loading if iframe doesn't load
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [coinSymbol]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const chartHeight = getResponsiveHeight();

  return (
    <div className={`relative w-full ${className}`}>
      {/* Loading Spinner */}
      {showLoading && isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10 rounded-lg"
          style={{ height: chartHeight }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">
              Loading {coinSymbol} chart...
            </p>
          </div>
        </div>
      )}

      {/* TradingView Chart Container */}
      <div 
        className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        style={{ height: chartHeight }}
      >
        {/* TradingView Widget */}
        <iframe
          ref={iframeRef}
          key={iframeKey}
          src={getTradingViewUrl(coinSymbol)}
          title={`${coinSymbol} Price Chart`}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Fallback for JavaScript disabled */}
        <noscript>
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-6">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chart Unavailable
              </h3>
              <p className="text-sm text-gray-500">
                Please enable JavaScript to view the {coinSymbol} price chart.
              </p>
            </div>
          </div>
        </noscript>

        {/* Error State */}
        {!isLoading && !iframeRef.current && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-6">
              <div className="text-red-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chart Loading Failed
              </h3>
              <p className="text-sm text-gray-500">
                Unable to load {coinSymbol} chart. Please try again later.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Powered by TradingView • {coinSymbol}/USDT
      </div>
    </div>
  );
};

export default TradingChart; 