import React from 'react';

const CardHeader = ({ children, className = '', ...props }) => (
  <div 
    style={{
      padding: '0 0 16px 0',
      borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
      marginBottom: '16px'
    }}
    className={className} 
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div 
    style={{
      padding: '16px 0 0 0',
      borderTop: '1px solid rgba(71, 85, 105, 0.3)',
      marginTop: '16px'
    }}
    className={className} 
    {...props}
  >
    {children}
  </div>
);

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseStyles = {
    borderRadius: '12px',
    padding: '24px'
  };

  const variantStyles = {
    default: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    'glass-dark': {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    },
    gradient: {
      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    glow: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant]
  };

  return (
    <div
      style={combinedStyles}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Export all components
export { CardHeader as Header, CardContent as Content, CardFooter as Footer };
export default Card; 