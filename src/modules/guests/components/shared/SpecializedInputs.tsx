import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { COUNTRY_LABELS, PHONE_CONFIG } from '../../constants';

interface PhoneInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <PhoneInput
        country={PHONE_CONFIG.defaultCountry}
        value={value}
        onChange={onChange}
        inputClass={`!w-full !py-2 !px-3 !text-base !border !rounded-lg !focus:ring-2 !focus:ring-blue-500 !focus:border-transparent ${
          error ? '!border-red-500' : '!border-gray-300'
        }`}
        containerClass="mt-1"
        buttonClass="!border !border-gray-300 !rounded-l-lg"
        dropdownClass="!z-50"
        searchClass="!px-3 !py-2 !border !border-gray-300 !rounded"
        placeholder="8888-9999"
        enableSearch
        searchPlaceholder="Buscar país..."
        preferredCountries={PHONE_CONFIG.preferredCountries}
        localization={PHONE_CONFIG.localization}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface NationalitySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const NationalitySelect: React.FC<NationalitySelectProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <ReactFlagsSelect
        selected={value}
        onSelect={onChange}
        placeholder="Selecciona tu nacionalidad"
        searchable
        customLabels={COUNTRY_LABELS}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};