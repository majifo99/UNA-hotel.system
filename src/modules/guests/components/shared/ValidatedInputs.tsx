import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export type ValidationState = 'error' | 'success' | 'default';

interface ValidationIndicatorProps {
  state: ValidationState;
  error?: string;
  successMessage?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  state,
  error,
  successMessage = 'Válido'
}) => {
  if (state === 'error' && error) {
    return (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
        <AlertCircle size={14} />
        {error}
      </div>
    );
  }
  
  if (state === 'success') {
    return (
      <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
        <CheckCircle size={14} />
        {successMessage}
      </div>
    );
  }
  
  return null;
};

export const getValidationClassName = (state: ValidationState, baseClasses: string = '') => {
  const stateClasses = {
    error: 'border-red-300 bg-red-50',
    success: 'border-green-300 bg-green-50',
    default: 'border-gray-300'
  };
  
  return `${baseClasses} ${stateClasses[state]}`;
};

interface ValidatedTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationState?: ValidationState;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'date';
  className?: string;
  id?: string;
}

export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  label,
  value,
  onChange,
  validationState = 'default',
  error,
  required = false,
  placeholder,
  type = 'text',
  className = '',
  id
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={getValidationClassName(
          validationState,
          'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
        )}
        placeholder={placeholder}
        required={required}
      />
      <ValidationIndicator state={validationState} error={error} />
    </div>
  );
};