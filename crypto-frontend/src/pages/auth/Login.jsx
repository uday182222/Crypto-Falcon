import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, TrendingUp, Mail, Lock, LogIn, Shield } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
            Welcome Back
          </h1>
          <p style={{
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Sign in to your trading account
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(71, 85, 105, 0.2)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
          <span style={{ color: '#f8fafc', fontWeight: '500' }}>MotionFalcon</span>
        </div>
      </div>

      {/* Main Login Form */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem', 
        marginBottom: '2rem'
      }}>
        {/* Login Form Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} className="glow-effect">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '0.75rem'
              }}>
                <LogIn style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f8fafc' }}>
                  Account Login
                </p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Access your trading dashboard
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {error && (
              <div style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                color: '#fca5a5',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    background: 'rgba(71, 85, 105, 0.2)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Mail style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: '#94a3b8'
                }} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 3rem',
                    background: 'rgba(71, 85, 105, 0.2)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Lock style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: '#94a3b8'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: loading ? 'rgba(71, 85, 105, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Create one here
            </Link>
          </div>

          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Security Features Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} className="glow-effect">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '0.75rem'
              }}>
                <Shield style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f8fafc' }}>
                  Secure Access
                </p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Your account is protected
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                icon: '🔐',
                title: 'Multi-Factor Authentication',
                description: 'Advanced security layers protect your account'
              },
              {
                icon: '🛡️',
                title: 'Encrypted Data',
                description: 'All data transmitted with military-grade encryption'
              },
              {
                icon: '🔍',
                title: 'Activity Monitoring',
                description: 'Real-time monitoring of all account activities'
              },
              {
                icon: '⚡',
                title: 'Instant Alerts',
                description: 'Get notified of any suspicious activities immediately'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#f8fafc', marginBottom: '0.25rem' }}>
                    {feature.title}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(71, 85, 105, 0.2)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Platform Statistics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                  1,250+
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Active Traders
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                  $2.5M+
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Total Volume
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                  99.9%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-effect {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
        }
        
        .glow-effect:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Login; 