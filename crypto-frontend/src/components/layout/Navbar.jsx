import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Wallet, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Coins, 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  Activity 
} from 'lucide-react';
import { authAPI } from '../../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    // The logout function will redirect to /login
  };

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
      
      @keyframes slideRight {
        0% { transform: translateX(0); }
        50% { transform: translateX(15px); }
        100% { transform: translateX(0); }
      }
      
      @keyframes slideRightContinuous {
        0% { transform: translateX(0); }
        100% { transform: translateX(20px); }
      }
      
      @keyframes slideRightPulse {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/trading', label: 'Trading', icon: TrendingUp },
    { path: '/portfolio', label: 'Portfolio', icon: BarChart3 },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  // Trading icons for background animation
  const tradingIcons = [
    { icon: Coins, color: '#fbbf24', size: 20 },
    { icon: Bitcoin, color: '#f59e0b', size: 18 },
    { icon: TrendingUp, color: '#10b981', size: 16 },
    { icon: TrendingDown, color: '#ef4444', size: 16 },
    { icon: Activity, color: '#8b5cf6', size: 14 },
    { icon: Wallet, color: '#06b6d4', size: 18 },
    { icon: Trophy, color: '#f97316', size: 16 },
    { icon: BarChart3, color: '#ec4899', size: 16 },
    { icon: Coins, color: '#fbbf24', size: 16 },
    { icon: Bitcoin, color: '#f59e0b', size: 14 },
    { icon: TrendingUp, color: '#10b981', size: 18 },
    { icon: TrendingDown, color: '#ef4444', size: 16 },
    { icon: Activity, color: '#8b5cf6', size: 20 },
    { icon: Wallet, color: '#06b6d4', size: 16 },
    { icon: Trophy, color: '#f97316', size: 14 },
    { icon: BarChart3, color: '#ec4899', size: 18 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 80; // Navbar height
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create 50+ floating icons for high-speed effect
    const icons = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 3.0 + 1.0, // Added rightward bias (+1.0)
      vy: (Math.random() - 0.5) * 3.0, // Increased velocity for high speed
      opacity: 0.15 + Math.random() * 0.25, // Varied opacity
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1, // Increased rotation speed
      size: 8 + Math.random() * 12, // Varied sizes for time effect
      color: tradingIcons[Math.floor(Math.random() * tradingIcons.length)].color,
      // Add time effect properties
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.05 + Math.random() * 0.1,
      trail: [], // Trail effect for time distortion
      maxTrailLength: 3 + Math.floor(Math.random() * 5),
      // Add horizontal movement properties
      horizontalBias: 0.8 + Math.random() * 0.4, // 0.8 to 1.2 bias to the right
      horizontalPulse: Math.random() * Math.PI * 2,
      horizontalPulseSpeed: 0.02 + Math.random() * 0.03
    }));

    // Physics constants - optimized for high speed
    const REPULSION_FORCE = 1.2; // Increased repulsion
    const REPULSION_RADIUS = 80; // Smaller radius for more intense effect
    const DAMPING = 0.95; // Less damping for sustained speed
    const BOUNDARY_BOUNCE = 0.9; // More bouncy for energy
    const TIME_WARP_FACTOR = 1.5; // Time distortion effect

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle time warp background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
      for (let i = 0; i < 10; i++) {
        const time = Date.now() * 0.001;
        const x = (i * 100 + time * 50) % canvas.width;
        ctx.fillRect(x, 0, 2, canvas.height);
      }

      icons.forEach((icon, index) => {
        // Apply repulsion force from mouse with time distortion
        const dx = icon.x - mousePos.x;
        const dy = icon.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < REPULSION_RADIUS && distance > 0) {
          const force = (REPULSION_RADIUS - distance) / REPULSION_RADIUS;
          const angle = Math.atan2(dy, dx);
          const timeWarp = Math.sin(Date.now() * 0.01) * TIME_WARP_FACTOR;
          
          icon.vx += Math.cos(angle) * force * REPULSION_FORCE * (1 + timeWarp * 0.1);
          icon.vy += Math.sin(angle) * force * REPULSION_FORCE * (1 + timeWarp * 0.1);
        }

        // Update position with high speed
        icon.x += icon.vx;
        icon.y += icon.vy;

        // Apply minimal damping for sustained speed
        icon.vx *= DAMPING;
        icon.vy *= DAMPING;

        // Boundary collision with energy preservation
        if (icon.x < 0 || icon.x > canvas.width) {
          icon.vx *= -BOUNDARY_BOUNCE;
          icon.x = Math.max(0, Math.min(canvas.width, icon.x));
        }
        if (icon.y < 0 || icon.y > canvas.height) {
          icon.vy *= -BOUNDARY_BOUNCE;
          icon.y = Math.max(0, Math.min(canvas.height, icon.y));
        }

        // Update rotation and pulse for time effect
        icon.rotation += icon.rotationSpeed;
        icon.pulse += icon.pulseSpeed;

        // Update trail for time distortion effect
        icon.trail.push({ x: icon.x, y: icon.y, opacity: icon.opacity });
        if (icon.trail.length > icon.maxTrailLength) {
          icon.trail.shift();
        }

        // Draw trail effect
        icon.trail.forEach((trailPoint, trailIndex) => {
          const trailOpacity = (trailIndex / icon.trail.length) * icon.opacity * 0.3;
          ctx.save();
          ctx.globalAlpha = trailOpacity;
          ctx.fillStyle = icon.color;
          ctx.beginPath();
          ctx.arc(trailPoint.x, trailPoint.y, icon.size / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw main icon with time warp effects
        ctx.save();
        ctx.translate(icon.x, icon.y);
        ctx.rotate(icon.rotation);
        
        // Time distortion effect - size pulsing
        const timeScale = 1 + Math.sin(icon.pulse) * 0.2;
        ctx.scale(timeScale, timeScale);
        
        ctx.globalAlpha = icon.opacity;
        
        // Draw icon with enhanced effects
        ctx.fillStyle = icon.color;
        ctx.beginPath();
        ctx.arc(0, 0, icon.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkle effect with time variation
        if (Math.random() < 0.15) {
          ctx.globalAlpha = icon.opacity * 0.6;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, icon.size / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add time warp glow effect
        ctx.globalAlpha = icon.opacity * 0.1;
        ctx.fillStyle = icon.color;
        ctx.beginPath();
        ctx.arc(0, 0, icon.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos]);

  return (
    <div style={{ position: 'relative', height: '80px' }}>
      {/* Background Animation Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          background: 'transparent'
        }}
      />
      
      {/* Navbar Content */}
      <nav style={{
        borderBottom: '2px solid rgba(51, 65, 85, 0.6)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)', // Further reduced opacity
        backdropFilter: 'blur(6px)', // Further reduced blur
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        padding: '1rem 2rem',
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              position: 'relative',
              zIndex: 10
            }}>
              {/* 3D Rotating Logo Animation - Adjusted for Navbar */}
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
                    alt="MotionFalcon Logo"
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
                
                {/* Floating Particles - Scaled down for navbar */}
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
                fontSize: '1.5rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                MotionFalcon
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    color: isActive(item.path) ? '#14b8a6' : '#e2e8f0',
                    background: isActive(item.path) 
                      ? 'rgba(20, 184, 166, 0.2)' 
                      : 'rgba(30, 41, 59, 0.3)',
                    border: isActive(item.path) 
                      ? '2px solid rgba(20, 184, 166, 0.5)' 
                      : '2px solid rgba(71, 85, 105, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isActive(item.path) 
                      ? '0 4px 15px rgba(20, 184, 166, 0.3)' 
                      : '0 2px 10px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.background = 'rgba(20, 184, 166, 0.15)';
                      e.target.style.color = 'white';
                      e.target.style.borderColor = 'rgba(20, 184, 166, 0.5)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.background = 'rgba(30, 41, 59, 0.3)';
                      e.target.style.color = '#e2e8f0';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)',
              fontWeight: '500',
              fontSize: '0.875rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
            onClick={handleLogout}>
              <LogOut size={18} style={{ marginRight: '0.5rem' }} />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
