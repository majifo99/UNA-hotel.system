import React from 'react';

interface FormActionsProps {
  isLoading: boolean;
  isDisabled: boolean;
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  isDisabled,
  onCancel,
  onSubmit,
  submitText = 'Crear Reserva',
  cancelText = 'Cancelar'
}) => {
  return (
    <div className="relative mt-10">
      {/* Decorative separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-una-bg-300 to-transparent"></div>
      
      <div className="flex justify-end space-x-6 pt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="group relative overflow-hidden px-8 py-4 border-2 border-una-bg-300 rounded-xl text-una-primary-800 font-semibold hover:border-una-primary-600 focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:ring-offset-2 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-una-bg-100 to-una-bg-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">{cancelText}</span>
          </button>
        )}
        
        <button
          type="submit"
          disabled={isLoading || isDisabled}
          onClick={onSubmit}
          className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-una-primary-600 to-una-primary-800 text-white font-bold rounded-xl hover:from-una-primary-800 hover:to-una-primary-900 focus:outline-none focus:ring-2 focus:ring-una-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-una-accent-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          <span className={`relative z-10 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {isLoading ? 'Procesando...' : submitText}
          </span>
          
          {/* Success indicator (optional) */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-una-accent-gold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            →
          </div>
        </button>
      </div>
    </div>
  );
};
