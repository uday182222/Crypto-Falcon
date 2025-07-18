import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Search, 
  Star, 
  Filter, 
  ArrowLeft,
  RefreshCw,
  Activity,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { tradingAPI, handleApiError } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import TradingChart from '../components/ui/TradingChart';

const Trading = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { asset: selectedAsset, action: initialAction } = location.state || {};
  
  // State Management
  const [selectedPair, setSelectedPair] = useState(selectedAsset ? `${selectedAsset.symbol}/USD` : 'BTC/USD');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState(initialAction || 'buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [balance, setBalance] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Market Data
  const [marketData, setMarketData] = useState({
    price: selectedAsset?.price || 0,
    change: selectedAsset?.change || 0,
    changePercent: selectedAsset?.change_percent || 0,
    volume: 0,
    high24h: 0,
    low24h: 0,
    marketCap: 0
  });

  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(selectedAsset?.symbol || 'BTC');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
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

  // Data fetching
  const fetchMarketData = useCallback(async () => {
    try {
      const [pricesResponse, balanceResponse] = await Promise.all([
        tradingAPI.getCryptoPrices(),
        tradingAPI.getPortfolio()
      ]);

      const pricesData = pricesResponse.data?.prices || [];
      setPrices(pricesData);
      setTradingPairs(pricesData);

      // Find current coin data
      const currentCoinData = pricesData.find(coin => coin.symbol === selectedCoin);
      if (currentCoinData) {
        setMarketData({
          price: currentCoinData.price || 0,
          change: currentCoinData.change_24h || 0,
          changePercent: currentCoinData.change_24h || 0,
          volume: currentCoinData.volume_24h || 0,
          high24h: currentCoinData.high_24h || 0,
          low24h: currentCoinData.low_24h || 0,
          marketCap: currentCoinData.market_cap || 0
        });
        
        // Auto-fill price for limit orders
        if (orderType === 'limit' && !price) {
          setPrice(currentCoinData.price.toString());
        }
      }

      setBalance(balanceResponse.data || null);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
      setToastMessage('Failed to load market data');
      setToastType('error');
      setShowToast(true);
    } finally {
      setPageLoading(false);
    }
  }, [selectedCoin, orderType, price]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchMarketData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMarketData, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMarketData, autoRefresh]);

  // Handle coin selection
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin.symbol);
    setSelectedPair(`${coin.symbol}/USD`);
    setSearchTerm('');
    
    // Update market data immediately
    setMarketData({
      price: coin.price || 0,
      change: coin.change_24h || 0,
      changePercent: coin.change_24h || 0,
      volume: coin.volume_24h || 0,
      high24h: coin.high_24h || 0,
      low24h: coin.low_24h || 0,
      marketCap: coin.market_cap || 0
    });

    // Auto-fill price for limit orders
    if (orderType === 'limit') {
      setPrice(coin.price.toString());
    }
  };

  // Handle order type change
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === 'limit' && marketData.price) {
      setPrice(marketData.price.toString());
    } else if (type === 'market') {
      setPrice('');
    }
  };

  // Calculate order total
  const calculateTotal = () => {
    const qty = parseFloat(amount) || 0;
    const orderPrice = orderType === 'market' ? marketData.price : (parseFloat(price) || 0);
    return qty * orderPrice;
  };

  // Handle trade execution
  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setToastMessage('Please enter a valid amount');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setToastMessage('Please enter a valid price');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const total = calculateTotal();
    const availableBalance = balance?.demo_balance || 0;

    if (side === 'buy' && total > availableBalance) {
      setToastMessage('Insufficient balance');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      
      const tradeData = {
        coin_symbol: selectedCoin,
        quantity: parseFloat(amount),
        side: side,
        order_type: orderType
      };

      if (orderType === 'limit') {
        tradeData.price = parseFloat(price);
      }

      const response = side === 'buy' 
        ? await tradingAPI.buyTrade(tradeData)
        : await tradingAPI.sellTrade(tradeData);

      if (response.data) {
        setToastMessage(`${side === 'buy' ? 'Buy' : 'Sell'} order executed successfully!`);
        setToastType('success');
        setShowToast(true);
        
        // Reset form
        setAmount('');
        setPrice(orderType === 'limit' ? marketData.price.toString() : '');
        
        // Refresh balance
        await fetchMarketData();
      }
    } catch (error) {
      console.error('Trade error:', error);
      setToastMessage(handleApiError(error));
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter trading pairs
  const filteredPairs = tradingPairs.filter(pair => 
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (pageLoading) {
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

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1600px',
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

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            style={{ padding: '0.5rem' }}
          >
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </Button>
          
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem'
            }} className="text-gradient">
              Trading
            </h1>
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '1.125rem'
            }}>
              {selectedPair} • {formatCurrency(marketData.price)}
            </p>
          </div>
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
            {lastUpdate.toLocaleTimeString()}
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
            onClick={fetchMarketData}
            variant="secondary"
            style={{ padding: '0.5rem' }}
          >
            <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} />
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '2rem' }}>
        {/* Trading Pairs Sidebar */}
        <div>
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1rem',
                    height: '1rem',
                    color: '#94a3b8'
                  }} />
                  <input
                    type="text"
                    placeholder="Search pairs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                      background: 'rgba(71, 85, 105, 0.2)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredPairs.map((pair, index) => (
                  <div
                    key={index}
                    onClick={() => handleCoinSelect(pair)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      background: selectedCoin === pair.symbol ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: selectedCoin === pair.symbol ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCoin !== pair.symbol) {
                        e.currentTarget.style.background = 'rgba(71, 85, 105, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCoin !== pair.symbol) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                          {pair.symbol}/USD
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {pair.name}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                          {formatCurrency(pair.price)}
                        </p>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: getChangeColor(pair.change_24h),
                          fontWeight: '500'
                        }}>
                          {formatPercent(pair.change_24h)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Trading Area */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* TradingView Chart */}
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#f8fafc'
                }}>
                  {selectedCoin} Price Chart
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#94a3b8'
                }}>
                  <BarChart3 style={{ width: '1rem', height: '1rem' }} />
                  Live TradingView Data
                </div>
              </div>
              <TradingChart 
                coinSymbol={selectedCoin}
                height={500}
                showLoading={true}
              />
            </div>
          </Card>

          {/* Market Data */}
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>
                    {selectedCoin.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f8fafc' }}>
                      {selectedCoin}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      {selectedPair}
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#f8fafc',
                    marginBottom: '0.25rem'
                  }}>
                    {formatCurrency(marketData.price)}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: getChangeColor(marketData.change),
                    justifyContent: 'flex-end'
                  }}>
                    {getChangeIcon(marketData.change)}
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {formatPercent(marketData.changePercent)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem'
              }}>
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>24h High</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#22c55e' }}>
                    {formatCurrency(marketData.high24h)}
                  </p>
                </div>
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>24h Low</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#ef4444' }}>
                    {formatCurrency(marketData.low24h)}
                  </p>
                </div>
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>24h Volume</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                    {formatCurrency(marketData.volume)}
                  </p>
                </div>
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Market Cap</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                    {formatCurrency(marketData.marketCap)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Popular Pairs */}
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#f8fafc',
                marginBottom: '1rem'
              }}>
                Popular Pairs
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem'
              }}>
                {prices.slice(0, 6).map((pair, index) => (
                  <div
                    key={index}
                    onClick={() => handleCoinSelect(pair)}
                    style={{
                      padding: '1rem',
                      background: 'rgba(71, 85, 105, 0.2)',
                      borderRadius: '0.5rem',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                          {pair.symbol}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {pair.name}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                          {formatCurrency(pair.price)}
                        </p>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: getChangeColor(pair.change_24h),
                          fontWeight: '500'
                        }}>
                          {formatPercent(pair.change_24h)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Trading Panel */}
        <div>
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem' }}>
              {/* Balance */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Available Balance</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#22c55e' }}>
                    {balanceVisible ? formatCurrency(balance?.demo_balance || 0) : '••••••'}
                  </p>
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

              {/* Order Type Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '1.5rem',
                padding: '0.25rem',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                {['market', 'limit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleOrderTypeChange(type)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      background: orderType === type ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
                      color: orderType === type ? 'white' : '#94a3b8',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Buy/Sell Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '1.5rem',
                padding: '0.25rem',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <button
                  onClick={() => setSide('buy')}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    background: side === 'buy' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'transparent',
                    color: side === 'buy' ? 'white' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide('sell')}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    background: side === 'sell' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
                    color: side === 'sell' ? 'white' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sell
                </button>
              </div>

              {/* Order Form */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                {orderType === 'limit' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: '#94a3b8',
                      marginBottom: '0.5rem'
                    }}>
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(71, 85, 105, 0.2)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#94a3b8',
                    marginBottom: '0.5rem'
                  }}>
                    Amount ({selectedCoin})
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.000001"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(71, 85, 105, 0.2)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['25%', '50%', '75%', '100%'].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => {
                        const availableBalance = balance?.demo_balance || 0;
                        const orderPrice = orderType === 'market' ? marketData.price : (parseFloat(price) || marketData.price);
                        const maxAmount = side === 'buy' ? availableBalance / orderPrice : 0; // For sell, we'd need holdings data
                        const percentage = parseFloat(percent) / 100;
                        setAmount((maxAmount * percentage).toFixed(6));
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'rgba(71, 85, 105, 0.2)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '0.25rem',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {percent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              {amount && (
                <div style={{ 
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      {orderType === 'market' ? 'Market Price' : 'Limit Price'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#f8fafc' }}>
                      {formatCurrency(orderType === 'market' ? marketData.price : parseFloat(price) || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Amount</span>
                    <span style={{ fontSize: '0.875rem', color: '#f8fafc' }}>
                      {parseFloat(amount).toFixed(6)} {selectedCoin}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>Total</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              <Button
                onClick={handleTrade}
                disabled={loading || !amount || (orderType === 'limit' && !price)}
                variant="primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: side === 'buy' 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <RefreshCw style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    {side === 'buy' ? <Plus style={{ width: '1rem', height: '1rem' }} /> : <Minus style={{ width: '1rem', height: '1rem' }} />}
                    {side === 'buy' ? 'Buy' : 'Sell'} {selectedCoin}
                  </>
                )}
              </Button>

              {/* Quick Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                <Button
                  onClick={() => navigate('/portfolio')}
                  variant="secondary"
                  style={{ 
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <Activity style={{ width: '0.875rem', height: '0.875rem' }} />
                  Portfolio
                </Button>
                <Button
                  onClick={() => navigate('/buy-coins')}
                  variant="secondary"
                  style={{ 
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
                  Add Funds
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Trading; 