import React from 'react';
import { Edit3 } from 'lucide-react';
import { ActionButtons } from './ActionButtons';

interface NestedFieldData {
  [key: string]: string | undefined;
}

interface NestedFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
}

interface InlineEditNestedFieldProps {
  label: string;
  value: NestedFieldData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
  editValue: NestedFieldData;
  onChange: (key: string, value: string) => void;
  fields: NestedFieldConfig[];
  displayFormat?: (data: NestedFieldData) => string;
}

export const InlineEditNestedField: React.FC<InlineEditNestedFieldProps> = ({
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
  fields,
  displayFormat
}) => {
  const renderEditInputs = () => {
    return (
      <div className="flex-1 space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-gray-600 mb-1">
              {field.label}:
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={editValue[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={editValue[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDisplayValue = () => {
    if (displayFormat) {
      const formatted = displayFormat(value);
      return formatted || '—';
    }
    
    // Default display: show all non-empty fields
    const displayParts = fields
      .map(field => value[field.key])
      .filter(val => val && val.trim() !== '')
      .join(', ');
    
    return displayParts || '—';
  };

  return (
    <div className="relative group">
      <p className="text-sm text-gray-600 mb-1">{label}:</p>
      <div className="flex items-start gap-2">
        {isEditing ? (
          <div className="flex flex-col gap-3 w-full">
            {renderEditInputs()}
            <div className="flex justify-end">
              <ActionButtons
                onSave={onSave}
                onCancel={onCancel}
                isUpdating={isUpdating}
                disabled={disabled}
                layout="horizontal"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 w-full">
            <div className="text-base text-gray-800 font-medium flex-1">
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