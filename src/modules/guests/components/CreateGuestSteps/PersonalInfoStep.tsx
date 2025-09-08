import React from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import ReactFlagsSelect from 'react-flags-select';
import type { Guest } from '../../types';

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface PersonalInfoStepProps {
  formData: Partial<Guest>;
  validationErrors: ValidationErrors;
  updateField: (field: string, value: any) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  validationErrors,
  updateField
}) => {
  const renderFieldValidation = (fieldName: string, value: any) => {
    if (validationErrors[fieldName]) {
      return (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          {validationErrors[fieldName]}
        </div>
      );
    }
    
    if (value && !validationErrors[fieldName]) {
      return (
        <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
          <CheckCircle size={14} />
          Válido
        </div>
      );
    }
    
    return null;
  };

  const getFieldClassName = (fieldName: string, value: any) => {
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      validationErrors[fieldName] 
        ? 'border-red-300 bg-red-50' 
        : value 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-300'
    }`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <User className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Nombre */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={getFieldClassName('firstName', formData.firstName)}
            required
          />
          {renderFieldValidation('firstName', formData.firstName)}
        </div>

        {/* Apellidos */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={getFieldClassName('lastName', formData.lastName)}
            required
          />
          {renderFieldValidation('lastName', formData.lastName)}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={getFieldClassName('email', formData.email)}
            required
          />
          {renderFieldValidation('email', formData.email)}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <PhoneInput
            country='cr'
            value={formData.phone || ''}
            onChange={(phone) => updateField('phone', phone)}
            inputProps={{
              id: 'phone',
              name: 'phone',
              required: true,
            }}
            inputClass={getFieldClassName('phone', formData.phone)}
            containerClass="w-full"
            buttonClass="!border-gray-300 !rounded-l-lg"
          />
          {renderFieldValidation('phone', formData.phone)}
        </div>

        {/* Nacionalidad */}
        <div>
          <label id="nationality-label" className="block text-sm font-medium text-gray-700 mb-2">
            Nacionalidad *
          </label>
          <ReactFlagsSelect
            selected={formData.nationality || 'CR'}
            onSelect={(code) => updateField('nationality', code)}
            className="w-full"
            selectButtonClassName={`react-flags-select-button w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-colors ${
              validationErrors.nationality 
                ? 'border-red-300 bg-red-50' 
                : formData.nationality 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300'
            }`}
            aria-labelledby="nationality-label"
            aria-required="true"
            placeholder="Seleccionar país"
          />
          {renderFieldValidation('nationality', formData.nationality)}
        </div>

        {/* Tipo de Documento */}
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            id="documentType"
            value={formData.documentType || 'id'}
            onChange={(e) => updateField('documentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="id_card">Cédula</option>
            <option value="passport">Pasaporte</option>
            <option value="license">Licencia</option>
          </select>
        </div>

        {/* Número de Documento */}
        <div>
          <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento *
          </label>
          <input
            id="documentNumber"
            type="text"
            value={formData.documentNumber || ''}
            onChange={(e) => updateField('documentNumber', e.target.value)}
            className={getFieldClassName('documentNumber', formData.documentNumber)}
            required
          />
          {renderFieldValidation('documentNumber', formData.documentNumber)}
        </div>
      </div>
    </div>
  );
};
