import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, TrendingUp, User, BarChart3, Wallet, Settings, Zap, Star, Trophy, DollarSign } from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div style={{ minHeight: '100vh' }} className="text-white">
      {/* Professional Header */}
      <header style={{ 
        position: 'relative', 
        zIndex: 10,
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} className="glass-dark">
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          padding: '0 1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '4rem'
          }}>
            {/* Logo */}
            <Link to="/dashboard" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}>
              <div style={{
                padding: '0.5rem',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #64748b 100%)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700'
              }} className="text-gradient">
                CryptoFalcon
              </span>
            </Link>

            {/* Navigation */}
            <nav style={{ 
              display: 'none', 
              gap: '1rem'
            }} className="md:flex">
              <Link to="/dashboard" className="nav-link">
                <BarChart3 style={{ width: '1rem', height: '1rem', color: '#38bdf8' }} />
                <span>Dashboard</span>
              </Link>
              <Link to="/portfolio" className="nav-link">
                <Wallet style={{ width: '1rem', height: '1rem', color: '#94a3b8' }} />
                <span>Portfolio</span>
              </Link>
              <Link to="/trading" className="nav-link">
                <TrendingUp style={{ width: '1rem', height: '1rem', color: '#22c55e' }} />
                <span>Trading</span>
              </Link>
              <Link to="/achievements" className="nav-link">
                <Star style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
                <span>Achievements</span>
              </Link>
              <Link to="/leaderboard" className="nav-link">
                <Trophy style={{ width: '1rem', height: '1rem', color: '#8b5cf6' }} />
                <span>Leaderboard</span>
              </Link>
              <Link to="/buy-coins" className="nav-link">
                <DollarSign style={{ width: '1rem', height: '1rem', color: '#06b6d4' }} />
                <span>Buy Coins</span>
              </Link>
            </nav>

            {/* User Menu */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <User style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#cbd5e1'
                }}>
                  {user?.username || 'demo'}
                </span>
              </div>
              
              <Link to="/settings" className="nav-link" style={{ padding: '0.5rem' }}>
                <Settings style={{ width: '1rem', height: '1rem' }} />
              </Link>
              
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                <LogOut style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        position: 'relative', 
        zIndex: 1,
        minHeight: 'calc(100vh - 4rem)'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 