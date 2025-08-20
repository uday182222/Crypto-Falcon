import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, TrendingUp, CheckCircle, Coins, Star, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
      document.head.removeChild(style);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      throw new Error('Please fill in all fields');
    }

    if (formData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!formData.email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (!agreedToTerms) {
      throw new Error('Please agree to the terms and conditions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      validateForm();

      console.log('Submitting registration form...');
      console.log('Form data:', formData);
      
      // Test the API connection first
      try {
        const testResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/health`);
        console.log('Health check response:', testResponse);
        if (testResponse.ok) {
          const healthData = await testResponse.json();
          console.log('Health check data:', healthData);
        }
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        setError('Cannot connect to server. Please check if the backend is running.');
        setLoading(false);
        return;
      }
      
      // Call the actual registration API
      console.log('About to call authAPI.register...');
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      );
      
      console.log('Registration API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      
      if (response.success) {
        console.log('Registration successful, token:', response.data.access_token);
        
        // Store the token and user data
        localStorage.setItem('bitcoinpro_token', response.data.access_token);
        localStorage.setItem('bitcoinpro_user', JSON.stringify(response.data.user));
        
        console.log('Token stored, redirecting to dashboard...');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        console.error('Registration failed:', response.error);
        
        // Show more specific error messages
        let errorMessage = 'Registration failed. Please try again.';
        
        if (response.error) {
          if (response.error.includes('already exists') || response.error.includes('already registered')) {
            errorMessage = 'This email or username is already registered. Please use different credentials.';
          } else if (response.error.includes('validation') || response.error.includes('invalid')) {
            errorMessage = `Validation error: ${response.error}`;
          } else if (response.error.includes('server') || response.error.includes('internal')) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = response.error;
          }
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Risk-free $100,000 demo balance",
    "Real-time market data",
    "Advanced trading tools",
    "Achievement system",
    "Community leaderboards",
    "24/7 platform access"
  ];

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
        {/* Left Side - Benefits */}
        <div style={{ 
          display: 'none', 
          '@media (min-width: 768px)': { display: 'block' } 
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Start Your
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Trading Journey
              </span>
            </h1>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1.125rem',
              lineHeight: '1.6'
            }}>
              Join thousands of traders learning cryptocurrency trading with our risk-free simulation platform.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '2px solid rgba(20, 184, 166, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.15)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderRadius: '50%',
              filter: 'blur(15px)'
            }} />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1.5rem'
            }}>
              What You'll Get:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {benefits.map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                  <span style={{ color: '#e2e8f0' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
            border: '2px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '0.75rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(20, 184, 166, 0.2)'
          }}>
            <p style={{
              color: '#e2e8f0',
              fontSize: '0.875rem',
              margin: 0
            }}>
              <strong>100% Free</strong> - No hidden fees, no credit card required
            </p>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
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
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)',
                  border: '2px solid rgba(20, 184, 166, 0.3)'
                }}>
                  <Coins size={28} style={{ color: 'white' }} />
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
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
              color: '#8b5cf6',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
            }}>
              <Zap size={14} style={{ marginRight: '0.5rem' }} />
              Join the Platform
            </div>
            
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '0.75rem'
            }}>
              Create Account
            </h2>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1.125rem'
            }}>
              Join the ultimate crypto trading simulation platform
            </p>
          </div>

          {/* Registration Form */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '1rem',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            width: '100%',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
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

              {/* Username Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  Username
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#94a3b8'
                  }} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
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
                    color: '#64748b'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14b8a6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                      e.target.style.boxShadow = 'none';
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
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#64748b';
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Confirm Password
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14b8a6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#64748b';
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{
                      marginTop: '0.25rem',
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#14b8a6'
                    }}
                  />
                  <span style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: '#14b8a6', textDecoration: 'none' }}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ color: '#14b8a6', textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                    . I understand this is a demo platform for educational purposes.
                  </span>
                </label>
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
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)';
                }}
              >
                {loading ? 'Creating Account...' : 'Create Free Account'}
              </Button>
            </form>
          </div>

          {/* Sign In Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(8px)',
            width: '100%'
          }}>
            <p style={{
              color: '#94a3b8',
              margin: '0 0 1rem 0'
            }}>
              Already have an account?
            </p>
            <Link to="/login">
              <Button variant="secondary" style={{ 
                width: '100%',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#f8fafc'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(51, 65, 85, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(30, 41, 59, 0.8)';
              }}>
                Sign In
              </Button>
            </Link>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#64748b';
            }}>
              <TrendingUp size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
