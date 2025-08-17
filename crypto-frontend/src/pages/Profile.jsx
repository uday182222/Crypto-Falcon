import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Shield, Bell, Palette, Globe, CreditCard, 
  Key, Trash2, Save, Edit3, Camera, Eye, EyeOff, CheckCircle,
  AlertCircle, Coins, Trophy, TrendingUp, Settings, LogOut
} from 'lucide-react';
import Button from '../components/ui/Button';
import { authAPI, userAPI } from '../services/api';

// Add CSS animations
const styles = `
  @keyframes glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Profile Data - Initialize with empty values
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    avatar: null,
    bio: '',
    location: '',
    website: '',
    phone: ''
  });

  // User Stats
  const [userStats, setUserStats] = useState({
    demoBalance: 0,
    level: 1,
    xp: 0,
    totalTrades: 0
  });

  // Calculate XP progress
  const calculateXPProgress = (currentXP, currentLevel) => {
    const xpForCurrentLevel = (currentLevel - 1) * 100; // Assuming 100 XP per level
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = 100;
    const progress = Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);
    const xpToNextLevel = Math.max(0, xpNeededForNextLevel - xpInCurrentLevel);
    
    return {
      progress,
      xpToNextLevel,
      xpInCurrentLevel
    };
  };

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    notifications: {
      priceAlerts: true,
      tradeConfirmations: true,
      newsUpdates: true,
      achievementAlerts: true
    }
  });

  // Trading Settings
  const [tradingSettings, setTradingSettings] = useState({
    defaultAmount: 100,
    riskTolerance: 'medium',
    autoStopLoss: true,
    stopLossPercentage: 5,
    takeProfitPercentage: 10,
    maxDailyTrades: 10
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setInitialLoading(true);
      const response = await userAPI.getProfile();
      
      if (response.success) {
        const user = response.data;
        
        // Extract first and last name from username (fallback)
        const nameParts = user.username.split('_');
        const firstName = nameParts[0] || user.username;
        const lastName = nameParts[1] || '';
        
        setProfileData(prev => ({
          ...prev,
          username: user.username || '',
          email: user.email || '',
          firstName: firstName,
          lastName: lastName,
          bio: user.bio || 'Passionate crypto trader and blockchain enthusiast',
          location: user.location || 'New York, USA',
          website: user.website || 'https://example.com',
          phone: user.phone || '+1 (555) 123-4567'
        }));

        // Set user stats
        setUserStats({
          demoBalance: user.demo_balance || 0,
          level: user.level || 1,
          xp: user.xp || 0,
          totalTrades: 0 // This would come from a separate API call
        });

        // Set preferences based on user data
        setPreferences(prev => ({
          ...prev,
          currency: user.preferred_currency || 'USD'
        }));

        // Set trading settings based on user data
        setTradingSettings(prev => ({
          ...prev,
          defaultAmount: Math.round(user.demo_balance * 0.01) || 100 // 1% of balance as default
        }));
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load profile data. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load profile data. Please try again.' 
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      
      switch (section) {
        case 'profile':
          // Extract first and last name from the form
          const { firstName, lastName, ...otherProfileData } = profileData;
          const username = `${firstName}_${lastName}`.toLowerCase().replace(/\s+/g, '_');
          
          response = await userAPI.updateProfile({
            username,
            bio: profileData.bio,
            location: profileData.location,
            website: profileData.website,
            phone: profileData.phone
          });
          break;
          
        case 'security':
          if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
            throw new Error('New passwords do not match');
          }
          
          if (securityData.newPassword && !securityData.currentPassword) {
            throw new Error('Current password is required');
          }
          
          response = await userAPI.changePassword({
            current_password: securityData.currentPassword,
            new_password: securityData.newPassword
          });
          break;
          
        case 'preferences':
          response = await userAPI.updatePreferences(preferences);
          break;
          
        case 'trading':
          response = await userAPI.updateTradingSettings(tradingSettings);
          break;
          
        case 'notifications':
          response = await userAPI.updatePreferences({
            ...preferences,
            notifications: preferences.notifications
          });
          break;
          
        default:
          throw new Error('Unknown section');
      }
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `${section} settings saved successfully!` 
        });
        
        if (section === 'profile') {
          setIsEditing(false);
          // Reload profile data to get updated information
          await loadUserProfile();
        }
        
        // Clear sensitive fields
        if (section === 'security') {
          setSecurityData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        }
      } else {
        throw new Error(response.error || `Failed to save ${section} settings`);
      }
    } catch (error) {
      console.error(`Error saving ${section}:`, error);
      setMessage({ 
        type: 'error', 
        text: error.message || `Failed to save ${section} settings. Please try again.` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
  };

  // Show loading state while initially loading
  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#f8fafc'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(20, 184, 166, 0.3)',
            borderTop: '4px solid #14b8a6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, status: 'active' },
    { id: 'security', label: 'Security', icon: Shield, status: 'coming-soon' },
    { id: 'preferences', label: 'Preferences', icon: Settings, status: 'coming-soon' },
    { id: 'trading', label: 'Trading', icon: TrendingUp, status: 'coming-soon' },
    { id: 'notifications', label: 'Notifications', icon: Bell, status: 'coming-soon' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      padding: '2rem'
    }}>
      {/* Inject CSS animations */}
      <style>{styles}</style>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
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
                  Profile Settings
                </h1>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '1.125rem',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  marginBottom: '1.5rem'
                }}>
                  Manage your account settings and preferences
                </p>
              </div>
              
              {/* User Stats */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                marginBottom: '1rem',
                gap: '1rem'
              }}>
                {/* Top Row - 3 Cards */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  {/* Balance Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                    border: '2px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(20, 184, 166, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 40px rgba(20, 184, 166, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(20, 184, 166, 0.1)';
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Coins size={20} color="#14b8a6" />
                      <span style={{ color: '#14b8a6', fontWeight: '600', fontSize: '0.75rem' }}>Balance</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
                      ${userStats.demoBalance.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Level Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.1)';
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Trophy size={20} color="#8b5cf6" />
                      <span style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '0.75rem' }}>Level</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
                      {userStats.level}
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.25rem',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.2)';
                  }}>
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>

                {/* Full Width XP Progress Bar */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                }}>
                  {/* XP Info Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <TrendingUp size={24} color="#14b8a6" />
                      <span style={{ color: '#14b8a6', fontWeight: '600', fontSize: '1rem' }}>XP Progress</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2rem'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current XP</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
                          {userStats.xp.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>To Next Level</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
                          {calculateXPProgress(userStats.xp, userStats.level).xpToNextLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '0.75rem',
                    height: '1rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div style={{
                      width: `${calculateXPProgress(userStats.xp, userStats.level).progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #14b8a6 0%, #8b5cf6 100%)',
                      borderRadius: '0.75rem',
                      transition: 'width 0.8s ease',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '32px',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%)',
                        borderRadius: '0 0.75rem 0.75rem 0',
                        animation: 'glow 2s ease-in-out infinite'
                      }} />
                    </div>
                  </div>
                  
                  {/* Level Progress Text */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>
                    Level {userStats.level} • {calculateXPProgress(userStats.xp, userStats.level).xpInCurrentLevel} / 100 XP • {calculateXPProgress(userStats.xp, userStats.level).xpToNextLevel} XP to Level {userStats.level + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Sidebar Navigation */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '2px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <nav>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <div key={tab.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        background: activeTab === tab.id 
                          ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
                          : 'transparent',
                        border: activeTab === tab.id 
                          ? '2px solid rgba(20, 184, 166, 0.4)'
                          : '2px solid transparent',
                        borderRadius: '0.75rem',
                        color: activeTab === tab.id ? '#14b8a6' : '#94a3b8',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: tab.status === 'coming-soon' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backdropFilter: activeTab === tab.id ? 'blur(16px)' : 'none',
                        opacity: tab.status === 'coming-soon' ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id && tab.status !== 'coming-soon') {
                          e.target.style.background = 'rgba(20, 184, 166, 0.1)';
                          e.target.style.borderColor = 'rgba(20, 184, 166, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id && tab.status !== 'coming-soon') {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      <Icon size={20} />
                      {tab.label}
                      {tab.status === 'coming-soon' && (
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '0.75rem',
                          color: '#14b8a6',
                          fontWeight: '500',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(20, 184, 166, 0.1)',
                          borderRadius: '0.375rem',
                          border: '1px solid rgba(20, 184, 166, 0.3)'
                        }}>
                          Soon
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '2px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '1.5rem',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '600px'
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

            {/* Message Display */}
            {message.text && (
              <div style={{
                padding: '1rem 1.5rem',
                background: message.type === 'success' 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                border: `2px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '0.75rem',
                color: message.type === 'success' ? '#22c55e' : '#ef4444',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 20px ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            {/* Tab Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {activeTab === 'profile' && (
                <ProfileTab 
                  profileData={profileData}
                  setProfileData={setProfileData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onSave={() => handleSave('profile')}
                  loading={loading}
                />
              )}
              
              {activeTab === 'security' && (
                <div style={{ position: 'relative' }}>
                  <SecurityTab 
                    securityData={securityData}
                    setSecurityData={setSecurityData}
                    onSave={() => handleSave('security')}
                    loading={loading}
                  />
                  {/* Coming Soon Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '1rem',
                    zIndex: 10
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#f8fafc'
                    }}>
                      <Shield size={48} color="#14b8a6" style={{ marginBottom: '1rem' }} />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        Coming Soon
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#94a3b8',
                        margin: 0
                      }}>
                        Advanced security features are under development
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <div style={{ position: 'relative' }}>
                  <PreferencesTab 
                    preferences={preferences}
                    setPreferences={setPreferences}
                    onSave={() => handleSave('preferences')}
                    loading={loading}
                  />
                  {/* Coming Soon Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '1rem',
                    zIndex: 10
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#f8fafc'
                    }}>
                      <Settings size={48} color="#14b8a6" style={{ marginBottom: '1rem' }} />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        Coming Soon
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#94a3b8',
                        margin: 0
                      }}>
                        Advanced preferences and customization options
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'trading' && (
                <div style={{ position: 'relative' }}>
                  <TradingTab 
                    tradingSettings={tradingSettings}
                    setTradingSettings={setTradingSettings}
                    onSave={() => handleSave('trading')}
                    loading={loading}
                  />
                  {/* Coming Soon Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '1rem',
                    zIndex: 10
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#f8fafc'
                    }}>
                      <TrendingUp size={48} color="#14b8a6" style={{ marginBottom: '1rem' }} />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        Coming Soon
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#94a3b8',
                        margin: 0
                      }}>
                        Advanced trading settings and risk management
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div style={{ position: 'relative' }}>
                  <NotificationsTab 
                    preferences={preferences}
                    setPreferences={setPreferences}
                    onSave={() => handleSave('notifications')}
                    loading={loading}
                  />
                  {/* Coming Soon Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '1rem',
                    zIndex: 10
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#f8fafc'
                    }}>
                      <Bell size={48} color="#14b8a6" style={{ marginBottom: '1rem' }} />
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        Coming Soon
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#94a3b8',
                        margin: 0
                      }}>
                        Advanced notification system and preferences
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ profileData, setProfileData, isEditing, setIsEditing, onSave, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (profileData.website && !/^https?:\/\/.+/.test(profileData.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://';
    }
    
    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Personal Information
        </h2>
        <Button
          variant={isEditing ? 'primary' : 'ghost'}
          onClick={() => isEditing ? handleSaveClick() : setIsEditing(true)}
          disabled={loading}
          style={{
            background: isEditing 
              ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)'
              : 'rgba(20, 184, 166, 0.15)',
            color: isEditing ? 'white' : '#14b8a6',
            border: isEditing ? 'none' : '2px solid rgba(20, 184, 166, 0.4)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease'
          }}
        >
          {isEditing ? (
            <>
              <Save size={18} style={{ marginRight: '0.5rem' }} />
              {loading ? 'Saving...' : 'Save Changes'}
            </>
          ) : (
            <>
              <Edit3 size={18} style={{ marginRight: '0.5rem' }} />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Avatar Section */}
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: 'white',
              fontWeight: 'bold',
              margin: '0 auto',
              border: '4px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)'
            }}>
              {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
            </div>
            {isEditing && (
              <button style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                border: '3px solid rgba(15, 23, 42, 0.8)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(20, 184, 166, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}>
                <Camera size={20} />
              </button>
            )}
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Click to change avatar
          </p>
        </div>

        {/* Profile Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.firstName ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.firstName && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.lastName ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.lastName && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.lastName}
              </p>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.username ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.username && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.username}
              </p>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.email ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.email && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              disabled={!isEditing}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: '2px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: '2px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Phone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.phone ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.phone && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.phone}
              </p>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Website
            </label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isEditing ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)',
                border: `2px solid ${errors.website ? 'rgba(239, 68, 68, 0.6)' : 'rgba(51, 65, 85, 0.4)'}`,
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
            {errors.website && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                {errors.website}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Tab Component
const SecurityTab = ({ securityData, setSecurityData, onSave, loading }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setSecurityData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Security Settings
        </h2>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Save size={18} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Password Change Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Lock size={20} color="#14b8a6" />
            Change Password
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={securityData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid rgba(51, 65, 85, 0.4)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(12px)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={securityData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid rgba(51, 65, 85, 0.4)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(12px)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={securityData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid rgba(51, 65, 85, 0.4)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(12px)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Shield size={20} color="#14b8a6" />
            Security Features
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  Two-Factor Authentication
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Add an extra layer of security to your account
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={securityData.twoFactorEnabled}
                  onChange={() => handleToggle('twoFactorEnabled')}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: securityData.twoFactorEnabled ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: securityData.twoFactorEnabled ? '26px' : '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  Email Notifications
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Receive security alerts via email
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={securityData.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: securityData.emailNotifications ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: securityData.emailNotifications ? '26px' : '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  Login Alerts
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Get notified of new login attempts
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={securityData.loginAlerts}
                  onChange={() => handleToggle('loginAlerts')}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: securityData.loginAlerts ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: securityData.loginAlerts ? '26px' : '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preferences Tab Component
const PreferencesTab = ({ preferences, setPreferences, onSave, loading }) => {
  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Preferences
        </h2>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Save size={18} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Appearance Settings */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Palette size={20} color="#14b8a6" />
            Appearance
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer'
                }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handleChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer'
                }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer'
                }}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Bell size={20} color="#14b8a6" />
            Notification Preferences
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(51, 65, 85, 0.3)'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    marginBottom: '0.25rem',
                    textTransform: 'capitalize'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    margin: 0
                  }}>
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: value ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                    borderRadius: '24px',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(51, 65, 85, 0.4)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '16px',
                      width: '16px',
                      left: value ? '26px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Trading Tab Component
const TradingTab = ({ tradingSettings, setTradingSettings, onSave, loading }) => {
  const handleChange = (field, value) => {
    setTradingSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setTradingSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Trading Settings
        </h2>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Save size={18} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Basic Trading Settings */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <TrendingUp size={20} color="#14b8a6" />
            Basic Trading Settings
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Default Trade Amount
              </label>
              <input
                type="number"
                value={tradingSettings.defaultAmount}
                onChange={(e) => handleChange('defaultAmount', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Risk Tolerance
              </label>
              <select
                value={tradingSettings.riskTolerance}
                onChange={(e) => handleChange('riskTolerance', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Max Daily Trades
              </label>
              <input
                type="number"
                value={tradingSettings.maxDailyTrades}
                onChange={(e) => handleChange('maxDailyTrades', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(12px)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Shield size={20} color="#14b8a6" />
            Risk Management
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  Auto Stop Loss
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Automatically set stop loss orders
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={tradingSettings.autoStopLoss}
                  onChange={() => handleToggle('autoStopLoss')}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: tradingSettings.autoStopLoss ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: tradingSettings.autoStopLoss ? '26px' : '2px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>

            {tradingSettings.autoStopLoss && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Stop Loss Percentage
                  </label>
                  <input
                    type="number"
                    value={tradingSettings.stopLossPercentage}
                    onChange={(e) => handleChange('stopLossPercentage', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid rgba(51, 65, 85, 0.4)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(12px)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Take Profit Percentage
                  </label>
                  <input
                    type="number"
                    value={tradingSettings.takeProfitPercentage}
                    onChange={(e) => handleChange('takeProfitPercentage', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '2px solid rgba(51, 65, 85, 0.4)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(12px)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = ({ preferences, setPreferences, onSave, loading }) => {
  const handleNotificationChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #f8fafc 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Notification Settings
        </h2>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Save size={18} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Trading Notifications */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <TrendingUp size={20} color="#14b8a6" />
            Trading Notifications
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(51, 65, 85, 0.3)'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    marginBottom: '0.25rem',
                    textTransform: 'capitalize'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    margin: 0
                  }}>
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: value ? '#14b8a6' : 'rgba(51, 65, 85, 0.6)',
                    borderRadius: '24px',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(51, 65, 85, 0.4)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '16px',
                      width: '16px',
                      left: value ? '26px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Channels */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%)',
          border: '2px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Bell size={20} color="#14b8a6" />
            Notification Channels
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  In-App Notifications
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Show notifications within the app
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: '#14b8a6',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: '26px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(51, 65, 85, 0.3)'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '0.25rem'
                }}>
                  Email Notifications
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Send notifications via email
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: '#14b8a6',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(51, 65, 85, 0.4)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: '26px',
                    bottom: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
