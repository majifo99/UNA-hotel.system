import React from 'react';
import { Bed, Home } from 'lucide-react';
import type { Guest } from '../../types';

interface RoomPreferencesStepProps {
  formData: Partial<Guest>;
  updateNestedField: (parent: string, field: string, value: any) => void;
}

export const RoomPreferencesStep: React.FC<RoomPreferencesStepProps> = ({
  formData,
  updateNestedField
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Bed className="text-purple-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Preferencias de Habitación</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Cama */}
        <div>
          <label htmlFor="bedType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cama Preferida
          </label>
          <select
            id="bedType"
            value={formData.roomPreferences?.bedType || ''}
            onChange={(e) => updateNestedField('roomPreferences', 'bedType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sin preferencia</option>
            <option value="single">Individual</option>
            <option value="double">Matrimonial</option>
            <option value="queen">Queen</option>
            <option value="king">King</option>
            <option value="twin">Dos camas individuales</option>
          </select>
        </div>

        {/* Piso Preferido */}
        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
            Piso Preferido
          </label>
          <select
            id="floor"
            value={formData.roomPreferences?.floor || ''}
            onChange={(e) => updateNestedField('roomPreferences', 'floor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sin preferencia</option>
            <option value="low">Piso bajo (1-3)</option>
            <option value="middle">Piso medio (4-7)</option>
            <option value="high">Piso alto (8+)</option>
          </select>
        </div>

        {/* Vista Preferida */}
        <div>
          <label htmlFor="view" className="block text-sm font-medium text-gray-700 mb-2">
            Vista Preferida
          </label>
          <select
            id="view"
            value={formData.roomPreferences?.view || ''}
            onChange={(e) => updateNestedField('roomPreferences', 'view', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sin preferencia</option>
            <option value="ocean">Vista al mar</option>
            <option value="mountain">Vista a la montaña</option>
            <option value="city">Vista a la ciudad</option>
            <option value="garden">Vista al jardín</option>
          </select>
        </div>

        {/* Habitación para Fumadores */}
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="smokingAllowed"
              checked={formData.roomPreferences?.smokingAllowed || false}
              onChange={(e) => updateNestedField('roomPreferences', 'smokingAllowed', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="smokingAllowed" className="text-sm font-medium text-gray-700">
              Habitación para fumadores
            </label>
            <p className="text-xs text-gray-500">
              Marque si prefiere una habitación donde se permita fumar
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional sobre preferencias */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Home className="text-purple-600 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-medium text-purple-900">Sobre las preferencias de habitación</h3>
            <p className="text-sm text-purple-700 mt-1">
              Estas preferencias nos ayudan a asignarle la mejor habitación disponible. 
              Sin embargo, están sujetas a disponibilidad al momento del check-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
