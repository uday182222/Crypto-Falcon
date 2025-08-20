import React, { useEffect } from 'react';

const LoadingAnimation = ({ message = 'Loading...', size = 'medium' }) => {
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

  const sizes = {
    small: { width: '80px', height: '80px' },
    medium: { width: '120px', height: '120px' },
    large: { width: '200px', height: '200px' }
  };

  const currentSize = sizes[size];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      {/* 3D Rotating Logo Animation */}
      <div style={{
        width: currentSize.width,
        height: currentSize.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        animation: 'float3d 6s ease-in-out infinite',
        marginBottom: '2rem'
      }}>
        {/* Background Glow Effect */}
        <div style={{
          position: 'absolute',
          width: `${currentSize.width * 1.2}px`,
          height: `${currentSize.height * 1.2}px`,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'pulse 4s ease-in-out infinite',
          left: '50%',
          top: '50%',
          marginLeft: `-${currentSize.width * 0.6}px`,
          marginTop: `-${currentSize.height * 0.6}px`
        }} />
        
        {/* Outer Ring */}
        <div style={{
          position: 'absolute',
          width: `${currentSize.width * 0.9}px`,
          height: `${currentSize.height * 0.9}px`,
          border: `${Math.max(2, currentSize.width * 0.02)}px solid transparent`,
          borderTop: `${Math.max(2, currentSize.width * 0.02)}px solid rgba(20, 184, 166, 0.8)`,
          borderRight: `${Math.max(2, currentSize.width * 0.02)}px solid rgba(139, 92, 246, 0.8)`,
          borderRadius: '50%',
          animation: 'spin 4s linear infinite',
          boxShadow: '0 0 30px rgba(20, 184, 166, 0.3), inset 0 0 30px rgba(20, 184, 166, 0.1)',
          left: '50%',
          top: '50%',
          marginLeft: `-${currentSize.width * 0.45}px`,
          marginTop: `-${currentSize.height * 0.45}px`
        }} />
        
        {/* Middle Ring */}
        <div style={{
          position: 'absolute',
          width: `${currentSize.width * 0.7}px`,
          height: `${currentSize.height * 0.7}px`,
          border: `${Math.max(1.5, currentSize.width * 0.015)}px solid transparent`,
          borderTop: `${Math.max(1.5, currentSize.width * 0.015)}px solid rgba(139, 92, 246, 0.7)`,
          borderLeft: `${Math.max(1.5, currentSize.width * 0.015)}px solid rgba(20, 184, 166, 0.7)`,
          borderRadius: '50%',
          animation: 'spin 3s linear infinite reverse',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.3), inset 0 0 25px rgba(139, 92, 246, 0.1)',
          left: '50%',
          top: '50%',
          marginLeft: `-${currentSize.width * 0.35}px`,
          marginTop: `-${currentSize.height * 0.35}px`
        }} />
        
        {/* Inner Ring */}
        <div style={{
          position: 'absolute',
          width: `${currentSize.width * 0.5}px`,
          height: `${currentSize.height * 0.5}px`,
          border: `${Math.max(1.5, currentSize.width * 0.015)}px solid transparent`,
          borderBottom: `${Math.max(1.5, currentSize.width * 0.015)}px solid rgba(20, 184, 166, 0.6)`,
          borderRight: `${Math.max(1.5, currentSize.width * 0.015)}px solid rgba(139, 92, 246, 0.6)`,
          borderRadius: '50%',
          animation: 'spin 2s linear infinite',
          boxShadow: '0 0 20px rgba(20, 184, 166, 0.3), inset 0 0 20px rgba(20, 184, 166, 0.1)',
          left: '50%',
          top: '50%',
          marginLeft: `-${currentSize.width * 0.25}px`,
          marginTop: `-${currentSize.height * 0.25}px`
        }} />
        
        {/* Central Logo Container */}
        <div style={{
          width: `${currentSize.width * 0.3}px`,
          height: `${currentSize.height * 0.3}px`,
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
          marginLeft: `-${currentSize.width * 0.15}px`,
          marginTop: `-${currentSize.height * 0.15}px`
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
              width: `${currentSize.width * 0.2}px`,
              height: `${currentSize.height * 0.2}px`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              zIndex: 2,
              position: 'relative'
            }}
          />
        </div>
        
        {/* Floating Particles */}
        <div style={{
          position: 'absolute',
          width: `${Math.max(3, currentSize.width * 0.02)}px`,
          height: `${Math.max(3, currentSize.height * 0.02)}px`,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 1) 0%, rgba(20, 184, 166, 0.3) 70%, transparent 100%)',
          borderRadius: '50%',
          top: `${currentSize.height * 0.1}px`,
          left: `${currentSize.width * 0.1}px`,
          animation: 'particle1 3s ease-in-out infinite',
          boxShadow: '0 0 15px rgba(20, 184, 166, 0.6)'
        }} />
        <div style={{
          position: 'absolute',
          width: `${Math.max(2.5, currentSize.width * 0.018)}px`,
          height: `${Math.max(2.5, currentSize.height * 0.018)}px`,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)',
          borderRadius: '50%',
          top: `${currentSize.height * 0.8}px`,
          right: `${currentSize.width * 0.1}px`,
          animation: 'particle2 4s ease-in-out infinite',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)'
        }} />
        <div style={{
          position: 'absolute',
          width: `${Math.max(2, currentSize.width * 0.015)}px`,
          height: `${Math.max(2, currentSize.height * 0.015)}px`,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.2) 70%, transparent 100%)',
          borderRadius: '50%',
          bottom: `${currentSize.height * 0.2}px`,
          left: `${currentSize.width * 0.4}px`,
          animation: 'particle3 5s ease-in-out infinite',
          boxShadow: '0 0 10px rgba(20, 184, 166, 0.5)'
        }} />
        
        {/* Additional Ambient Particles */}
        <div style={{
          position: 'absolute',
          width: `${Math.max(1.5, currentSize.width * 0.012)}px`,
          height: `${Math.max(1.5, currentSize.height * 0.012)}px`,
          background: 'rgba(139, 92, 246, 0.4)',
          borderRadius: '50%',
          top: `${currentSize.height * 0.3}px`,
          right: `${currentSize.width * 0.2}px`,
          animation: 'particle4 6s ease-in-out infinite',
          boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)'
        }} />
        <div style={{
          position: 'absolute',
          width: `${Math.max(1, currentSize.width * 0.008)}px`,
          height: `${Math.max(1, currentSize.height * 0.008)}px`,
          background: 'rgba(20, 184, 166, 0.3)',
          borderRadius: '50%',
          top: `${currentSize.height * 0.6}px`,
          left: `${currentSize.width * 0.15}px`,
          animation: 'particle5 7s ease-in-out infinite',
          boxShadow: '0 0 6px rgba(20, 184, 166, 0.3)'
        }} />
      </div>
      
      {/* Loading Text */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          BitcoinPro
        </h1>
        <p style={{ 
          color: '#94a3b8',
          fontSize: '1.125rem',
          margin: 0
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
