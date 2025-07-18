import { useState, useEffect } from 'react';
import { achievementAPI } from '../services/api';
import { Trophy, Award, Target, TrendingUp, Calendar, Volume2, Users, Star, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AchievementCard = ({ achievement }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'trading_milestone':
        return <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />;
      case 'profit_achievement':
        return <Trophy style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />;
      case 'diversification':
        return <Target style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />;
      case 'login_streak':
        return <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />;
      case 'volume_reward':
        return <Volume2 style={{ width: '1.5rem', height: '1.5rem', color: '#ef4444' }} />;
      default:
        return <Award style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />;
    }
  };

  return (
    <Card variant="glass-dark" className="glow-effect">
      <div style={{ position: 'relative' }}>
        {achievement.is_completed && (
          <div style={{
            position: 'absolute',
            top: '-0.5rem',
            right: '-0.5rem',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.3)'
          }}>
            ✓ Completed
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{
            padding: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginRight: '1rem'
          }}>
            {getIcon(achievement.type)}
          </div>
          <div>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#f8fafc',
              marginBottom: '0.25rem'
            }}>
              {achievement.icon} {achievement.name}
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#94a3b8'
            }}>
              {achievement.description}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Progress</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
              {achievement.progress_percentage?.toFixed(1) || 0}%
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '0.5rem',
            background: 'rgba(71, 85, 105, 0.3)',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${achievement.progress_percentage || 0}%`,
              height: '100%',
              background: achievement.is_completed 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {achievement.reward_amount && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Reward</span>
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#22c55e'
            }}>
              ${achievement.reward_amount}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [achievementsResponse, statsResponse] = await Promise.all([
        achievementAPI.getUserAchievements(),
        achievementAPI.getAchievementStats()
      ]);

      setAchievements(achievementsResponse.data.achievements || []);
      setStats(statsResponse.data || {});
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: '#ef4444'
      }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      padding: '2rem 1rem',
      maxWidth: '80rem',
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
            Achievements
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Track your trading milestones and earn rewards
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
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Completed</span>
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#f59e0b'
            }}>
              {stats.completed_count || 0}
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
        <Card variant="glass-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0.75rem'
            }}>
              <Trophy style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Achievements</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
                {stats.total_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '0.75rem'
            }}>
              <Star style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Rewards</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                ${stats.total_rewards || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem'
      }}>
        {achievements.map((achievement, index) => (
          <AchievementCard key={index} achievement={achievement} />
        ))}
      </div>

      {achievements.length === 0 && (
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
            No achievements yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Start trading to unlock your first achievement!
          </p>
        </div>
      )}
    </div>
  );
};

export default Achievements; 