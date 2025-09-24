import { User } from 'lucide-react';
import { TextInput, SelectInput, TextAreaInput } from './FormInputs';
import { PhoneInputField, NationalitySelect } from './SpecializedInputs';
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../constants';
import type { CreateGuestData, UpdateGuestData } from '../../types';

type GuestFormData = CreateGuestData | UpdateGuestData;

interface GuestFormFieldsProps<T extends GuestFormData> {
  formData: T;
  errors: Partial<T>;
  onInputChange: (field: keyof T, value: any) => void;
  showVipStatus?: boolean;
}

export const GuestFormFields = <T extends GuestFormData>({
  formData,
  errors,
  onInputChange,
  showVipStatus = false
}: GuestFormFieldsProps<T>) => {
  return (
    <>
      {/* Header Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <User size={24} className="text-blue-600" />
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Nombre"
          value={formData.firstName || ''}
          onChange={(value) => onInputChange('firstName' as keyof T, value)}
          error={errors.firstName as string}
          required
          placeholder="Juan"
        />

        <TextInput
          label="Primer Apellido"
          value={formData.firstLastName || ''}
          onChange={(value) => onInputChange('firstLastName' as keyof T, value)}
          error={errors.firstLastName as string}
          required
          placeholder="Pérez"
        />

        <TextInput
          label="Segundo Apellido"
          value={formData.secondLastName || ''}
          onChange={(value) => onInputChange('secondLastName' as keyof T, value)}
          placeholder="González"
        />
      </div>

      {/* Contact Information */}
      <TextInput
        label="Email"
        type="email"
        value={formData.email || ''}
        onChange={(value) => onInputChange('email' as keyof T, value)}
        error={errors.email as string}
        required
        placeholder="juan.perez@email.com"
      />

      {/* Phone Input with Country Selector */}
      <PhoneInputField
        label="Teléfono"
        value={formData.phone || ''}
        onChange={(value) => onInputChange('phone' as keyof T, value)}
        error={errors.phone as string}
        required
      />

      {/* Nationality with Flag Selector */}
      <NationalitySelect
        label="Nacionalidad"
        value={formData.nationality || 'CR'}
        onChange={(value) => onInputChange('nationality' as keyof T, value)}
      />

      {/* Document Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput
          label="Tipo de Documento"
          value={formData.documentType || 'id_card'}
          onChange={(value) => onInputChange('documentType' as keyof T, value)}
          options={DOCUMENT_TYPE_OPTIONS}
        />

        <TextInput
          label="Número de Documento"
          value={formData.documentNumber || ''}
          onChange={(value) => onInputChange('documentNumber' as keyof T, value)}
          error={errors.documentNumber as string}
          required
          placeholder="1-1234-5678"
        />
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Fecha de Nacimiento"
          type="date"
          value={formData.dateOfBirth || ''}
          onChange={(value) => onInputChange('dateOfBirth' as keyof T, value)}
        />

        <SelectInput
          label="Género"
          value={formData.gender || ''}
          onChange={(value) => onInputChange('gender' as keyof T, value)}
          options={GENDER_OPTIONS}
        />
      </div>

      {/* VIP Status - Only show in edit mode */}
      {showVipStatus && 'vipStatus' in formData && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="vipStatus"
            checked={(formData as any).vipStatus || false}
            onChange={(e) => onInputChange('vipStatus' as keyof T, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="vipStatus" className="text-sm font-medium text-gray-700">
            Cliente VIP
          </label>
        </div>
      )}

      {/* Notes */}
      <TextAreaInput
        label="Notas"
        value={formData.notes || ''}
        onChange={(value) => onInputChange('notes' as keyof T, value)}
        placeholder="Cualquier información adicional sobre el huésped..."
      />
    </>
  );
};