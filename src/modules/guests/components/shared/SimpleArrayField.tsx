import React from 'react';
import { Edit3 } from 'lucide-react';
import { ActionButtons } from './ActionButtons';

interface SimpleArrayFieldProps {
  label: string;
  value: string[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
  editValue: string[];
  onChange: (value: string) => void;
  emptyText?: string;
  placeholder?: string;
}

export const SimpleArrayField: React.FC<SimpleArrayFieldProps> = ({
  label,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isUpdating = false,
  disabled = false,
  editValue,
  onChange,
  emptyText = "No hay elementos",
  placeholder = "Separar elementos con comas"
}) => {
  const renderDisplayValue = () => {
    if (!value || value.length === 0) {
      return <span className="text-gray-500 italic">{emptyText}</span>;
    }

    return (
      <ul className="list-disc pl-5 text-gray-800">
        {value.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative group">
      <p className="text-sm text-gray-600 mb-1">{label}:</p>
      <div className="flex items-start gap-2">
        {isEditing ? (
          <div className="flex items-start gap-2 w-full">
            <textarea
              value={editValue?.join(', ') || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <ActionButtons
                onSave={onSave}
                onCancel={onCancel}
                isUpdating={isUpdating}
                disabled={disabled}
                layout="vertical"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
              {renderDisplayValue()}
            </div>
            <button
              onClick={onEdit}
              disabled={disabled}
              className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 disabled:opacity-30 flex-shrink-0"
              title="Editar"
              aria-label="Editar campo"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};