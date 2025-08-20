import React from 'react';

const Logo = ({ 
  size = 'medium', 
  className = '', 
  style = {}, 
  showText = true,
  variant = 'default' // 'default', 'navbar', 'footer', 'loading'
}) => {
  // Size presets
  const sizeMap = {
    small: { width: '12px', height: '12px' },
    medium: { width: '24px', height: '24px' },
    large: { width: '48px', height: '48px' },
    xl: { width: '70px', height: '70px' }
  };

  // Variant-specific styles
  const variantStyles = {
    navbar: {
      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
      zIndex: 2,
      position: 'relative'
    },
    footer: {
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
    },
    loading: {
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
      zIndex: 2,
      position: 'relative'
    },
    default: {}
  };

  const logoStyles = {
    ...sizeMap[size],
    objectFit: 'contain',
    ...variantStyles[variant],
    ...style
  };

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <img 
        src="/yqRCvprlca2HEIUhFc404ozGNPI.avif"
        alt="BitcoinPro Logo"
        style={logoStyles}
      />
      {showText && (
        <span style={{
          fontSize: size === 'small' ? '1rem' : size === 'medium' ? '1.25rem' : size === 'large' ? '1.5rem' : '2rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          BitcoinPro
        </span>
      )}
    </div>
  );
};

export default Logo;
