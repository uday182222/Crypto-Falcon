import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity, 
  Calendar,
  BarChart3,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { tradingAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';

const Portfolio = () => {
  const navigate = useNavigate();
  
  // State Management
  const [holdings, setHoldings] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    availableBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellType, setSellType] = useState('partial'); // 'partial' or 'all'
  const [sellLoading, setSellLoading] = useState(false);
  
  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Data fetching
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const portfolioResponse = await tradingAPI.getPortfolio();
      
      if (!portfolioResponse || !portfolioResponse.data) {
        throw new Error('No portfolio data received');
      }

      const portfolioData = portfolioResponse.data;
      
      // Transform holdings to match the component's expected format
      const transformedHoldings = (portfolioData.holdings || []).map(holding => ({
        id: holding.id || Math.random().toString(36).substr(2, 9),
        symbol: holding.coin_symbol || holding.symbol,
        name: holding.coin_name || holding.name || holding.symbol,
        quantity: parseFloat(holding.quantity) || 0,
        averagePrice: parseFloat(holding.average_price) || 0,
        currentPrice: parseFloat(holding.current_price) || 0,
        currentValue: parseFloat(holding.current_value) || 0,
        pnl: parseFloat(holding.profit_loss) || 0,
        pnlPercent: parseFloat(holding.profit_loss_percent) || 0,
        allocation: 0, // Will be calculated below
        lastUpdated: new Date()
      }));

      // Calculate allocations
      const totalValue = transformedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
      transformedHoldings.forEach(holding => {
        holding.allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
      });

      setHoldings(transformedHoldings);
      setPortfolioStats({
        totalValue: parseFloat(portfolioData.total_portfolio_value) || 0,
        totalChange: parseFloat(portfolioData.total_pnl) || 0,
        totalChangePercent: parseFloat(portfolioData.total_profit_loss_percent) || 0,
        dayChange: parseFloat(portfolioData.day_change) || 0,
        dayChangePercent: parseFloat(portfolioData.day_change_percent) || 0,
        availableBalance: parseFloat(portfolioData.demo_balance) || 0
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setToastMessage('Failed to load portfolio data');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshing(false);
  };

  // Sell functionality
  const handleSellSubmit = async () => {
    if (!selectedHolding || !sellAmount || parseFloat(sellAmount) <= 0) {
      setToastMessage('Please enter a valid amount');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const quantity = parseFloat(sellAmount);
    if (quantity > selectedHolding.quantity) {
      setToastMessage('Insufficient quantity');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setSellLoading(true);
      const response = await tradingAPI.sellTrade({
        coin_symbol: selectedHolding.symbol,
        quantity: quantity,
        side: 'sell'
      });

      if (response.data) {
        setToastMessage(`Successfully sold ${quantity} ${selectedHolding.symbol}`);
        setToastType('success');
        setShowToast(true);
        setSellModalOpen(false);
        setSellAmount('');
        setSelectedHolding(null);
        setSellType('partial');
        
        // Refresh portfolio data
        await fetchPortfolio();
      }
    } catch (error) {
      console.error('Sell error:', error);
      setToastMessage(error.response?.data?.detail || 'Failed to execute sell order');
      setToastType('error');
      setShowToast(true);
    } finally {
      setSellLoading(false);
    }
  };

  const openSellModal = (holding) => {
    setSelectedHolding(holding);
    setSellModalOpen(true);
    setSellAmount('');
    setSellType('partial');
  };

  const handleSellAll = (holding) => {
    setSelectedHolding(holding);
    setSellAmount(holding.quantity.toString());
    setSellType('all');
    setSellModalOpen(true);
  };

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

  // Filtering and sorting
  const filteredAndSortedHoldings = holdings
    .filter(holding => {
      if (filterBy === 'profitable') return holding.pnl > 0;
      if (filterBy === 'losing') return holding.pnl < 0;
      if (searchTerm) return holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           holding.name.toLowerCase().includes(searchTerm.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'value':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'pnl':
          aValue = a.pnl;
          bValue = b.pnl;
          break;
        case 'allocation':
          aValue = a.allocation;
          bValue = b.allocation;
          break;
        default:
          aValue = a.currentValue;
          bValue = b.currentValue;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  useEffect(() => {
    fetchPortfolio();
  }, []);

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

      {/* Header */}
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
            Portfolio
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Track your investments and performance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            onClick={() => navigate('/trading')}
            variant="primary"
            style={{ 
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Buy More
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

      {/* Portfolio Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem'
      }}>
        {/* Total Value */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '0.75rem'
                }}>
                  <PieChart style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Value</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>All positions</p>
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
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#f8fafc',
              marginBottom: '0.5rem'
            }}>
              {balanceVisible ? formatCurrency(portfolioStats.totalValue) : '••••••'}
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: getChangeColor(portfolioStats.totalChange)
            }}>
              {getChangeIcon(portfolioStats.totalChange)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {balanceVisible ? formatCurrency(portfolioStats.totalChange) : '••••'} 
                ({balanceVisible ? formatPercent(portfolioStats.totalChangePercent) : '••••'})
              </span>
            </div>
          </div>
        </Card>

        {/* Available Balance */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '0.75rem'
              }}>
                <DollarSign style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Available Balance</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready to invest</p>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#22c55e',
              marginBottom: '0.5rem'
            }}>
              {balanceVisible ? formatCurrency(portfolioStats.availableBalance) : '••••••'}
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

        {/* Portfolio Diversity */}
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
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Positions</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Diversified</p>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#f8fafc',
              marginBottom: '0.5rem'
            }}>
              {holdings.length}
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {holdings.length > 0 ? 'Well diversified' : 'No positions yet'}
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                background: 'rgba(71, 85, 105, 0.2)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                width: '200px'
              }}
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(71, 85, 105, 0.2)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Holdings</option>
            <option value="profitable">Profitable</option>
            <option value="losing">Losing</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(71, 85, 105, 0.2)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          >
            <option value="value">Value</option>
            <option value="pnl">P&L</option>
            <option value="allocation">Allocation</option>
            <option value="symbol">Symbol</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '0.5rem',
              background: 'rgba(71, 85, 105, 0.2)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '0.5rem',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <Card variant="glass-dark" className="glow-effect">
        <div style={{ padding: '1.5rem' }}>
          {filteredAndSortedHoldings.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      Asset
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      Holdings
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      Value
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      P&L
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      Allocation
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedHoldings.map((holding, index) => (
                    <tr key={holding.id} style={{ 
                      borderBottom: index < filteredAndSortedHoldings.length - 1 ? '1px solid rgba(71, 85, 105, 0.2)' : 'none'
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {holding.symbol.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                              {holding.symbol}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {holding.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                            {holding.quantity.toFixed(6)}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            @ {formatCurrency(holding.averagePrice)}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                            {formatCurrency(holding.currentValue)}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {formatCurrency(holding.currentPrice)}/coin
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ color: getChangeColor(holding.pnl) }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                            {getChangeIcon(holding.pnl)}
                            {formatCurrency(holding.pnl)}
                          </p>
                          <p style={{ fontSize: '0.75rem' }}>
                            {formatPercent(holding.pnlPercent)}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                            {holding.allocation.toFixed(1)}%
                          </p>
                          <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'rgba(71, 85, 105, 0.3)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginTop: '0.25rem',
                            marginLeft: 'auto'
                          }}>
                            <div style={{
                              width: `${holding.allocation}%`,
                              height: '100%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Button
                            onClick={() => navigate('/trading', { state: { asset: { symbol: holding.symbol }, action: 'buy' } })}
                            variant="primary"
                            style={{ 
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            }}
                          >
                            <Plus style={{ width: '0.75rem', height: '0.75rem' }} />
                          </Button>
                          <Button
                            onClick={() => openSellModal(holding)}
                            variant="secondary"
                            style={{ 
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white'
                            }}
                          >
                            <Minus style={{ width: '0.75rem', height: '0.75rem' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <PieChart style={{ 
                width: '4rem', 
                height: '4rem', 
                margin: '0 auto 1rem',
                color: '#475569'
              }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                No holdings found
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {searchTerm || filterBy !== 'all' ? 'Try adjusting your filters' : 'Start trading to build your portfolio!'}
              </p>
              {!searchTerm && filterBy === 'all' && (
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
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sell Modal */}
      {sellModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card variant="glass-dark" style={{ width: '400px', maxWidth: '90vw' }}>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc' }}>
                  Sell {selectedHolding?.symbol}
                </h3>
                <button
                  onClick={() => setSellModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Available: {selectedHolding?.quantity.toFixed(6)} {selectedHolding?.symbol}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Current Price: {formatCurrency(selectedHolding?.currentPrice)}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setSellType('partial')}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      background: sellType === 'partial' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(71, 85, 105, 0.2)',
                      border: sellType === 'partial' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '0.5rem',
                      color: sellType === 'partial' ? '#3b82f6' : '#94a3b8',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => {
                      setSellType('all');
                      setSellAmount(selectedHolding?.quantity.toString() || '');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      background: sellType === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(71, 85, 105, 0.2)',
                      border: sellType === 'all' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '0.5rem',
                      color: sellType === 'all' ? '#3b82f6' : '#94a3b8',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Sell All
                  </button>
                </div>

                <input
                  type="number"
                  placeholder="Amount to sell"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  max={selectedHolding?.quantity}
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

                {sellAmount && (
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#22c55e' }}>
                      Estimated Value: {formatCurrency(parseFloat(sellAmount) * (selectedHolding?.currentPrice || 0))}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  onClick={() => setSellModalOpen(false)}
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSellSubmit}
                  disabled={sellLoading || !sellAmount || parseFloat(sellAmount) <= 0}
                  variant="primary"
                  style={{ 
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  {sellLoading ? (
                    <RefreshCw style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    'Sell'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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

export default Portfolio; 