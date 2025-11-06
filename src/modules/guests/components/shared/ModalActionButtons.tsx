import React from 'react';
import { X, Save } from 'lucide-react';

interface ModalActionButtonsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  submittingText?: string;
  cancelText?: string;
  disabled?: boolean;
  layout?: 'horizontal' | 'stacked';
}

export const ModalActionButtons: React.FC<ModalActionButtonsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitText = 'Guardar',
  submittingText = 'Guardando...',
  cancelText = 'Cancelar',
  disabled = false,
  layout = 'horizontal'
}) => {
  const containerClass = layout === 'horizontal' 
    ? 'flex gap-3 pt-6'
    : 'flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6';

  const buttonClass = layout === 'horizontal'
    ? 'flex-1 flex items-center justify-center gap-2 py-2 px-4 transition-colors'
    : 'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 transition-colors text-sm sm:text-base';

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={onCancel}
        className={`${buttonClass} border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50`}
      >
        <X size={16} />
        {cancelText}
      </button>
      
      {onSubmit ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || disabled}
          className={`${buttonClass} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save size={16} />
          )}
          {isSubmitting ? submittingText : submitText}
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className={`${buttonClass} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save size={16} />
          )}
          {isSubmitting ? submittingText : submitText}
        </button>
      )}
    </div>
  );
};