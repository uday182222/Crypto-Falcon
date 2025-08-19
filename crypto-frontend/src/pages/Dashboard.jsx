import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, ArrowUpRight, ArrowDownRight, Coins, Shield, Trophy, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingAnimation from '../components/ui/LoadingAnimation';
import Footer from '../components/layout/Footer';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data state
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    dailyChange: 0,
    totalTrades: 0,
    winRate: 0
  });
  
  const [marketData, setMarketData] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: 'USD'
  });
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);
  const [lastMarketUpdate, setLastMarketUpdate] = useState(null);
  const [portfolioHoldings, setPortfolioHoldings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for dashboard refresh events from trading
    const handleDashboardRefresh = () => {
      console.log('Dashboard refresh event received');
      fetchDashboardData();
    };
    
    window.addEventListener('dashboard-refresh', handleDashboardRefresh);
    
    // Set up auto-refresh for market data every 30 seconds
    const marketDataInterval = setInterval(() => {
      refreshMarketData();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(marketDataInterval);
      window.removeEventListener('dashboard-refresh', handleDashboardRefresh);
    };
  }, []);

  const refreshMarketData = async () => {
    try {
      setIsRefreshingMarket(true);
      const pricesResponse = await dashboardAPI.getCryptoPrices();
      if (pricesResponse.success) {
        const prices = pricesResponse.data.prices || [];
        setMarketData(prices.map(coin => ({
          name: coin.name || coin.symbol,
          symbol: coin.symbol,
          price: `$${parseFloat(coin.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${coin.change_24h_percent >= 0 ? '+' : ''}${parseFloat(coin.change_24h_percent).toFixed(2)}%`,
          isPositive: coin.change_24h_percent >= 0,
          volume: `$${(parseFloat(coin.volume) * parseFloat(coin.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}M`,
          high24h: parseFloat(coin.high_24h),
          low24h: parseFloat(coin.low_24h),
          lastUpdated: coin.last_updated
        })));
        setLastMarketUpdate(new Date());
      }
    } catch (error) {
      console.error('Error refreshing market data:', error);
    } finally {
      setIsRefreshingMarket(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [portfolioResponse, walletResponse, pricesResponse] = await Promise.all([
        dashboardAPI.getPortfolio(),
        dashboardAPI.getWalletSummary(),
        dashboardAPI.getCryptoPrices()
      ]);

      // Process portfolio data
      if (portfolioResponse.success) {
        const portfolio = portfolioResponse;
        setPortfolioData({
          totalValue: parseFloat(portfolio.total_portfolio_value || 0),
          dailyChange: parseFloat(portfolio.total_profit_loss_percent || 0),
          totalTrades: portfolio.holdings?.length || 0,
          winRate: portfolio.holdings?.filter(h => parseFloat(h.profit_loss) > 0).length / (portfolio.holdings?.length || 1) * 100 || 0
        });
        
        // Store actual holdings data
        if (portfolio.holdings && Array.isArray(portfolio.holdings)) {
          // Sort by current value and take top 4
          const sortedHoldings = portfolio.holdings
            .sort((a, b) => parseFloat(b.current_value) - parseFloat(a.current_value))
            .slice(0, 4);
          setPortfolioHoldings(sortedHoldings);
        }
      }

      // Process wallet data
      if (walletResponse.success) {
        const wallet = walletResponse;
        setWalletData({
          balance: parseFloat(wallet.balance || 0),
          currency: wallet.currency || 'USD'
        });
      }

      // Process market prices
      if (pricesResponse.success) {
        const prices = pricesResponse.data.prices || [];
        setMarketData(prices.map(coin => ({
          name: coin.name || coin.symbol,
          symbol: coin.symbol,
          price: `$${parseFloat(coin.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${coin.change_24h_percent >= 0 ? '+' : ''}${parseFloat(coin.change_24h_percent).toFixed(2)}%`,
          isPositive: coin.change_24h_percent >= 0,
          volume: `$${(parseFloat(coin.volume) * parseFloat(coin.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}M`,
          high24h: parseFloat(coin.high_24h),
          low24h: parseFloat(coin.low_24h),
          lastUpdated: coin.last_updated
        })));
        setLastMarketUpdate(new Date());
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data if API fails
      setPortfolioData({
        totalValue: 100000,
        dailyChange: 0,
        totalTrades: 0,
        winRate: 0
      });
      setWalletData({ balance: 100000, currency: 'USD' });
    } finally {
      setIsLoading(false);
    }
  };



  const getCoinName = (symbol) => {
    const coin = marketData.find(c => c.symbol === symbol);
    return coin ? coin.name : symbol;
  };

  if (isLoading) {
    return <LoadingAnimation message="Loading Dashboard..." size="large" />;
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
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            Error Loading Dashboard
          </h2>
          <p style={{
            color: '#94a3b8',
            marginBottom: '1.5rem'
          }}>
            {error}
          </p>
          <Button 
            variant="primary" 
            onClick={fetchDashboardData}
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            Retry
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
        {/* Header Section */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            Welcome back, Trader! 👋
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem'
          }}>
            Here's what's happening with your portfolio today
          </p>
        </div>

        {/* Portfolio Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Portfolio Value */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '0.75rem',
                color: '#14b8a6'
              }}>
                <DollarSign size={24} />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: portfolioData.dailyChange >= 0 ? '#10b981' : '#ef4444'
              }}>
                {portfolioData.dailyChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange.toFixed(2)}%
                </span>
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Total Portfolio Value
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              ${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Available Balance */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '0.75rem',
                color: '#8b5cf6'
              }}>
                <Coins size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Available Balance
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              ${walletData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Win Rate */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '0.75rem',
                color: '#10b981'
              }}>
                <Trophy size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Win Rate
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {portfolioData.winRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          marginBottom: '2rem'
        }}>
          {/* Market Overview */}
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    Live Market Data
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }} />
                  </h2>
                  {lastMarketUpdate && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: 0
                    }}>
                      Last updated: {lastMarketUpdate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  onClick={refreshMarketData}
                  disabled={isRefreshingMarket}
                  style={{
                    color: '#14b8a6',
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    opacity: isRefreshingMarket ? 0.6 : 1
                  }}
                >
                  {isRefreshingMarket ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(20, 184, 166, 0.3)',
                        borderTop: '2px solid #14b8a6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Refreshing...
                    </div>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {marketData.length > 0 ? (
                  marketData.map((crypto, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.3)';
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {crypto.symbol}
                        </div>
                        <div>
                          <p style={{
                            color: '#f8fafc',
                            fontWeight: '600',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {crypto.name}
                          </p>
                          <p style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            margin: 0
                          }}>
                            {crypto.volume}
                          </p>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        textAlign: 'right' 
                      }}>
                        <div>
                          <p style={{
                            color: '#f8fafc',
                            fontWeight: '600',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {crypto.price}
                          </p>
                          <p style={{
                            color: crypto.isPositive ? '#10b981' : '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            margin: 0
                          }}>
                            {crypto.change}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => navigate('/trading')}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            minWidth: '80px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          Trade
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    <LoadingAnimation message="Loading market data..." size="small" />
                  </div>
                )}
              </div>
            </div>
          </div>

          
        </div>

        {/* Portfolio Holdings */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc'
            }}>
              Portfolio Holdings
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/portfolio')}
              style={{
                color: '#14b8a6',
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)'
              }}
            >
              View Full Portfolio
            </Button>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Portfolio Summary Card */}
            {portfolioData.totalTrades > 0 && (
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}>
                      Top 4 Holdings
                    </p>
                    <p style={{
                      color: '#f8fafc',
                      fontWeight: '700',
                      margin: 0,
                      fontSize: '1.5rem'
                    }}>
                      {Math.min(portfolioHoldings.length, 4)}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}>
                      Portfolio Value
                    </p>
                    <p style={{
                      color: '#f8fafc',
                      fontWeight: '700',
                      margin: 0,
                      fontSize: '1.5rem'
                    }}>
                      ${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}>
                      Win Rate
                    </p>
                    <p style={{
                      color: '#f8fafc',
                      fontWeight: '700',
                      margin: 0,
                      fontSize: '1.5rem'
                    }}>
                      {portfolioData.winRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {portfolioHoldings.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {portfolioHoldings.map((holding, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Background glow effect */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                      borderRadius: '50%',
                      filter: 'blur(15px)'
                    }} />
                    
                    {/* Coin symbol and name */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.125rem'
                      }}>
                        {holding.coin_symbol}
                      </div>
                      <div>
                        <h3 style={{
                          color: '#f8fafc',
                          fontWeight: '600',
                          margin: '0 0 0.25rem 0',
                          fontSize: '1.125rem'
                        }}>
                          {getCoinName(holding.coin_symbol)}
                        </h3>
                        <p style={{
                          color: '#64748b',
                          fontSize: '0.875rem',
                          margin: 0
                        }}>
                          {parseFloat(holding.quantity).toFixed(4)} {holding.coin_symbol}
                        </p>
                      </div>
                    </div>
                    
                    {/* Holdings details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <p style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          margin: '0 0 0.25rem 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}>
                          Current Value
                        </p>
                        <p style={{
                          color: '#f8fafc',
                          fontWeight: '600',
                          margin: 0,
                          fontSize: '1rem'
                        }}>
                          ${parseFloat(holding.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          margin: '0 0 0.25rem 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}>
                          Avg Buy Price
                        </p>
                        <p style={{
                          color: '#f8fafc',
                          fontWeight: '600',
                          margin: 0,
                          fontSize: '1rem'
                        }}>
                          ${parseFloat(holding.avg_buy_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Profit/Loss */}
                    <div style={{
                      padding: '0.75rem',
                      background: parseFloat(holding.profit_loss) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${parseFloat(holding.profit_loss) >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      textAlign: 'center'
                    }}>
                      <p style={{
                        color: parseFloat(holding.profit_loss) >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: '600',
                        margin: '0 0 0.25rem 0',
                        fontSize: '1.125rem'
                      }}>
                        {parseFloat(holding.profit_loss) >= 0 ? '+' : ''}${parseFloat(holding.profit_loss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p style={{
                        color: parseFloat(holding.profit_loss) >= 0 ? '#10b981' : '#ef4444',
                        fontSize: '0.875rem',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {parseFloat(holding.profit_loss_percent) >= 0 ? '+' : ''}{parseFloat(holding.profit_loss_percent).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Show message if there are more holdings */}
                {portfolioData.totalTrades > 4 && (
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Trophy size={32} style={{ marginBottom: '1rem', color: '#14b8a6' }} />
                    <p style={{
                      color: '#f8fafc',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0'
                    }}>
                      More Holdings Available
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Showing top 4 of {portfolioData.totalTrades} holdings
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <Coins size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No portfolio holdings yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Start trading to build your portfolio
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/trading')}
                  style={{
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Start Trading Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
