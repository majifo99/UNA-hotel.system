import React from 'react';
import { Edit3 } from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { ActionButtons } from './ActionButtons';

export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'select' | 'country';
export type FieldValue = string | number | boolean | string[] | undefined;

interface Option {
  value: string;
  label: string;
}

interface BaseInlineEditFieldProps {
  label: string;
  value?: FieldValue;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
}

interface SimpleFieldProps extends BaseInlineEditFieldProps {
  type: Exclude<FieldType, 'select' | 'country'>;
  editValue: FieldValue;
  onChange: (value: any) => void;
}

interface SelectFieldProps extends BaseInlineEditFieldProps {
  type: 'select';
  editValue: string;
  onChange: (value: string) => void;
  options: Option[];
}

interface CountryFieldProps extends BaseInlineEditFieldProps {
  type: 'country';
  editValue: string;
  onChange: (value: string) => void;
}

type InlineEditFieldProps = SimpleFieldProps | SelectFieldProps | CountryFieldProps;

export const InlineEditField: React.FC<InlineEditFieldProps> = (props) => {
  const {
    label,
    value,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    isUpdating = false,
    disabled = false,
    type,
    editValue,
    onChange
  } = props;

  const renderEditInput = () => {
    const baseInputClass = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

    switch (type) {
      case 'select': {
        const selectProps = props as SelectFieldProps;
        return (
          <select
            value={selectProps.editValue}
            onChange={(e) => selectProps.onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Seleccionar...</option>
            {selectProps.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
      
      case 'textarea':
        return (
          <textarea
            value={editValue as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
            rows={3}
          />
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editValue as boolean || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {editValue ? 'Sí' : 'No'}
            </span>
          </label>
        );
      
      case 'country': {
        const countryProps = props as CountryFieldProps;
        return (
          <div className="flex-1">
            <ReactFlagsSelect
              selected={countryProps.editValue}
              onSelect={(countryCode) => countryProps.onChange(countryCode)}
              placeholder="Seleccionar país..."
              searchable
              searchPlaceholder="Buscar país..."
              className="w-full"
              selectButtonClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              showSelectedLabel={true}
              showOptionLabel={true}
            />
          </div>
        );
      }
      
      default:
        return (
          <input
            type={type}
            value={editValue as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        );
    }
  };

  const renderDisplayValue = () => {
    if (type === 'checkbox') {
      return value ? 'Sí' : 'No';
    }
    
    if (type === 'country' && value) {
      return (
        <div className="flex items-center gap-2">
          <ReactFlagsSelect
            selected={value as string}
            onSelect={() => {}} // No interaction in view mode
            showSelectedLabel={true}
            disabled={true}
            className="pointer-events-none"
            selectButtonClassName="border-none bg-transparent p-0 cursor-default"
          />
        </div>
      );
    }
    
    return value !== undefined && value !== '' ? String(value) : '—';
  };

  return (
    <div className="relative group">
      <p className="text-sm text-gray-600 mb-1">{label}:</p>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            {renderEditInput()}
            <ActionButtons
              onSave={onSave}
              onCancel={onCancel}
              isUpdating={isUpdating}
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div className="text-base text-gray-800 font-medium flex-1">
              {renderDisplayValue()}
            </div>
            <button
              onClick={onEdit}
              disabled={disabled}
              className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 disabled:opacity-30"
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