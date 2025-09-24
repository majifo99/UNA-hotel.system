import React from 'react';
import { Save, X } from 'lucide-react';

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onCancel,
  isUpdating = false,
  disabled = false,
  layout = 'horizontal'
}) => {
  const containerClass = layout === 'vertical' 
    ? 'flex flex-col gap-1'
    : 'flex items-center gap-1';

  return (
    <div className={containerClass}>
      <button
        onClick={onSave}
        disabled={isUpdating || disabled}
        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
        title="Guardar"
      >
        {isUpdating ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        ) : (
          <Save size={16} />
        )}
      </button>
      <button
        onClick={onCancel}
        disabled={isUpdating || disabled}
        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
        title="Cancelar"
      >
        <X size={16} />
      </button>
    </div>
  );
};