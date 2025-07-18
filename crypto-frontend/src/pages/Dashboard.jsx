import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tradingAPI } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  BarChart3, 
  Activity, 
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('value');

  // Real-time data refresh
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioResponse, pricesResponse] = await Promise.all([
        tradingAPI.getPortfolio(),
        tradingAPI.getCryptoPrices()
      ]);

      setPortfolioData(portfolioResponse.data || {});
      setMarketData(pricesResponse.data?.prices?.slice(0, 8) || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent) => {
    if (!percent && percent !== 0) return '0.00%';
    return `${percent >= 0 ? '+' : ''}${Number(percent).toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#22c55e';
    if (change < 0) return '#ef4444';
    return '#94a3b8';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight style={{ width: '1rem', height: '1rem' }} />;
    if (change < 0) return <ArrowDownRight style={{ width: '1rem', height: '1rem' }} />;
    return <Minus style={{ width: '1rem', height: '1rem' }} />;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const totalValue = portfolioData?.total_portfolio_value || 0;
  const totalPnL = portfolioData?.total_pnl || 0;
  const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
  const demoBalance = portfolioData?.demo_balance || 0;
  const holdingsCount = portfolioData?.holdings?.length || 0;

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }}></div>

      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem'
          }} className="text-gradient">
            Welcome back, {user?.username || 'Trader'}!
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(71, 85, 105, 0.2)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            <Clock style={{ width: '1rem', height: '1rem' }} />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>

          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'primary' : 'secondary'}
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Zap style={{ width: '1rem', height: '1rem' }} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>

          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="secondary"
            style={{ padding: '0.75rem' }}
          >
            <RefreshCw style={{ 
              width: '1.25rem', 
              height: '1.25rem',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem'
      }}>
        {/* Total Portfolio Value */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '0.75rem'
                }}>
                  <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Portfolio</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Including P&L</p>
                </div>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#94a3b8', 
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {balanceVisible ? <Eye style={{ width: '1rem', height: '1rem' }} /> : <EyeOff style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: '#f8fafc',
                marginBottom: '0.25rem'
              }}>
                {balanceVisible ? formatCurrency(totalValue) : '••••••'}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: getChangeColor(totalPnL)
              }}>
                {getChangeIcon(totalPnL)}
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {balanceVisible ? formatCurrency(totalPnL) : '••••'} ({balanceVisible ? formatPercent(totalPnLPercent) : '••••'})
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              <Button
                onClick={() => navigate('/trading')}
                variant="primary"
                style={{ 
                  flex: 1,
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Buy
              </Button>
              <Button
                onClick={() => navigate('/portfolio')}
                variant="secondary"
                style={{ 
                  flex: 1,
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                <Activity style={{ width: '1rem', height: '1rem' }} />
                Manage
              </Button>
            </div>
          </div>
        </Card>

        {/* Demo Balance */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '0.75rem'
              }}>
                <Wallet style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Available Balance</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready to trade</p>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#22c55e',
              marginBottom: '1rem'
            }}>
              {balanceVisible ? formatCurrency(demoBalance) : '••••••'}
            </div>

            <Button
              onClick={() => navigate('/buy-coins')}
              variant="primary"
              style={{ 
                width: '100%',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add Funds
            </Button>
          </div>
        </Card>

        {/* Active Positions */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.75rem'
              }}>
                <Target style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Active Positions</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Diversified holdings</p>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              {holdingsCount}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '0.5rem'
            }}>
              <Button
                onClick={() => navigate('/portfolio')}
                variant="primary"
                style={{ 
                  flex: 1,
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                }}
              >
                <Eye style={{ width: '1rem', height: '1rem' }} />
                View All
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Market Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#f8fafc'
          }}>
            Market Overview
          </h2>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['1h', '24h', '7d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                style={{
                  padding: '0.5rem 1rem',
                  background: timeframe === period ? 'rgba(59, 130, 246, 0.2)' : 'rgba(71, 85, 105, 0.2)',
                  border: timeframe === period ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '0.5rem',
                  color: timeframe === period ? '#3b82f6' : '#94a3b8',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem'
            }}>
              {marketData.map((coin, index) => (
                <div 
                  key={index} 
                  onClick={() => navigate('/trading', { state: { asset: coin } })}
                  style={{
                    padding: '1rem',
                    background: 'rgba(71, 85, 105, 0.2)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f8fafc' }}>
                        {coin.symbol}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {coin.name}
                      </p>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: getChangeColor(coin.change_24h)
                    }}>
                      {getChangeIcon(coin.change_24h)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>
                      {formatCurrency(coin.price)}
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: getChangeColor(coin.change_24h),
                      fontWeight: '500'
                    }}>
                      {formatPercent(coin.change_24h)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Holdings */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#f8fafc'
          }}>
            Your Holdings
          </h2>
          
          <Button
            onClick={() => navigate('/portfolio')}
            variant="secondary"
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            View All
          </Button>
        </div>

        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            {portfolioData?.holdings?.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {portfolioData.holdings.slice(0, 5).map((holding, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(71, 85, 105, 0.2)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => navigate('/trading', { state: { asset: { symbol: holding.symbol } } })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {holding.symbol?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#f8fafc' }}>
                          {holding.symbol}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                          {holding.quantity} coins
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>
                        {formatCurrency(holding.current_value)}
                      </p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: getChangeColor(holding.pnl),
                        fontWeight: '500'
                      }}>
                        {formatCurrency(holding.pnl)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                color: '#94a3b8'
              }}>
                <DollarSign style={{ 
                  width: '4rem', 
                  height: '4rem', 
                  margin: '0 auto 1rem',
                  color: '#475569'
                }} />
                <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  No holdings yet
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Start trading to build your portfolio!
                </p>
                <Button
                  onClick={() => navigate('/trading')}
                  variant="primary"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    padding: '0.75rem 2rem'
                  }}
                >
                  Start Trading
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 