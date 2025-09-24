import React from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { ActionButtons } from './ActionButtons';

interface ArrayFieldItem {
  [key: string]: string | undefined;
}

interface ArrayFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
}

interface InlineEditArrayFieldProps {
  label: string;
  value: ArrayFieldItem[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
  editValue: ArrayFieldItem[];
  onChange: (items: ArrayFieldItem[]) => void;
  fields: ArrayFieldConfig[];
  displayFormat?: (item: ArrayFieldItem, index: number) => string;
  addButtonText?: string;
  emptyText?: string;
  maxItems?: number;
}

export const InlineEditArrayField: React.FC<InlineEditArrayFieldProps> = ({
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
  displayFormat,
  addButtonText = "Agregar elemento",
  emptyText = "No hay elementos",
  maxItems
}) => {
  const handleItemChange = (index: number, key: string, newValue: string) => {
    const updatedItems = [...editValue];
    updatedItems[index] = { ...updatedItems[index], [key]: newValue };
    onChange(updatedItems);
  };

  const handleAddItem = () => {
    if (maxItems && editValue.length >= maxItems) return;
    
    const newItem: ArrayFieldItem = {};
    fields.forEach(field => {
      newItem[field.key] = '';
    });
    onChange([...editValue, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = editValue.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  const renderEditItems = () => {
    return (
      <div className="flex-1 space-y-4">
        {editValue.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Elemento {index + 1}
              </h4>
              <button
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                title="Eliminar elemento"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}:
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={item[field.key] || ''}
                    onChange={(e) => handleItemChange(index, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {(!maxItems || editValue.length < maxItems) && (
          <button
            onClick={handleAddItem}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
            type="button"
          >
            <Plus size={20} />
            {addButtonText}
          </button>
        )}
      </div>
    );
  };

  const renderDisplayValue = () => {
    if (!value || value.length === 0) {
      return <span className="text-gray-500 italic">{emptyText}</span>;
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="text-base text-gray-800">
            {displayFormat ? (
              displayFormat(item, index)
            ) : (
              <div className="bg-gray-50 rounded-md p-3 border">
                {fields.map((field, fieldIndex) => (
                  item[field.key] && (
                    <div key={field.key} className={fieldIndex > 0 ? 'mt-1' : ''}>
                      <span className="text-sm text-gray-600">{field.label}: </span>
                      <span className="font-medium">{item[field.key]}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative group">
      <p className="text-sm text-gray-600 mb-1">{label}:</p>
      <div className="flex items-start gap-2">
        {isEditing ? (
          <div className="flex flex-col gap-3 w-full">
            {renderEditItems()}
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