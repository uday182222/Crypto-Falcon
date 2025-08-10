import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '', style = {} }) => {
  const sizes = {
    small: { width: '20px', height: '20px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' }
  };

  const colors = {
    primary: '#9568FF',
    secondary: '#362465',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const spinnerStyles = {
    display: 'inline-block',
    width: sizes[size].width,
    height: sizes[size].height,
    border: `3px solid rgba(${color === 'primary' ? '149, 104, 255' : 
                              color === 'secondary' ? '54, 36, 101' : 
                              color === 'success' ? '16, 185, 129' : 
                              color === 'warning' ? '245, 158, 11' : 
                              color === 'danger' ? '239, 68, 68' : 
                              '59, 130, 246'}, 0.2)`,
    borderTop: `3px solid ${colors[color] || colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style
  };

  const keyframeStyles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframeStyles}</style>
      <div 
        className={`loading-spinner ${className}`}
        style={spinnerStyles}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
};

export default LoadingSpinner;
