import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Globe, Moon, DollarSign, Save, LogOut, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [settings, setSettings] = useState({
    // Profile settings
    username: user?.username || '',
    email: user?.email || '',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    tradingAlerts: true,
    priceAlerts: false,
    
    // Display settings
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    
    // Privacy settings
    profileVisibility: 'public',
    showPortfolio: true,
    showTrades: false,
    twoFactorAuth: false
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToastMessage('Settings saved successfully!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error saving settings. Please try again.');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Globe },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const renderProfileSection = () => (
    <Card variant="glass-dark" className="glow-effect">
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1.5rem'
        }}>
          Profile Information
        </h3>
        {/* Level & XP Bar */}
        {user && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f59e0b' }}>Level {user.level}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>XP</span>
            </div>
            <div style={{ width: '100%', background: '#334155', borderRadius: '0.5rem', height: '0.75rem', marginBottom: '0.25rem', overflow: 'hidden' }}>
              <div style={{
                width: `${(user.xp / (100 + (user.level - 1) * 50)) * 100}%`,
                background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 100%)',
                height: '100%',
                borderRadius: '0.5rem',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ color: '#a3e635', fontSize: '0.9rem' }}>{user.xp} / {100 + (user.level - 1) * 50} XP to next level</span>
          </div>
        )}
        {/* Milestone Badges */}
        {user && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {user.xp_first_gain_awarded && (
              <span style={{ background: '#f59e0b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontWeight: 600 }}>First Gain ��</span>
            )}
            {user.xp_lost_all_awarded && (
              <span style={{ background: '#ef4444', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontWeight: 600 }}>Comeback 💪</span>
            )}
            {user.xp_best_rank !== null && (
              <span style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontWeight: 600 }}>Leaderboard #{user.xp_best_rank + 1}</span>
            )}
          </div>
        )}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({...settings, username: e.target.value})}
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
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
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
        </div>
      </div>
    </Card>
  );

  const renderNotificationsSection = () => (
    <Card variant="glass-dark" className="glow-effect">
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1.5rem'
        }}>
          Notification Preferences
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'tradingAlerts', label: 'Trading Alerts', desc: 'Alerts for trade executions' },
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alerts for price changes' }
          ].map((item) => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(71, 85, 105, 0.2)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {item.desc}
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings[item.key] ? '#3b82f6' : '#475569',
                  borderRadius: '1.5rem',
                  transition: '0.2s',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    height: '1.125rem',
                    width: '1.125rem',
                    left: settings[item.key] ? '1.5rem' : '0.1875rem',
                    bottom: '0.1875rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.2s'
                  }
                }}></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderDisplaySection = () => (
    <Card variant="glass-dark" className="glow-effect">
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1.5rem'
        }}>
          Display Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(71, 85, 105, 0.2)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem'
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
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(71, 85, 105, 0.2)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(71, 85, 105, 0.2)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPrivacySection = () => (
    <Card variant="glass-dark" className="glow-effect">
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1.5rem'
        }}>
          Privacy & Security
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#94a3b8',
              marginBottom: '0.5rem'
            }}>
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(71, 85, 105, 0.2)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          {[
            { key: 'showPortfolio', label: 'Show Portfolio', desc: 'Display portfolio value on profile' },
            { key: 'showTrades', label: 'Show Trades', desc: 'Display trading history on profile' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Enable 2FA for account security' }
          ].map((item) => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(71, 85, 105, 0.2)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f8fafc' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {item.desc}
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings[item.key] ? '#3b82f6' : '#475569',
                  borderRadius: '1.5rem',
                  transition: '0.2s'
                }}></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'display':
        return renderDisplaySection();
      case 'privacy':
        return renderPrivacySection();
      default:
        return renderProfileSection();
    }
  };

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
            Settings
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Customize your trading experience
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <Card variant="glass-dark" className="glow-effect">
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Settings
            </h3>
            
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: activeSection === section.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: activeSection === section.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                      borderRadius: '0.5rem',
                      color: activeSection === section.id ? '#3b82f6' : '#94a3b8',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <Icon style={{ width: '1rem', height: '1rem' }} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {renderSection()}
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                padding: '0.75rem 1.5rem'
              }}
            >
              {saving ? (
                <RefreshCw style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: '1rem', height: '1rem' }} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem'
              }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes('Error') ? 'error' : 'success'}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Settings; 