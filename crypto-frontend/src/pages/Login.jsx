import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, TrendingUp, Coins, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Add CSS animations for the 3D rotating logo
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(-50%) translateZ(0px); }
        50% { transform: translateY(-50%) translateZ(20px); }
      }
      
      @keyframes float3d {
        0%, 100% { transform: translateY(-50%) translateY(0px) translateZ(0px); }
        25% { transform: translateY(-50%) translateY(-10px) translateZ(15px); }
        50% { transform: translateY(-50%) translateY(0px) translateZ(25px); }
        75% { transform: translateY(-50%) translateY(10px) translateZ(15px); }
      }
      
      @keyframes rotate3d {
        0% { transform: translateY(-50%) rotateY(0deg) rotateX(0deg); }
        100% { transform: translateY(-50%) rotateY(360deg) rotateX(360deg); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes spin3d {
        0% { transform: rotateX(60deg) rotateY(0deg) translateZ(20px); }
        100% { transform: rotateX(60deg) rotateY(360deg) translateZ(20px); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      
      @keyframes pulse3d {
        0%, 100% { transform: translateZ(80px) rotateX(15deg) scale(1); opacity: 1; }
        50% { transform: translateZ(80px) rotateX(15deg) scale(1.05); opacity: 0.9; }
      }
      
      @keyframes particle1 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(10px, -10px) scale(1.2); opacity: 1; }
      }
      
      @keyframes particle2 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(-15px, 15px) scale(1.3); opacity: 1; }
      }
      
      @keyframes particle3 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        50% { transform: translate(8px, 8px) scale(1.1); opacity: 1; }
      }
      
      @keyframes particle4 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
        50% { transform: translate(-5px, -5px) scale(1.2); opacity: 0.8; }
      }
      
      @keyframes particle5 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
        50% { transform: translate(3px, -3px) scale(1.3); opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Call the actual login API
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.success) {
        // Store the token and user data
        localStorage.setItem('bitcoinpro_token', response.data.access_token);
        localStorage.setItem('bitcoinpro_user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem'
          }}>
            BitcoinPro
          </h1>
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Left Side - Login Form */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {/* 3D Rotating Logo Animation - Same as Register Page */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Background Glow Effect */}
                  <div style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
                    borderRadius: '50%',
                    filter: 'blur(8px)',
                    animation: 'pulse 4s ease-in-out infinite',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-32px',
                    marginTop: '-32px'
                  }} />
                  
                  {/* Outer Ring */}
                  <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    border: '2px solid transparent',
                    borderTop: '2px solid rgba(20, 184, 166, 0.8)',
                    borderRight: '2px solid rgba(139, 92, 246, 0.8)',
                    borderRadius: '50%',
                    animation: 'spin 4s linear infinite',
                    boxShadow: '0 0 15px rgba(20, 184, 166, 0.3), inset 0 0 15px rgba(20, 184, 166, 0.1)',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-25px',
                    marginTop: '-25px'
                  }} />
                  
                  {/* Middle Ring */}
                  <div style={{
                    position: 'absolute',
                    width: '39px',
                    height: '39px',
                    border: '1.5px solid transparent',
                    borderTop: '1.5px solid rgba(139, 92, 246, 0.7)',
                    borderLeft: '1.5px solid rgba(20, 184, 166, 0.7)',
                    borderRadius: '50%',
                    animation: 'spin 3s linear infinite reverse',
                    boxShadow: '0 0 12px rgba(139, 92, 246, 0.3), inset 0 0 12px rgba(139, 92, 246, 0.1)',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-19.5px',
                    marginTop: '-19.5px'
                  }} />
                  
                  {/* Inner Ring */}
                  <div style={{
                    position: 'absolute',
                    width: '28px',
                    height: '28px',
                    border: '1.5px solid transparent',
                    borderBottom: '1.5px solid rgba(20, 184, 166, 0.6)',
                    borderRight: '1.5px solid rgba(139, 92, 246, 0.6)',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite',
                    boxShadow: '0 0 10px rgba(20, 184, 166, 0.3), inset 0 0 10px rgba(20, 184, 166, 0.1)',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-14px',
                    marginTop: '-14px'
                  }} />
                  
                  {/* Central Logo Container */}
                  <div style={{
                    width: '17px',
                    height: '17px',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(20, 184, 166, 0.4), 0 0 30px rgba(20, 184, 166, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    animation: 'pulse 2s ease-in-out infinite',
                    overflow: 'hidden',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-8.5px',
                    marginTop: '-8.5px'
                  }}>
                    {/* Inner Glow Effect */}
                    <div style={{
                      position: 'absolute',
                      inset: '0',
                      background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                      borderRadius: '0.5rem'
                    }} />
                    
                    {/* Logo Image */}
                    <img 
                      src="/yqRCvprlca2HEIUhFc404ozGNPI.avif"
                      alt="BitcoinPro Logo"
                      style={{
                        width: '12px',
                        height: '12px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                        zIndex: 2,
                        position: 'relative'
                      }}
                    />
                  </div>
                  
                  {/* Floating Particles - Scaled down for navbar size */}
                  <div style={{
                    position: 'absolute',
                    width: '2px',
                    height: '2px',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 1) 0%, rgba(20, 184, 166, 0.3) 70%, transparent 100%)',
                    borderRadius: '50%',
                    top: '6px',
                    left: '6px',
                    animation: 'particle1 3s ease-in-out infinite',
                    boxShadow: '0 0 4px rgba(20, 184, 166, 0.6)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '1.5px',
                    height: '1.5px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)',
                    borderRadius: '50%',
                    top: '45px',
                    right: '6px',
                    animation: 'particle2 4s ease-in-out infinite',
                    boxShadow: '0 0 3px rgba(139, 92, 246, 0.6)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.2) 70%, transparent 100%)',
                    borderRadius: '50%',
                    bottom: '12px',
                    left: '22px',
                    animation: 'particle3 5s ease-in-out infinite',
                    boxShadow: '0 0 2px rgba(20, 184, 166, 0.5)'
                  }} />
                  
                  {/* Additional Ambient Particles */}
                  <div style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    background: 'rgba(139, 92, 246, 0.4)',
                    borderRadius: '50%',
                    top: '20px',
                    right: '12px',
                    animation: 'particle4 6s ease-in-out infinite',
                    boxShadow: '0 0 2px rgba(139, 92, 246, 0.4)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '0.5px',
                    height: '0.5px',
                    background: 'rgba(20, 184, 166, 0.3)',
                    borderRadius: '50%',
                    top: '32px',
                    left: '10px',
                    animation: 'particle5 7s ease-in-out infinite',
                    boxShadow: '0 0 1px rgba(20, 184, 166, 0.3)'
                  }} />
                </div>
                
                <span style={{
                  fontSize: '2.25rem',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  BitcoinPro
                </span>
              </div>
            </Link>
            
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              color: '#14b8a6',
              border: '2px solid rgba(20, 184, 166, 0.4)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(20, 184, 166, 0.2)'
            }}>
              <Star size={14} style={{ marginRight: '0.5rem' }} />
              Welcome Back
            </div>
            
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '0.75rem'
            }}>
              Sign In
            </h1>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1.125rem'
            }}>
              Access your trading dashboard
            </p>
          </div>

          {/* Login Form */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '2px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '1rem',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.15)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
              {error && (
                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '0.75rem',
                  color: '#ef4444',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                }}>
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  Email Address
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#94a3b8'
                  }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                      border: '2px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14b8a6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.2)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  Password
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#94a3b8'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                      border: '2px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14b8a6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.2)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#14b8a6';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#94a3b8';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.3)';
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
            borderRadius: '1rem',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
              borderRadius: '50%',
              filter: 'blur(15px)'
            }} />
            <p style={{
              color: '#e2e8f0',
              margin: '0 0 1rem 0',
              fontSize: '1rem'
            }}>
              Don't have an account?
            </p>
            <Link to="/register">
              <Button variant="secondary" style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                color: '#f8fafc',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.95) 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#14b8a6';
              e.target.style.background = 'rgba(20, 184, 166, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}>
              <TrendingUp size={16} />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Right Side - Large 3D Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* 3D Rotating Logo Animation - Fixed Right Positioning */}
          <div style={{
            position: 'fixed',
            right: '180px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '350px',
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'float3d 6s ease-in-out infinite',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {/* Background Glow Effect */}
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: 'pulse 4s ease-in-out infinite',
              left: '50%',
              top: '50%',
              marginLeft: '-200px',
              marginTop: '-200px'
            }} />
            
            {/* Outer Ring */}
            <div style={{
              position: 'absolute',
              width: '315px',
              height: '315px',
              border: '4px solid transparent',
              borderTop: '4px solid rgba(20, 184, 166, 0.8)',
              borderRight: '4px solid rgba(139, 92, 246, 0.8)',
              borderRadius: '50%',
              animation: 'spin 4s linear infinite',
              boxShadow: '0 0 30px rgba(20, 184, 166, 0.3), inset 0 0 30px rgba(20, 184, 166, 0.1)',
              left: '50%',
              top: '50%',
              marginLeft: '-157.5px',
              marginTop: '-157.5px'
            }} />
            
            {/* Middle Ring */}
            <div style={{
              position: 'absolute',
              width: '245px',
              height: '245px',
              border: '3px solid transparent',
              borderTop: '3px solid rgba(139, 92, 246, 0.7)',
              borderLeft: '3px solid rgba(20, 184, 166, 0.7)',
              borderRadius: '50%',
              animation: 'spin 3s linear infinite reverse',
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.3), inset 0 0 25px rgba(139, 92, 246, 0.1)',
              left: '50%',
              top: '50%',
              marginLeft: '-122.5px',
              marginTop: '-122.5px'
            }} />
            
            {/* Inner Ring */}
            <div style={{
              position: 'absolute',
              width: '175px',
              height: '175px',
              border: '3px solid transparent',
              borderBottom: '3px solid rgba(20, 184, 166, 0.6)',
              borderRight: '3px solid rgba(139, 92, 246, 0.6)',
              borderRadius: '50%',
              animation: 'spin 2s linear infinite',
              boxShadow: '0 0 20px rgba(20, 184, 166, 0.3), inset 0 0 20px rgba(20, 184, 166, 0.1)',
              left: '50%',
              top: '50%',
              marginLeft: '-87.5px',
              marginTop: '-87.5px'
            }} />
            
            {/* Central Logo Container */}
            <div style={{
              width: '105px',
              height: '105px',
              borderRadius: '1.5rem',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 40px rgba(20, 184, 166, 0.4), 0 0 60px rgba(20, 184, 166, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              animation: 'pulse 2s ease-in-out infinite',
              overflow: 'hidden',
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-52.5px',
              marginTop: '-52.5px'
            }}>
              {/* Inner Glow Effect */}
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '1.5rem'
              }} />
              
              {/* Logo Image */}
                                <img 
                    src="/yqRCvprlca2HEIUhFc404ozGNPI.avif"
                    alt="BitcoinPro Logo"
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                      zIndex: 2,
                      position: 'relative'
                    }}
                  />
            </div>
            
            {/* Floating Particles - Simplified */}
            <div style={{
              position: 'absolute',
              width: '7px',
              height: '7px',
              background: 'radial-gradient(circle, rgba(20, 184, 166, 1) 0%, rgba(20, 184, 166, 0.3) 70%, transparent 100%)',
              borderRadius: '50%',
              top: '35px',
              left: '35px',
              animation: 'particle1 3s ease-in-out infinite',
              boxShadow: '0 0 15px rgba(20, 184, 166, 0.6)'
            }} />
            <div style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)',
              borderRadius: '50%',
              top: '280px',
              right: '35px',
              animation: 'particle2 4s ease-in-out infinite',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)'
            }} />
            <div style={{
              position: 'absolute',
              width: '5px',
              height: '5px',
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.2) 70%, transparent 100%)',
              borderRadius: '50%',
              bottom: '70px',
              left: '140px',
              animation: 'particle3 5s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(20, 184, 166, 0.5)'
            }} />
            
            {/* Additional Ambient Particles */}
            <div style={{
              position: 'absolute',
              width: '3px',
              height: '3px',
              background: 'rgba(139, 92, 246, 0.4)',
              borderRadius: '50%',
              top: '120px',
              right: '80px',
              animation: 'particle4 6s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)'
            }} />
            <div style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'rgba(20, 184, 166, 0.3)',
              borderRadius: '50%',
              top: '200px',
              left: '60px',
              animation: 'particle5 7s ease-in-out infinite',
              boxShadow: '0 0 6px rgba(20, 184, 166, 0.3)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
