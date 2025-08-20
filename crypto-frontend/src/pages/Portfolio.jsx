import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Coins, DollarSign, Activity, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingAnimation from '../components/ui/LoadingAnimation';
import { dashboardAPI } from '../services/api';

const Portfolio = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0
  });
  const [holdings, setHoldings] = useState([]);
  const [sortBy, setSortBy] = useState('value'); // value, profit, name
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [sellModal, setSellModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState(0);
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
    
    // Listen for portfolio refresh events from trading
    const handlePortfolioRefresh = () => {
      console.log('Portfolio refresh event received');
      fetchPortfolioData();
    };
    
    window.addEventListener('portfolio-refresh', handlePortfolioRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('portfolio-refresh', handlePortfolioRefresh);
    };
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const portfolioResponse = await dashboardAPI.getPortfolio();
      
      if (portfolioResponse.success) {
        const portfolio = portfolioResponse;
        setPortfolioData({
          totalValue: parseFloat(portfolio.total_portfolio_value || 0),
          totalInvested: parseFloat(portfolio.total_invested || 0),
          totalProfitLoss: parseFloat(portfolio.total_profit_loss || 0),
          totalProfitLossPercent: parseFloat(portfolio.total_profit_loss_percent || 0)
        });
        
        if (portfolio.holdings && Array.isArray(portfolio.holdings)) {
          setHoldings(portfolio.holdings);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortHoldings = (holdings, sortBy, sortOrder) => {
    return [...holdings].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'value':
          aValue = parseFloat(a.current_value);
          bValue = parseFloat(b.current_value);
          break;
        case 'profit':
          aValue = parseFloat(a.profit_loss);
          bValue = parseFloat(b.profit_loss);
          break;
        case 'name':
          aValue = a.coin_symbol.toLowerCase();
          bValue = b.coin_symbol.toLowerCase();
          break;
        default:
          aValue = parseFloat(a.current_value);
          bValue = parseFloat(b.current_value);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getCoinName = (symbol) => {
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
      'UNI': 'Uniswap'
    };
    return coinNames[symbol] || symbol;
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleSell = (holding) => {
    setSelectedHolding(holding);
    setSellAmount('');
    setSellPrice(parseFloat(holding.current_value) / parseFloat(holding.quantity));
    setSellModal(true);
  };

  const handleBuyMore = (holding) => {
    // Navigate to trading page with the specific coin selected
    console.log('Buy more clicked for:', holding.coin_symbol);
    navigate(`/trading?coin=${holding.coin_symbol}`);
  };

  const executeSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      alert('Please enter a valid amount to sell');
      return;
    }

    if (parseFloat(sellAmount) > parseFloat(selectedHolding.quantity)) {
      alert('You cannot sell more than you own');
      return;
    }

    try {
      setIsSelling(true);
      
      // TODO: Implement actual sell API call
      // const response = await dashboardAPI.sellCrypto({
      //   coin_symbol: selectedHolding.coin_symbol,
      //   quantity: parseFloat(sellAmount),
      //   price: sellPrice
      // });

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - close modal and refresh portfolio
      setSellModal(false);
      setSelectedHolding(null);
      setSellAmount('');
      setSellPrice(0);
      
      // Refresh portfolio data
      fetchPortfolioData();
      
      // Show success message
      alert(`Successfully sold ${sellAmount} ${selectedHolding.coin_symbol}`);
      
    } catch (error) {
      console.error('Error executing sell:', error);
      alert('Failed to execute sell. Please try again.');
    } finally {
      setIsSelling(false);
    }
  };

  const closeSellModal = () => {
    setSellModal(false);
    setSelectedHolding(null);
    setSellAmount('');
    setSellPrice(0);
  };

  if (isLoading) {
    return <LoadingAnimation message="Loading Portfolio..." size="large" />;
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
          maxWidth: '500px',
          backdropFilter: 'blur(8px)'
        }}>
          <h2 style={{
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            Error Loading Portfolio
          </h2>
          <p style={{
            color: '#94a3b8',
            marginBottom: '1.5rem'
          }}>
            {error}
          </p>
          <Button 
            variant="primary" 
            onClick={fetchPortfolioData}
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              marginRight: '1rem'
            }}
          >
            Retry
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            style={{
              color: '#14b8a6',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.3)'
            }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const sortedHoldings = sortHoldings(holdings, sortBy, sortOrder);

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
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              style={{
                color: '#14b8a6',
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                padding: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowLeft size={20} />
            </Button>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            Full Portfolio
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem',
            margin: 0
          }}>
            Complete overview of all your cryptocurrency holdings
          </p>
        </div>

        {/* Portfolio Summary Cards */}
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

          {/* Total Invested */}
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
              Total Invested
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              ${portfolioData.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Profit/Loss */}
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
              background: portfolioData.totalProfitLoss >= 0 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
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
                background: portfolioData.totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.75rem',
                color: portfolioData.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'
              }}>
                {portfolioData.totalProfitLoss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Total Profit/Loss
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: portfolioData.totalProfitLoss >= 0 ? '#10b981' : '#ef4444',
              margin: 0
            }}>
              {portfolioData.totalProfitLoss >= 0 ? '+' : ''}${portfolioData.totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{
              fontSize: '1rem',
              color: portfolioData.totalProfitLoss >= 0 ? '#10b981' : '#ef4444',
              margin: '0.5rem 0 0 0',
              fontWeight: '500'
            }}>
              {portfolioData.totalProfitLoss >= 0 ? '+' : ''}{portfolioData.totalProfitLossPercent.toFixed(2)}%
            </p>
          </div>

          {/* Total Holdings */}
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
                <Activity size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Total Holdings
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {holdings.length}
            </p>
          </div>
        </div>

        {/* Holdings Table */}
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
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              margin: 0
            }}>
              All Holdings
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Button 
                variant="ghost" 
                onClick={fetchPortfolioData}
                style={{
                  color: '#14b8a6',
                  background: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Sort Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(51, 65, 85, 0.3)',
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sort by:</span>
            <Button 
              variant={sortBy === 'value' ? 'primary' : 'ghost'}
              onClick={() => handleSort('value')}
              style={{
                background: sortBy === 'value' ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)' : 'transparent',
                color: sortBy === 'value' ? 'white' : '#14b8a6',
                border: sortBy === 'value' ? 'none' : '1px solid rgba(20, 184, 166, 0.3)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
            >
              Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant={sortBy === 'profit' ? 'primary' : 'ghost'}
              onClick={() => handleSort('profit')}
              style={{
                background: sortBy === 'profit' ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)' : 'transparent',
                color: sortBy === 'profit' ? 'white' : '#14b8a6',
                border: sortBy === 'profit' ? 'none' : '1px solid rgba(20, 184, 166, 0.3)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
            >
              Profit/Loss {sortBy === 'profit' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant={sortBy === 'name' ? 'primary' : 'ghost'}
              onClick={() => handleSort('name')}
              style={{
                background: sortBy === 'name' ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)' : 'transparent',
                color: sortBy === 'name' ? 'white' : '#14b8a6',
                border: sortBy === 'name' ? 'none' : '1px solid rgba(20, 184, 166, 0.3)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>

          {/* Holdings List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {sortedHoldings.length > 0 ? (
              <>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.5fr',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.05) 100%)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: '#f8fafc',
                  backdropFilter: 'blur(4px)'
                }}>
                  <div>Coin</div>
                  <div>Quantity</div>
                  <div>Current Value</div>
                  <div>Avg Buy Price</div>
                  <div>Total Invested</div>
                  <div>Profit/Loss</div>
                  <div>Actions</div>
                </div>
                
                {/* Holdings Rows */}
                {sortedHoldings.map((holding, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.5fr',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(20, 184, 166, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    
                    {/* Coin Column */}
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
                        fontWeight: '700',
                        fontSize: '0.875rem'
                      }}>
                        {holding.coin_symbol}
                      </div>
                      <div>
                        <p style={{
                          color: '#f8fafc',
                          fontWeight: '600',
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem'
                        }}>
                          {getCoinName(holding.coin_symbol)}
                        </p>
                        <p style={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          margin: 0
                        }}>
                          {holding.coin_symbol}
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantity Column */}
                    <div>
                      <p style={{
                        color: '#f8fafc',
                        fontWeight: '500',
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        {parseFloat(holding.quantity).toFixed(4)}
                      </p>
                    </div>
                    
                    {/* Current Value Column */}
                    <div>
                      <p style={{
                        color: '#f8fafc',
                        fontWeight: '500',
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        ${parseFloat(holding.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Avg Buy Price Column */}
                    <div>
                      <p style={{
                        color: '#f8fafc',
                        fontWeight: '500',
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        ${parseFloat(holding.avg_buy_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Total Invested Column */}
                    <div>
                      <p style={{
                        color: '#f8fafc',
                        fontWeight: '500',
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        ${parseFloat(holding.total_invested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Profit/Loss Column */}
                    <div>
                      <div style={{
                        padding: '0.5rem',
                        background: parseFloat(holding.profit_loss) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '0.375rem',
                        border: `1px solid ${parseFloat(holding.profit_loss) >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        textAlign: 'center',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <p style={{
                          color: parseFloat(holding.profit_loss) >= 0 ? '#10b981' : '#ef4444',
                          fontWeight: '600',
                          margin: '0 0 0.125rem 0',
                          fontSize: '0.875rem'
                        }}>
                          {parseFloat(holding.profit_loss) >= 0 ? '+' : ''}${parseFloat(holding.profit_loss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p style={{
                          color: parseFloat(holding.profit_loss) >= 0 ? '#10b981' : '#ef4444',
                          fontSize: '0.75rem',
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          {parseFloat(holding.profit_loss) >= 0 ? '+' : ''}{parseFloat(holding.profit_loss_percent).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions Column */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSell(holding)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease',
                          minWidth: '60px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        Sell
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleBuyMore(holding)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        Buy More
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <Coins size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{
                  color: '#f8fafc',
                  marginBottom: '0.5rem'
                }}>
                  No Holdings Yet
                </h3>
                <p style={{
                  marginBottom: '1.5rem'
                }}>
                  Start trading to build your portfolio
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/trading')}
                  style={{
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

      {/* Sell Modal */}
      {sellModal && selectedHolding && (
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <h2 style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                Sell {selectedHolding.coin_symbol}
              </h2>
              <button
                onClick={closeSellModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                ×
              </button>
            </div>

            {/* Holding Info */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Available:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                    {parseFloat(selectedHolding.quantity).toFixed(4)} {selectedHolding.coin_symbol}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Current Value:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                    ${parseFloat(selectedHolding.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Avg Buy Price:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                    ${parseFloat(selectedHolding.avg_buy_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Current Price:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                    ${sellPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sell Form */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Amount to Sell ({selectedHolding.coin_symbol})
              </label>
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder={`0.0000 ${selectedHolding.coin_symbol}`}
                step="0.0001"
                min="0"
                max={selectedHolding.quantity}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(20, 184, 166, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              {/* Quick Amount Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.75rem'
              }}>
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => {
                      const amount = (parseFloat(selectedHolding.quantity) * percent) / 100;
                      setSellAmount(amount.toFixed(4));
                    }}
                    style={{
                      background: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.3)',
                      color: '#14b8a6',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(20, 184, 166, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(20, 184, 166, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)';
                    }}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            {/* Sell Summary */}
            {sellAmount && parseFloat(sellAmount) > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{
                  color: '#ef4444',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: '0 0 0.75rem 0'
                }}>
                  Sell Summary
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Amount:</span>
                    <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                      {parseFloat(sellAmount).toFixed(4)} {selectedHolding.coin_symbol}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Price:</span>
                    <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                      ${sellPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Total Value:</span>
                    <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                      ${(parseFloat(sellAmount) * sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Remaining:</span>
                    <span style={{ color: '#f8fafc', fontWeight: '600', marginLeft: '0.5rem' }}>
                      {(parseFloat(selectedHolding.quantity) - parseFloat(sellAmount)).toFixed(4)} {selectedHolding.coin_symbol}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="ghost"
                onClick={closeSellModal}
                style={{
                  background: 'rgba(51, 65, 85, 0.3)',
                  color: '#94a3b8',
                  border: '1px solid rgba(51, 65, 85, 0.5)'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={executeSell}
                disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > parseFloat(selectedHolding.quantity) || isSelling}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  minWidth: '100px'
                }}
              >
                {isSelling ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }} />
                    Selling...
                  </>
                ) : (
                  `Sell ${selectedHolding.coin_symbol}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
