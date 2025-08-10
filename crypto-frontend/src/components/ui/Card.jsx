import React from 'react';

const Card = ({ children, variant = 'default', className = '', style = {}, ...props }) => {
  const baseStyles = {
    background: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    ...style
  };

  const variants = {
    default: {
      ...baseStyles
    },
    'glass-dark': {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    primary: {
      ...baseStyles,
      background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      ...baseStyles,
      background: 'linear-gradient(135deg, #362465 0%, #22173f 100%)',
      color: 'white',
      border: 'none'
    },
    success: {
      ...baseStyles,
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none'
    },
    warning: {
      ...baseStyles,
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      border: 'none'
    },
    info: {
      ...baseStyles,
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none'
    }
  };

  const cardStyles = variants[variant] || variants.default;

  return (
    <div 
      className={`card ${className}`}
      style={cardStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
