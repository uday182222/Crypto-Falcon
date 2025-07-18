import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    textDecoration: 'none',
    opacity: disabled ? '0.5' : '1'
  };

  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: '13px' },
    md: { padding: '10px 16px', fontSize: '14px' },
    lg: { padding: '12px 20px', fontSize: '16px' }
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.3)'
    },
    secondary: {
      background: 'rgba(100, 116, 139, 0.1)',
      color: '#cbd5e1',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    },
    outline: {
      background: 'transparent',
      color: '#cbd5e1',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.3)'
    },
    success: {
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.3)'
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.3)'
    },
    ghost: {
      background: 'transparent',
      color: '#cbd5e1',
      border: 'none'
    },
    link: {
      background: 'transparent',
      color: '#3b82f6',
      border: 'none',
      textDecoration: 'underline'
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  return (
    <button
      style={combinedStyles}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 