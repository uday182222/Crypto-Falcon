import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { Trophy, Medal, Crown, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Leaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [userGlobalRank, setUserGlobalRank] = useState(null);
  const [userWeeklyRank, setUserWeeklyRank] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('global');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [globalResponse, weeklyResponse, userRankResponse, statsResponse] = await Promise.all([
        leaderboardAPI.getGlobalLeaderboard(),
        leaderboardAPI.getWeeklyLeaderboard(),
        leaderboardAPI.getMyRank(),
        leaderboardAPI.getLeaderboardStats()
      ]);

      setGlobalLeaderboard(globalResponse.data?.leaderboard || []);
      setWeeklyLeaderboard(weeklyResponse.data?.leaderboard || []);
      setUserGlobalRank(userRankResponse.data?.global_rank || null);
      setUserWeeklyRank(userRankResponse.data?.weekly_rank || null);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />;
      case 2:
        return <Medal style={{ width: '1.5rem', height: '1.5rem', color: '#9ca3af' }} />;
      case 3:
        return <Medal style={{ width: '1.5rem', height: '1.5rem', color: '#cd7c2f' }} />;
      default:
        return <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#94a3b8' }}>#{rank}</span>;
    }
  };

  const LeaderboardEntry = ({ entry, rank, isUser = false }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      background: isUser ? 'rgba(59, 130, 246, 0.1)' : 'rgba(71, 85, 105, 0.2)',
      borderRadius: '0.75rem',
      border: isUser ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
      marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          padding: '0.5rem',
          background: rank <= 3 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(71, 85, 105, 0.3)',
          borderRadius: '0.5rem',
          border: rank <= 3 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          {getRankIcon(rank)}
        </div>
        <div>
          <p style={{ fontSize: '1rem', fontWeight: '500', color: '#f8fafc' }}>
            {entry.username}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            {entry.total_trades || 0} trades
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#22c55e' }}>
          ${entry.portfolio_value || 0}
        </p>
        <p style={{ 
          fontSize: '0.875rem', 
          color: entry.profit_loss >= 0 ? '#22c55e' : '#ef4444'
        }}>
          {entry.profit_loss >= 0 ? '+' : ''}${entry.profit_loss || 0}
        </p>
      </div>
    </div>
  );

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

  const currentLeaderboard = activeTab === 'global' ? globalLeaderboard : weeklyLeaderboard;
  const currentUserRank = activeTab === 'global' ? userGlobalRank : userWeeklyRank;

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1200px',
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
            Leaderboard
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Compete with other traders and climb the ranks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem 2rem',
            borderRadius: '50px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }} className="glass glow-effect">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Your Rank</span>
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#f59e0b'
            }}>
              #{currentUserRank || 'N/A'}
            </div>
          </div>

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

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem'
      }}>
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '0.75rem'
            }}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Traders</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
                {stats.total_traders || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark" className="glow-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '0.75rem'
            }}>
              <Target style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Average Portfolio</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                ${stats.average_portfolio || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark" className="glow-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0.75rem'
            }}>
              <Trophy style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Top Performer</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
                ${stats.top_portfolio || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '0.25rem',
        background: 'rgba(71, 85, 105, 0.2)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <button
          onClick={() => setActiveTab('global')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            background: activeTab === 'global' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
            color: activeTab === 'global' ? 'white' : '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Global Rankings
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            background: activeTab === 'weekly' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
            color: activeTab === 'weekly' ? 'white' : '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Weekly Rankings
        </button>
      </div>

      {/* Leaderboard */}
      <Card variant="glass-dark" className="glow-effect">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#f8fafc',
            marginBottom: '1.5rem'
          }}>
            {activeTab === 'global' ? 'Global' : 'Weekly'} Leaderboard
          </h2>
          
          {currentLeaderboard.length > 0 ? (
            <div>
              {currentLeaderboard.map((entry, index) => (
                <LeaderboardEntry 
                  key={entry.user_id || index} 
                  entry={entry} 
                  rank={index + 1}
                  isUser={entry.is_current_user}
                />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <Trophy style={{ 
                width: '4rem', 
                height: '4rem', 
                margin: '0 auto 1rem',
                color: '#475569'
              }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                No rankings yet
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                Start trading to appear on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Call to Action */}
      <div style={{ 
        marginTop: '2rem',
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '1rem',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <TrendingUp style={{ 
          width: '3rem', 
          height: '3rem', 
          color: '#3b82f6',
          margin: '0 auto 1rem'
        }} />
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '0.5rem'
        }}>
          Ready to climb the ranks?
        </h3>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          Start trading now and compete with other traders for the top spot
        </p>
        <Button 
          variant="primary"
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '0.75rem 2rem'
          }}
        >
          Start Trading
        </Button>
      </div>
    </div>
  );
};

export default Leaderboard; 