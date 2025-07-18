import { forwardRef } from 'react';

const Input = forwardRef(({ 
  type = 'text', 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  const inputClasses = `
    flex h-10 w-full rounded-md border border-dark-300 bg-background px-3 py-2 text-sm 
    ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
    placeholder:text-dark-500 focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed 
    disabled:opacity-50 ${error ? 'border-danger-500' : ''} ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 