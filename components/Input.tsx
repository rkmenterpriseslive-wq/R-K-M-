
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
  icon?: React.ReactNode; // New prop for a leading icon
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', icon, wrapperClassName = 'mb-4', ...props }) => {
  const baseStyles = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const inputWithIconStyles = icon ? 'pl-10' : ''; // Add padding-left if icon is present

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* Fix: Explicitly cast the icon to React.ReactElement<any> to allow 'className' prop */}
            {React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 text-gray-400" })}
          </div>
        )}
        <input
          id={id}
          className={`${baseStyles} ${errorStyles} ${inputWithIconStyles} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
