import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Trophy, Zap, Users, BarChart3, Coins, Star, ArrowRight, Play } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Inject CSS animations for the 3D logo
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      @keyframes particle1 {
        0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-8px) scale(1.2); opacity: 0.7; }
      }
      
      @keyframes particle2 {
        0%, 100% { transform: translateX(0) scale(1); opacity: 1; }
        50% { transform: translateX(8px) scale(1.1); opacity: 0.6; }
      }
      
      @keyframes particle3 {
        0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(6px) scale(0.9); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description: "Experience live market simulation with real crypto prices and advanced charting tools",
    },
    {
      icon: Shield,
      title: "Risk-Free Learning",
      description: "Practice trading strategies without risking real money in our safe simulation environment",
    },
    {
      icon: Trophy,
      title: "Competitive Leaderboards",
      description: "Compete with traders worldwide and climb the rankings to prove your skills",
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Lightning-fast order execution with real-time portfolio updates and notifications",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a community of traders, share strategies, and learn from the best",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed performance analytics and insights to improve your trading strategy",
    },
  ];

  const stats = [
    { label: "Active Traders", value: "50K+", icon: Users },
    { label: "Daily Trades", value: "1M+", icon: TrendingUp },
    { label: "Success Rate", value: "94%", icon: Trophy },
    { label: "Uptime", value: "99.9%", icon: Shield },
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
          <p style={{ color: '#94a3b8' }}>Trading Platform Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
    }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '2px solid rgba(51, 65, 85, 0.6)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem 1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {/* 3D Rotating Logo Animation */}
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Background Glow */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(8px)',
                  animation: 'pulse 3s ease-in-out infinite'
                }} />
                
                {/* Outer Ring */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '2px solid rgba(20, 184, 166, 0.6)',
                  borderRadius: '50%',
                  animation: 'spin 4s linear infinite'
                }} />
                
                {/* Middle Ring */}
                <div style={{
                  position: 'absolute',
                  width: '80%',
                  height: '80%',
                  border: '2px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '50%',
                  animation: 'spin 3s linear infinite reverse'
                }} />
                
                {/* Inner Ring */}
                <div style={{
                  position: 'absolute',
                  width: '60%',
                  height: '60%',
                  border: '2px solid rgba(20, 184, 166, 0.4)',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite'
                }} />
                
                {/* Central Logo */}
                <div style={{
                  width: '50%',
                  height: '50%',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <Coins size={12} style={{ color: 'white' }} />
                </div>
                
                {/* Floating Particles */}
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  width: '4px',
                  height: '4px',
                  background: '#14b8a6',
                  borderRadius: '50%',
                  animation: 'particle1 4s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-2px',
                  width: '3px',
                  height: '3px',
                  background: '#8b5cf6',
                  borderRadius: '50%',
                  animation: 'particle2 3s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '30%',
                  width: '2px',
                  height: '2px',
                  background: '#14b8a6',
                  borderRadius: '50%',
                  animation: 'particle3 5s ease-in-out infinite'
                }} />
              </div>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                BitcoinPro
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Link to="/login">
                <Button variant="ghost" style={{
                  color: '#e2e8f0',
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.background = 'rgba(20, 184, 166, 0.15)';
                  e.target.style.borderColor = 'rgba(20, 184, 166, 0.5)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#e2e8f0';
                  e.target.style.background = 'rgba(30, 41, 59, 0.3)';
                  e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                }}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
                  transition: 'all 0.3s ease',
                  fontWeight: '500'
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
                }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          filter: 'blur(80px)'
        }} />
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            color: '#14b8a6',
            border: '2px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(20, 184, 166, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.2)';
          }}>
            <Star size={14} style={{ marginRight: '0.5rem' }} />
            #1 Trading Simulation Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 4.5rem)',
            fontWeight: '600',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 50%, #14b8a6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}>
            Master Trading
            <br />
            <span style={{ color: 'white' }}>Without Risk</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            marginBottom: '2rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Experience the thrill of cryptocurrency trading in a risk-free environment. Learn, compete, and master your
            skills with real market data and advanced tools.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            '@media (min-width: 640px)': {
              flexDirection: 'row'
            }
          }}>
            <Link to="/register">
              <Button variant="primary" size="large" style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.4)';
                e.target.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.3)';
                e.target.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
              }}>
                <Zap size={20} style={{ marginRight: '0.5rem' }} />
                Get Started Free
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Button>
            </Link>
            <Button variant="outline" size="large" style={{
              border: '2px solid rgba(71, 85, 105, 0.6)',
              color: '#e2e8f0',
              background: 'rgba(30, 41, 59, 0.3)',
              padding: '1rem 2.5rem',
              fontSize: '1.125rem',
              borderRadius: '0.75rem',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(51, 65, 85, 0.5)';
              e.target.style.borderColor = 'rgba(20, 184, 166, 0.4)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(30, 41, 59, 0.3)';
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.6)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            }}>
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '64rem',
            margin: '0 auto'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '2px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(20, 184, 166, 0.15)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.15)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  borderRadius: '50%',
                  filter: 'blur(15px)'
                }} />
                <stat.icon size={32} style={{
                  color: '#14b8a6',
                  margin: '0 auto 0.5rem',
                  display: 'block'
                }} />
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#e2e8f0'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Why Choose BitcoinPro?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#cbd5e1',
              maxWidth: '42rem',
              margin: '0 auto'
            }}>
              Everything you need to become a successful trader, all in one powerful platform
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '2px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '0.75rem',
                padding: '2rem',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(20, 184, 166, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(20, 184, 166, 0.15)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  borderRadius: '50%',
                  filter: 'blur(12px)'
                }} />
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '2px solid rgba(20, 184, 166, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)';
                }}>
                  <feature.icon size={24} style={{ color: '#14b8a6' }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.75rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#e2e8f0',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '64rem',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '2px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '1rem',
            padding: '3rem',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderRadius: '50%',
              filter: 'blur(25px)'
            }} />
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Ready to Start Your Trading Journey?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#cbd5e1',
              marginBottom: '2rem'
            }}>
              Join thousands of traders who are already mastering the markets with BitcoinPro
            </p>
            <Link to="/register">
              <Button variant="primary" size="large" style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
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
              }}>
                <Zap size={20} style={{ marginRight: '0.5rem' }} />
                Get Started Free
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Pages Redirection Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderTop: '1px solid rgba(51, 65, 85, 0.3)',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem'
          }}>
            Explore More
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem',
            marginBottom: '3rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Discover our comprehensive resources, stay connected, and learn about our policies
          </p>

          {/* Page Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* Blog Page Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(20, 184, 166, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)';
            }}
            onClick={() => window.location.href = '/blog'}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
              </div>
              <h3 style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Blog & Insights
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Stay updated with the latest crypto trends, trading strategies, and market insights from our expert team
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#14b8a6',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Read Articles <ArrowRight size={16} />
              </div>
            </div>

            {/* Contact Us Page Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            onClick={() => window.location.href = '/contact-us'}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📞</span>
              </div>
              <h3 style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Get in Touch
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Have questions? Need support? Reach out to our team through multiple channels for assistance
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#8b5cf6',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Contact Us <ArrowRight size={16} />
              </div>
            </div>

            {/* Cancellations and Refunds Page Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onClick={() => window.location.href = '/cancellations-and-refunds'}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #14b8a6 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span>
              </div>
              <h3 style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Policies & Refunds
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Understand our cancellation policies, refund procedures, and customer protection measures
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#ef4444',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                View Policies <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{
              color: '#f8fafc',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Ready to Start Trading?
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '1rem',
              marginBottom: '1.5rem'
            }}>
              Join thousands of traders and start your crypto journey today
            </p>
            <Link to="/register">
              <Button
                variant="primary"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid rgba(51, 65, 85, 0.6)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
        backdropFilter: 'blur(12px)',
        padding: '2rem 1.5rem',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Logo and Company Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
              border: '2px solid rgba(20, 184, 166, 0.3)'
            }}>
              <Coins size={18} style={{ color: 'white' }} />
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BitcoinPro
            </span>
          </div>

          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <Link to="/privacy" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#8b5cf6';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.borderColor = 'transparent';
            }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#8b5cf6';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.borderColor = 'transparent';
            }}>
              Terms of Service
            </Link>
            <Link to="/contact" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#8b5cf6';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.borderColor = 'transparent';
            }}>
              Contact Us
            </Link>
          </div>

          {/* Copyright */}
          <p style={{ 
            color: '#cbd5e1',
            fontSize: '0.875rem',
            margin: 0
          }}>
            © 2024 Bitcoinpro. All rights reserved. Trade smart, trade safe.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
