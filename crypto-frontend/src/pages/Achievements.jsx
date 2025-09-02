import { useState, useEffect } from 'react';
import { achievementsAPI } from '../services/api';
import { Trophy, Award, Target, TrendingUp, Calendar, Volume2, Users, Star, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AchievementCard = ({ achievement }) => {
  console.log('AchievementCard rendering with data:', achievement);
  
  const getIcon = (type) => {
    switch (type) {
      case 'trading_milestone':
        return <TrendingUp size={20} color="#3b82f6" />;
      case 'profit_achievement':
        return <Trophy size={20} color="#f59e0b" />;
      case 'diversification':
        return <Target size={20} color="#10b981" />;
      case 'login_streak':
        return <Calendar size={20} color="#8b5cf6" />;
      case 'volume_reward':
        return <Volume2 size={20} color="#ef4444" />;
      default:
        return <Award size={20} color="#6b7280" />;
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      border: `2px solid ${achievement.is_completed 
        ? '#22c55e' 
        : '#3b82f6'}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {achievement.is_completed && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '2rem',
          height: '2rem',
          background: '#22c55e',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
        }}>
          ✓
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.75rem',
          background: achievement.is_completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          borderRadius: '0.75rem',
          border: `1px solid ${achievement.is_completed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
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
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#94a3b8' 
          }}>
            Progress
          </span>
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#f8fafc' 
          }}>
            {achievement.progress_percentage || (achievement.is_completed ? 100 : 0)}%
          </span>
        </div>
        
        <div style={{
          marginBottom: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          {achievement.current_progress || 0} / {achievement.requirement_value || 1} {achievement.requirement_type || 'units'}
        </div>
        
        <div style={{
          width: '100%',
          height: '0.5rem',
          background: 'rgba(71, 85, 105, 0.3)',
          borderRadius: '0.25rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${achievement.progress_percentage || (achievement.is_completed ? 100 : 0)}%`,
            height: '100%',
            background: achievement.is_completed 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {achievement.reward_coins && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#94a3b8' 
          }}>
            Reward
          </span>
          <span style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#22c55e'
          }}>
            {achievement.reward_coins} DemoCoins
          </span>
        </div>
      )}
    </div>
  );
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use test token for development
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcl9pZCI6MSwiZXhwIjoxNzM1NzQ0MDAwfQ.test-signature';
      
      // Set the test token in localStorage for API calls
              localStorage.setItem('bitcoinpro_token', testToken);
      
      // Fetch both available achievements and user progress
      const [achievementsResponse, statsResponse, userAchievementsResponse] = await Promise.all([
        achievementsAPI.getAllAchievements(),
        achievementsAPI.getStats(),
        achievementsAPI.getUserAchievements()
      ]);

      if (achievementsResponse.success) {
        const availableAchievements = achievementsResponse.data || [];
        
        // If we have user progress data, merge it with available achievements
        if (userAchievementsResponse.success && userAchievementsResponse.data?.achievements) {
          const userProgress = userAchievementsResponse.data.achievements;
          
          console.log('Available achievements:', availableAchievements);
          console.log('User progress:', userProgress);
          
          // Merge user progress with available achievements
          const achievementsWithProgress = availableAchievements.map(achievement => {
            // Backend returns achievement_id, not id
            const userAchievement = userProgress.find(up => up.achievement_id === achievement.id);
            console.log(`Matching achievement ${achievement.id} with user progress:`, userAchievement);
            
            if (userAchievement) {
              const merged = {
                ...achievement,
                // Map all the fields from user achievement
                is_completed: userAchievement.is_completed || false,
                current_progress: userAchievement.current_progress || 0,
                progress_percentage: userAchievement.progress_percentage || 0,
                completed_at: userAchievement.completed_at,
                // Also map the reward fields that might be in user achievement
                reward_coins: userAchievement.reward_coins || achievement.reward_coins || 0,
                reward_title: userAchievement.reward_title || achievement.reward_title || ''
              };
              console.log(`Merged achievement:`, merged);
              return merged;
            } else {
              return {
                ...achievement,
                is_completed: false,
                current_progress: 0,
                progress_percentage: 0,
                completed_at: null
              };
            }
          });
          
          console.log('Final achievements with progress:', achievementsWithProgress);
          setAchievements(achievementsWithProgress);
        } else {
          console.warn('No user progress data available, showing achievements without progress');
          // Fallback: just show available achievements without progress
          const achievementsWithoutProgress = availableAchievements.map(achievement => ({
            ...achievement,
            is_completed: false,
            current_progress: 0,
            progress_percentage: 0,
            completed_at: null
          }));
          setAchievements(achievementsWithoutProgress);
        }
      } else {
        console.error('Failed to fetch achievements:', achievementsResponse.error);
        setError('Failed to load achievements');
        // Set empty achievements to prevent rendering issues
        setAchievements([]);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || {});
      } else {
        console.error('Failed to fetch stats:', statsResponse.error);
        setStats({});
      }
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

  const checkForNewAchievements = async () => {
    try {
      setRefreshing(true);
      // Use test token for development
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcl9pZCI6MSwiZXhwIjoxNzM1NzQ0MDAwfQ.test-signature';
      
      // Call the check achievements endpoint to see if user has earned new ones
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/achievements/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          // Show notification for new achievements
          result.forEach(achievement => {
            addNotification('success', '🎉 Achievement Unlocked!', `${achievement.name} - ${achievement.description}`);
          });
        } else {
          addNotification('info', '📊 Achievement Check', 'No new achievements unlocked yet. Keep trading!');
        }
        // Refresh data to show any new achievements
        await fetchData();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      addNotification('error', '❌ Error', 'Failed to check for new achievements');
    } finally {
      setRefreshing(false);
    }
  };

  const addNotification = (type, title, message) => {
    const id = Date.now();
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid rgba(51, 65, 85, 0.3)',
            borderTop: '4px solid #14b8a6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            BitcoinPro
          </h1>
          <p style={{ color: '#94a3b8' }}>Loading Achievements...</p>
        </div>
      </div>
    );
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
            Error Loading Achievements
          </h2>
          <p style={{
            color: '#94a3b8',
            marginBottom: '1.5rem'
          }}>
            {error}
          </p>
          <Button 
            variant="primary" 
            onClick={fetchData}
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
            🏆 Achievements
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem'
          }}>
            Track your trading milestones, unlock rewards, and climb the leaderboard
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
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
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
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
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '0.75rem',
                color: '#f59e0b'
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
              Your Completed
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {achievements.filter(a => a.is_completed).length}
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
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
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '0.75rem',
                color: '#22c55e'
              }}>
                <Star size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Total Available
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {achievements.length}
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
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
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
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
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.75rem',
                color: '#3b82f6'
              }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Your Progress
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {achievements.length > 0 ? Math.round((achievements.filter(a => a.is_completed).length / achievements.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Achievements Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#f8fafc',
            margin: 0
          }}>
            Your Achievements
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              onClick={checkForNewAchievements}
              disabled={refreshing}
              variant="primary"
              style={{ 
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              🔍 Check for New
            </Button>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              style={{ 
                padding: '0.75rem',
                background: 'rgba(51, 65, 85, 0.3)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#94a3b8'
              }}
            >
              <RefreshCw style={{ 
                width: '1.25rem', 
                height: '1.25rem',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </Button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem'
        }}>
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <AchievementCard key={index} achievement={achievement} />
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '1rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                🏆
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#f8fafc',
                marginBottom: '0.5rem'
              }}>
                No Achievements Available
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '1.125rem'
              }}>
                {error ? 'Failed to load achievements. Please try refreshing the page.' : 'Start trading to unlock your first achievement!'}
              </p>
              {error && (
                <Button
                  onClick={fetchData}
                  variant="primary"
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  🔄 Try Again
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px'
      }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid',
              borderColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.6)' : 
                         notification.type === 'error' ? 'rgba(239, 68, 68, 0.6)' : 
                         'rgba(59, 130, 246, 0.6)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.2)' :
                             notification.type === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                             'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.4)' :
                               notification.type === 'error' ? 'rgba(239, 68, 68, 0.4)' :
                               'rgba(59, 130, 246, 0.4)'
                }}>
                  {notification.type === 'success' ? '🎉' : 
                   notification.type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#f8fafc',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {notification.title}
                  </h4>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {notification.message}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '0.25rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.5rem',
                  height: '1.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#f8fafc';
                  e.target.style.background = 'rgba(51, 65, 85, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#94a3b8';
                  e.target.style.background = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              marginTop: '1rem',
              textAlign: 'right'
            }}>
              <span style={{
                color: '#64748b',
                fontSize: '0.75rem',
                fontStyle: 'italic'
              }}>
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements; 