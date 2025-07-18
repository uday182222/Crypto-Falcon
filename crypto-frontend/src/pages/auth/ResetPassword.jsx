import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { Eye, EyeOff, TrendingUp, Lock, ArrowLeft, CheckCircle, Key } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    reset_token: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        reset_token: formData.reset_token,
        new_password: formData.new_password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>

        {/* Success Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%'
          }} className="glow-effect">
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '50%'
              }}>
                <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
              </div>
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Password Reset Successful!
            </h2>
            
            <p style={{
              color: '#94a3b8',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Go to Login
            </button>
          </div>
        </div>
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
            Set New Password
          </h1>
          <p style={{
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Enter your reset token and new password
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

      {/* Main Form */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem', 
        marginBottom: '2rem'
      }}>
        {/* Form Card */}
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
                <Lock style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f8fafc' }}>
                  Reset Password
                </p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Enter your reset token and new password
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

            {/* Reset Token Field */}
            <div>
              <label htmlFor="reset_token" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Reset Token
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="reset_token"
                  name="reset_token"
                  value={formData.reset_token}
                  onChange={handleChange}
                  required
                  placeholder="Enter the reset token from your email"
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
                <Key style={{
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

            {/* New Password Field */}
            <div>
              <label htmlFor="new_password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your new password"
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
                  {showPassword ? (
                    <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} />
                  ) : (
                    <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm_password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your new password"
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
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} />
                  ) : (
                    <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? 'rgba(71, 85, 105, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.4)';
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
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to Login */}
            <div style={{
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              <Link to="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}>
                <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 