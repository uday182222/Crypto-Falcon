import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Coins, DollarSign, Activity, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingAnimation from '../components/ui/LoadingAnimation';
import { dashboardAPI } from '../services/api';

const Trading = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [isTradeExecuting, setIsTradeExecuting] = useState(false);
  const [tradeConfirmation, setTradeConfirmation] = useState(null);

  // Add CSS for spinner animation and glassmorphism effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 166, 0.3); }
        50% { box-shadow: 0 0 30px rgba(20, 184, 166, 0.6), 0 0 40px rgba(139, 92, 246, 0.4); }
      }
      
      .trade-button {
        transition: all 0.3s ease;
        backdrop-filter: blur(12px);
      }
      
      .trade-button:hover {
        background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%) !important;
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 25px rgba(20, 184, 166, 0.3), 0 4px 15px rgba(139, 92, 246, 0.2) !important;
        border-color: rgba(20, 184, 166, 0.6) !important;
        backdrop-filter: blur(16px);
      }
      
      .trade-button:active {
        transform: translateY(-1px) scale(0.98);
        box-shadow: 0 4px 15px rgba(20, 184, 166, 0.2) !important;
      }
      
      .glass-card {
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(51, 65, 85, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .glass-card:hover {
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba(20, 184, 166, 0.4);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(20, 184, 166, 0.1);
        transform: translateY(-2px);
      }
      
      .floating-element {
        animation: float 6s ease-in-out infinite;
      }
      
      .glow-effect {
        animation: glow 4s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchCoins();
    fetchBalance();
  }, []);

  // Set chart ready when coins are loaded
  useEffect(() => {
    if (coins.length > 0 && !isLoading) {
      setIsChartReady(true);
    }
  }, [coins, isLoading]);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('Trading component rendered, floating trade bar should be visible');
    console.log('Balance:', balance);
    console.log('Coins loaded:', coins.length);
  }, []);

  const fetchCoins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const pricesResponse = await dashboardAPI.getCryptoPrices();
      
      if (pricesResponse.success) {
        const prices = pricesResponse.data.prices || [];
        const formattedCoins = prices.map(coin => ({
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price,
          change: coin.change_24h_percent,
          icon: getCoinIcon(coin.symbol)
        }));
        setCoins(formattedCoins);
        
        // Set initial selected coin price
        if (formattedCoins.length > 0) {
          const firstCoin = formattedCoins[0];
          setSelectedCoin(firstCoin.symbol);
          setPrice(firstCoin.price);
        }
        
        setLastUpdate(new Date());
      } else {
        setError('Failed to fetch cryptocurrency prices. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      setError('Unable to connect to cryptocurrency service. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const walletResponse = await dashboardAPI.getWalletSummary();
      if (walletResponse.success) {
        setBalance(parseFloat(walletResponse.data.balance || 0));
      } else {
        setError('Failed to fetch wallet balance.');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Unable to fetch wallet balance.');
    }
  };

  const getCoinIcon = (symbol) => {
    const icons = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'BNB': '🟡',
      'ADA': '₳',
      'SOL': '◎',
      'DOT': '●',
      'AVAX': '❄️',
      'MATIC': '🔷',
      'LINK': '🔗',
      'UNI': '🦄',
      'LTC': 'Ł',
      'XRP': '✖️',
      'BCH': '₿',
      'ATOM': '⚛️',
      'NEAR': '🌐',
      'FTM': '👻',
      'ALGO': '🔵',
      'VET': '🔷',
      'ICP': '🌍',
      'FIL': '📁'
    };
    return icons[symbol] || symbol;
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const tradeAmount = parseFloat(amount);
    const totalCost = tradeAmount * price;

    if (tradeType === 'buy' && totalCost > balance) {
      alert('Insufficient balance!');
      return;
    }
    
    try {
      setIsTradeExecuting(true);
      
      // Execute real trade through backend API
      const token = localStorage.getItem('motionfalcon_token');
      if (!token) {
        alert('Please login first to trade');
        return;
      }

      console.log('Token found:', token.substring(0, 20) + '...');
      console.log('API endpoint:', `http://localhost:8000/trade/${tradeType.toLowerCase()}`);
      console.log('Request body:', {
        coin_symbol: selectedCoin,
        side: tradeType.toLowerCase(),
        quantity: tradeAmount
      });
      
      console.log('Executing trade:', {
        type: tradeType,
        coin: selectedCoin,
        amount: tradeAmount,
        price: price,
        totalCost: totalCost,
        balance: balance
      });

              const tradeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/trade/${tradeType.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coin_symbol: selectedCoin,
          side: tradeType.toLowerCase(),
          quantity: tradeAmount
        })
      });

      console.log('Trade response status:', tradeResponse.status);
      console.log('Trade response headers:', Object.fromEntries(tradeResponse.headers.entries()));

      if (!tradeResponse.ok) {
        const errorData = await tradeResponse.json().catch(() => ({}));
        console.error('Trade API error:', errorData);
        throw new Error(errorData.detail || errorData.message || `HTTP ${tradeResponse.status}: ${tradeResponse.statusText}`);
      }

      const tradeResult = await tradeResponse.json();
      
      // Show trade confirmation
      setTradeConfirmation({
        type: tradeType,
        coin: selectedCoin,
        amount: tradeAmount,
        price: price,
        total: totalCost,
        message: tradeResult.message,
        newBalance: tradeResult.new_balance
      });
      
      // Update local state
      setAmount('');
      
      // Refresh data
      fetchBalance();
      fetchCoins();
      
    } catch (error) {
      console.error('Trade execution error:', error);
      
      // Extract proper error message
      let errorMessage = 'Trade failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.detail || errorData.message || 'Trade failed';
        } catch {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      }
      
      alert(`Trade failed: ${errorMessage}`);
    } finally {
      setIsTradeExecuting(false);
    }
  };

  const selectedCoinData = coins.find(coin => coin.symbol === selectedCoin);

  // Update price when selected coin changes
  useEffect(() => {
    if (selectedCoinData) {
      setPrice(selectedCoinData.price);
    }
  }, [selectedCoinData]);

  // Initialize TradingView widget
  useEffect(() => {
    if (!isChartReady || !selectedCoin) return;
    
    let widgetInstance = null;
    
    const loadTradingViewWidget = () => {
      // Load TradingView script if not already loaded
      if (!window.TradingView) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          setTimeout(initWidget, 500); // Longer delay to ensure script is fully loaded
        };
        document.head.appendChild(script);
      } else {
        setTimeout(initWidget, 100);
      }
    };

    const initWidget = () => {
      // Check if container exists and is in DOM
      const container = document.getElementById('tradingview-widget');
      if (!container || !container.parentNode) {
        console.log('Container not ready, retrying...');
        setTimeout(initWidget, 200);
        return;
      }

      if (window.TradingView && selectedCoin) {
        console.log('Initializing TradingView widget for:', selectedCoin);
        
        // Clear existing content
        container.innerHTML = '';
        
        // Ensure container is visible and has proper dimensions
        container.style.display = 'block';
        container.style.height = '500px';
        container.style.width = '100%';

        try {
          // Create new widget with proper container reference
          widgetInstance = new window.TradingView.widget({
            width: '100%',
            height: '500',
            symbol: `BINANCE:${selectedCoin}USDT`,
            interval: '60',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#0f172a',
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: 'tradingview-widget',
            studies: [],
            disabled_features: [
              'use_localstorage_for_settings',
              'volume_force_overlay'
            ],
            enabled_features: [
              'study_templates'
            ],
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': '#14b8a6',
              'mainSeriesProperties.candleStyle.downColor': '#8b5cf6',
              'mainSeriesProperties.candleStyle.wickUpColor': '#14b8a6',
              'mainSeriesProperties.candleStyle.wickDownColor': '#8b5cf6',
              'paneProperties.background': '#0f172a',
              'paneProperties.vertGridProperties.color': '#1e293b',
              'paneProperties.horzGridProperties.color': '#1e293b'
            },
            loading_screen: {
              backgroundColor: '#0f172a',
              foregroundColor: '#14b8a6'
            }
          });
          console.log('TradingView widget created successfully');
        } catch (error) {
          console.error('Error creating TradingView widget:', error);
          // Show error in container
          container.innerHTML = `
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100%; 
              color: #ef4444; 
              text-align: center;
              padding: 2rem;
            ">
              <div>
                <p style="margin-bottom: 1rem;">Failed to load chart</p>
                <button onclick="window.location.reload()" style="
                  padding: 0.5rem 1rem; 
                  background: #14b8a6; 
                  color: white; 
                  border: none; 
                  border-radius: 0.375rem; 
                  cursor: pointer;
                ">Retry</button>
              </div>
            </div>
          `;
        }
      } else {
        console.log('TradingView not ready or no selected coin');
      }
    };

    // Wait for component to be fully mounted
    const timer = setTimeout(() => {
      loadTradingViewWidget();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (widgetInstance) {
        try {
          // Clean up widget if possible
          const container = document.getElementById('tradingview-widget');
          if (container) {
            container.innerHTML = '';
          }
        } catch (error) {
          console.log('Error cleaning up widget:', error);
        }
      }
    };
  }, [selectedCoin, isChartReady]);

  // Handle timeframe changes
  useEffect(() => {
    const timeframeSelector = document.getElementById('timeframe-selector');
    if (timeframeSelector) {
      timeframeSelector.addEventListener('change', (e) => {
        // This will be handled by TradingView widget internally
        // The widget automatically updates when the interval changes
      });
    }
  }, []);

  if (isLoading) {
    return <LoadingAnimation message="Loading Trading..." size="large" />;
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Connection Error</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{error}</p>
          <Button 
            variant="primary" 
            onClick={fetchCoins}
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '1rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>No Data Available</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Unable to load cryptocurrency data at this time.</p>
          <Button 
            variant="primary" 
            onClick={fetchCoins}
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header with Glassmorphism */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'glow 4s ease-in-out infinite'
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                Trading Platform
              </h1>
              <p style={{
                color: '#cbd5e1',
                fontSize: '1.125rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Buy and sell cryptocurrencies with real-time prices
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={fetchCoins}
              className="glass-card"
              style={{
                color: '#14b8a6',
                background: 'rgba(20, 184, 166, 0.15)',
                border: '2px solid rgba(20, 184, 166, 0.4)',
                backdropFilter: 'blur(16px)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
              Refresh
            </Button>
          </div>
        </div>

        {/* TradingView Chart - Full Width with Glassmorphism */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {selectedCoinData ? `${selectedCoinData.name} (${selectedCoinData.symbol})` : 'Bitcoin (BTC)'} Chart
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                color: '#cbd5e1', 
                fontSize: '0.875rem',
                fontWeight: '500',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>Timeframe:</span>
              <select
                id="timeframe-selector"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  minWidth: '100px',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="1">1m</option>
                <option value="5">5m</option>
                <option value="15">15m</option>
                <option value="30">30m</option>
                <option value="60">1h</option>
                <option value="240">4h</option>
                <option value="1D">1D</option>
                <option value="1W">1W</option>
                <option value="1M">1M</option>
              </select>
            </div>
          </div>
          
          {/* TradingView Widget Container with Glassmorphism */}
          <div 
            id="tradingview-widget"
            style={{
              height: '600px',
              width: '100%',
              borderRadius: '1rem',
              overflow: 'hidden',
              minHeight: '500px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(51, 65, 85, 0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
          >
            <div style={{
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <LoadingAnimation message="Loading Trading Chart..." size="small" />
            </div>
          </div>
        </div>

        {/* All Coins Table with Glassmorphism */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '5rem', // Extra margin for floating trade bar
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1.5rem',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Available Cryptocurrencies
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  borderBottom: '2px solid rgba(51, 65, 85, 0.4)',
                  background: 'rgba(20, 184, 166, 0.05)',
                  backdropFilter: 'blur(12px)'
                }}>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem', 
                    color: '#cbd5e1', 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>Coin</th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    color: '#cbd5e1', 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>Price</th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    color: '#cbd5e1', 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>24h Change</th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    color: '#cbd5e1', 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {coins.map(coin => (
                  <tr key={coin.symbol} style={{ 
                    borderBottom: '1px solid rgba(51, 65, 85, 0.2)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(20, 184, 166, 0.08)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          fontSize: '1.25rem',
                          width: '2rem',
                          height: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {coin.icon}
                        </div>
                        <div>
                          <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem' }}>{coin.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem', color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem' }}>
                      ${coin.price.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        color: coin.change >= 0 ? '#10b981' : '#ef4444',
                        padding: '0.375rem 0.75rem',
                        background: coin.change >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        borderRadius: '0.5rem',
                        border: `1px solid ${coin.change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        minWidth: '80px',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        {coin.change >= 0 ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                        <span style={{ whiteSpace: 'nowrap' }}>
                          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedCoin(coin.symbol);
                          setPrice(coin.price);
                          // Scroll to top to show the updated chart
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="trade-button"
                        style={{
                          color: '#14b8a6',
                          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                          border: '1px solid rgba(20, 184, 166, 0.3)',
                          fontSize: '0.875rem',
                          padding: '0.625rem 1.25rem',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          minWidth: '90px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Trade Bar - Fixed Bottom with Enhanced Glassmorphism */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(25px)',
          borderTop: '3px solid rgba(20, 184, 166, 0.6)',
          padding: '1rem 2rem',
          zIndex: 9999,
          boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(20, 184, 166, 0.1)',
          overflow: 'hidden',
          minHeight: '90px',
          borderLeft: '3px solid rgba(20, 184, 166, 0.6)',
          borderRight: '3px solid rgba(20, 184, 166, 0.6)'
        }}>
          {/* Background Glow Effects */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            left: '20%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            animation: 'glow 6s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '30%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'glow 8s ease-in-out infinite reverse'
          }} />
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Balance Display with Glassmorphism */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '2px solid rgba(20, 184, 166, 0.4)',
              borderRadius: '1rem',
              padding: '1rem 1.5rem',
              textAlign: 'center',
              minWidth: '200px',
              flex: '1',
              maxWidth: '300px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 25px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                justifyContent: 'center'
              }}>
                <div style={{
                  padding: '0.25rem',
                  background: 'rgba(20, 184, 166, 0.2)',
                  borderRadius: '0.375rem',
                  color: '#14b8a6'
                }}>
                  <Coins size={16} />
                </div>
                <span style={{ color: '#14b8a6', fontWeight: '600', fontSize: '0.875rem' }}>Balance</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
                ${balance.toLocaleString()}
              </div>
            </div>
            
            {/* Trade Type Selector with Enhanced Glassmorphism */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              minWidth: '200px',
              justifyContent: 'center'
            }}>
              <Button
                variant={tradeType === 'buy' ? 'primary' : 'ghost'}
                onClick={() => setTradeType('buy')}
                className="glass-card"
                style={{
                  flex: '1',
                  background: tradeType === 'buy' 
                    ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)' 
                    : 'rgba(20, 184, 166, 0.15)',
                  color: tradeType === 'buy' ? 'white' : '#14b8a6',
                  border: tradeType === 'buy' 
                    ? 'none' 
                    : '2px solid rgba(20, 184, 166, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.875rem',
                  fontWeight: '600',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s ease',
                  boxShadow: tradeType === 'buy' 
                    ? '0 8px 25px rgba(20, 184, 166, 0.4)' 
                    : '0 4px 15px rgba(20, 184, 166, 0.2)'
                }}
              >
                <TrendingUp size={18} style={{ marginRight: '0.5rem' }} />
                Buy
              </Button>
              <Button
                variant={tradeType === 'sell' ? 'primary' : 'ghost'}
                onClick={() => setTradeType('sell')}
                className="glass-card"
                style={{
                  flex: '1',
                  background: tradeType === 'sell' 
                    ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)' 
                    : 'rgba(20, 184, 166, 0.15)',
                  color: tradeType === 'sell' ? 'white' : '#14b8a6',
                  border: tradeType === 'sell' 
                    ? 'none' 
                    : '2px solid rgba(20, 184, 166, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.875rem',
                  fontWeight: '600',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s ease',
                  boxShadow: tradeType === 'sell' 
                    ? '0 8px 25px rgba(20, 184, 166, 0.4)' 
                    : '0 4px 15px rgba(20, 184, 166, 0.2)'
                }}
              >
                <TrendingDown size={18} style={{ marginRight: '0.5rem' }} />
                Sell
              </Button>
            </div>

            {/* Coin Selection with Glassmorphism */}
            <div style={{ 
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.875rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.2)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.4)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                }}
              >
                {coins.map(coin => (
                  <option key={coin.symbol} value={coin.symbol}>
                    {coin.icon} {coin.name} ({coin.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input with Glassmorphism */}
            <div style={{ 
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.875rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  backdropFilter: 'blur(16px)',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.2)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.4)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                }}
              />
            </div>

            {/* Trade Summary with Glassmorphism */}
            {amount && price > 0 && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                borderRadius: '0.875rem',
                border: '2px solid rgba(20, 184, 166, 0.4)',
                minWidth: '200px',
                textAlign: 'center',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 6px 20px rgba(20, 184, 166, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.2)';
              }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Total: ${(parseFloat(amount) * price).toFixed(2)}
                </div>
                <div style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600' }}>
                  ${price.toLocaleString()} per {selectedCoin}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {amount && price > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  minWidth: '200px',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(51, 65, 85, 0.5)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                }}>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    margin: '0 0 0.75rem 0',
                    fontWeight: '500'
                  }}>
                    Trade Summary
                  </p>
                  <p style={{
                    color: '#f8fafc',
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {parseFloat(amount)} {selectedCoin}
                  </p>
                  <p style={{
                    color: '#14b8a6',
                    fontSize: '0.875rem',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Total: ${(parseFloat(amount) * price).toLocaleString()}
                  </p>
                </div>
              )}
              
              <Button
                variant="primary"
                onClick={handleTrade}
                disabled={!amount || amount <= 0 || price <= 0 || isTradeExecuting}
                className="glass-card"
                style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 25px rgba(20, 184, 166, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 35px rgba(20, 184, 166, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.4)';
                }}
              >
                {isTradeExecuting ? 'Executing...' : (tradeType === 'buy' ? 'Buy' : 'Sell')} {selectedCoin}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Confirmation Modal */}
      {tradeConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <div style={{
              background: tradeConfirmation.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderRadius: '50%',
              width: '4rem',
              height: '4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              {tradeConfirmation.type === 'buy' ? (
                <TrendingUp size={32} color="#22c55e" />
              ) : (
                <TrendingDown size={32} color="#ef4444" />
              )}
            </div>
            
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Trade Successful! 🎉
            </h3>
            
            <div style={{
              background: 'rgba(51, 65, 85, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Type:</span>
                <span style={{ 
                  color: tradeConfirmation.type === 'buy' ? '#22c55e' : '#ef4444', 
                  fontWeight: '600',
                  marginLeft: '0.5rem',
                  textTransform: 'capitalize'
                }}>
                  {tradeConfirmation.type}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Coin:</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                  {tradeConfirmation.coin}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Amount:</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                  {tradeConfirmation.amount} {tradeConfirmation.coin}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Price:</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                  ${tradeConfirmation.price.toLocaleString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total:</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                  ${tradeConfirmation.total.toLocaleString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '0' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>New Balance:</span>
                <span style={{ color: '#14b8a6', fontWeight: '600', marginLeft: '0.5rem' }}>
                  ${tradeConfirmation.newBalance.toLocaleString()}
                </span>
              </div>
            </div>
            
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              {tradeConfirmation.message}
            </p>
            
            <Button
              variant="primary"
              onClick={() => setTradeConfirmation(null)}
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem'
              }}
            >
              Continue Trading
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trading;
