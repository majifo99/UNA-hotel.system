import React from 'react';
import { Star } from 'lucide-react';
import type { Guest } from '../../types';

interface AdditionalInfoStepProps {
  formData: Partial<Guest>;
  updateField: (field: string, value: any) => void;
}

export const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({
  formData,
  updateField
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <Star className="text-yellow-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Información Adicional</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            id="gender"
            value={formData.gender || ''}
            onChange={(e) => updateField('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
            <option value="prefer_not_to_say">Prefiero no decir</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="vipStatus"
            checked={formData.vipStatus || false}
            onChange={(e) => updateField('vipStatus', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="vipStatus" className="text-sm font-medium text-gray-700">
            Cliente VIP
          </label>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas del Personal
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Preferencias especiales, comportamiento, solicitudes frecuentes, etc."
        />
      </div>
    </div>
  );
};
