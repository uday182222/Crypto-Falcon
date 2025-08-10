import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  className = '', 
  style = {}, 
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    outline: 'none',
    ...style
  };

  const sizes = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem'
    },
    medium: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem'
    },
    large: {
      padding: '1rem 2rem',
      fontSize: '1.125rem'
    }
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(149, 104, 255, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #7135ff 0%, #3d00ce 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(149, 104, 255, 0.4)'
      }
    },
    secondary: {
      background: 'linear-gradient(135deg, #362465 0%, #22173f 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(54, 36, 101, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #22173f 0%, #1a0f2e 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(54, 36, 101, 0.4)'
      }
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
      }
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
      }
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)'
      }
    },
    outline: {
      background: 'transparent',
      color: '#9568FF',
      border: '2px solid #9568FF',
      '&:hover': {
        background: '#9568FF',
        color: 'white',
        transform: 'translateY(-2px)'
      }
    },
    ghost: {
      background: 'transparent',
      color: '#6b7280',
      '&:hover': {
        background: 'rgba(107, 114, 128, 0.1)',
        color: '#374151'
      }
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...sizes[size],
    ...variants[variant],
    opacity: disabled ? 0.6 : 1,
    transform: disabled ? 'none' : undefined
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
