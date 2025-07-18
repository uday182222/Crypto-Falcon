import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { Eye, EyeOff, TrendingUp, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      await forgotPassword(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email');
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
              Check Your Email
            </h2>
            
            <p style={{
              color: '#94a3b8',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              If an account with that email exists, we've sent a password reset token to your email address. 
              Please check your inbox and use the token to reset your password.
            </p>
            
            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.75rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}>
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Back to Login
            </Link>
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
            Reset Password
          </h1>
          <p style={{
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Enter your email to receive a reset token
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
                  Password Reset
                </p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  We'll send you a reset token
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
                  Sending Reset Token...
                </>
              ) : (
                'Send Reset Token'
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

export default ForgotPassword; 