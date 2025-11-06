import React from 'react';
import { User } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import ReactFlagsSelect from 'react-flags-select';
import { ValidatedTextInput, getValidationClassName, ValidationIndicator } from '../shared/ValidatedInputs';
import { COUNTRY_LABELS, DOCUMENT_TYPE_OPTIONS } from '../../constants';
import { getValidationState } from '../../utils';
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
        <ValidatedTextInput
          id="firstName"
          label="Nombre"
          value={formData.firstName || ''}
          onChange={(value) => updateField('firstName', value)}
          validationState={getValidationState(formData.firstName, validationErrors, 'firstName')}
          error={validationErrors.firstName}
          required
        />

        {/* Apellido Uno */}
        <ValidatedTextInput
          id="firstLastName"
          label="Apellido Uno"
          value={formData.firstLastName || ''}
          onChange={(value) => updateField('firstLastName', value)}
          validationState={getValidationState(formData.firstLastName, validationErrors, 'firstLastName')}
          error={validationErrors.firstLastName}
          required
        />

        {/* Apellido Dos */}
        <ValidatedTextInput
          id="secondLastName"
          label="Apellido Dos"
          value={formData.secondLastName || ''}
          onChange={(value) => updateField('secondLastName', value)}
          validationState={getValidationState(formData.secondLastName, validationErrors, 'secondLastName')}
          error={validationErrors.secondLastName}
        />

        {/* Email */}
        <ValidatedTextInput
          id="email"
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(value) => updateField('email', value)}
          validationState={getValidationState(formData.email, validationErrors, 'email')}
          error={validationErrors.email}
          required
        />

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
            inputClass={getValidationClassName(
              getValidationState(formData.phone, validationErrors, 'phone'),
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
            )}
            containerClass="w-full"
            buttonClass="!border-gray-300 !rounded-l-lg"
          />
          <ValidationIndicator 
            state={getValidationState(formData.phone, validationErrors, 'phone')}
            error={validationErrors.phone}
          />
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
            selectButtonClassName={getValidationClassName(
              getValidationState(formData.nationality, validationErrors, 'nationality'),
              'react-flags-select-button w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-colors'
            )}
            aria-labelledby="nationality-label"
            aria-required="true"
            placeholder="Seleccionar país"
            customLabels={COUNTRY_LABELS}
          />
          <ValidationIndicator 
            state={getValidationState(formData.nationality, validationErrors, 'nationality')}
            error={validationErrors.nationality}
          />
        </div>

        {/* Tipo de Documento */}
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            id="documentType"
            value={formData.documentType || 'id_card'}
            onChange={(e) => updateField('documentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número de Documento */}
        <ValidatedTextInput
          id="documentNumber"
          label="Número de Documento"
          value={formData.documentNumber || ''}
          onChange={(value) => updateField('documentNumber', value)}
          validationState={getValidationState(formData.documentNumber, validationErrors, 'documentNumber')}
          error={validationErrors.documentNumber}
          required
        />
      </div>
    </div>
  );
};
