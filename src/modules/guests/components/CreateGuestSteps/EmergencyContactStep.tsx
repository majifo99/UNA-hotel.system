import React from 'react';
import { Shield } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import type { Guest } from '../../types';

interface EmergencyContactStepProps {
  formData: Partial<Guest>;
  updateNestedField: (parent: string, field: string, value: any) => void;
}

export const EmergencyContactStep: React.FC<EmergencyContactStepProps> = ({
  formData,
  updateNestedField
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Shield className="text-orange-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Contacto
          </label>
          <input
            type="text"
            id="emergencyContactName"
            value={formData.emergencyContact?.name || ''}
            onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-2">
            Relación
          </label>
          <input
            type="text"
            id="emergencyContactRelationship"
            value={formData.emergencyContact?.relationship || ''}
            onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
            placeholder="Ej: Esposo/a, Padre/Madre, Hermano/a"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono de Emergencia
          </label>
          <PhoneInput
            country='cr'
            value={formData.emergencyContact?.phone || ''}
            onChange={(phone) => updateNestedField('emergencyContact', 'phone', phone)}
            inputProps={{
              name: 'emergencyPhone',
              id: 'emergencyContactPhone',
            }}
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            containerClass="w-full"
            buttonClass="!border-gray-300 !rounded-l-lg"
          />
        </div>

        <div>
          <label htmlFor="emergencyContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email de Emergencia
          </label>
          <input
            type="email"
            id="emergencyContactEmail"
            value={formData.emergencyContact?.email || ''}
            onChange={(e) => updateNestedField('emergencyContact', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};
