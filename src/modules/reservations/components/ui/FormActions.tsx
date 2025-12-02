import React from 'react';

interface FormActionsProps {
  isLoading: boolean;
  isDisabled: boolean;
  hasErrors?: boolean;
  errorCount?: number;
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  isDisabled,
  hasErrors = false,
  errorCount = 0,
  onCancel,
  onSubmit,
  submitText = 'Crear Reserva',
  cancelText = 'Cancelar'
}) => {
  const isSubmitDisabled = isLoading || isDisabled || hasErrors;

  return (
    <div className="relative mt-10">
      {/* Decorative separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-una-bg-300 to-transparent"></div>
      
      {/* Validation status */}
      {hasErrors && errorCount > 0 && (
        <div className="pt-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Por favor corrija los siguientes errores:
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Hay {errorCount} error{errorCount > 1 ? 'es' : ''} que debe{errorCount > 1 ? 'n' : ''} corregirse antes de crear la reserva.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
          disabled={isSubmitDisabled}
          onClick={onSubmit}
          className={`group relative overflow-hidden px-10 py-4 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-lg ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-una-primary-600 to-una-primary-800 text-black hover:from-una-primary-800 hover:to-una-primary-900 focus:ring-una-primary-600 hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
          title={hasErrors ? 'Corrija los errores del formulario para continuar' : ''}
        >
          {/* Button glow effect */}
          {!isSubmitDisabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-una-accent-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          <span className={`relative z-10 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {isLoading 
              ? 'Procesando...' 
              : hasErrors 
                ? 'Corregir errores' 
                : submitText
            }
          </span>
          
          {/* Success indicator (optional) */}
          {!isSubmitDisabled && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-una-accent-gold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              →
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
