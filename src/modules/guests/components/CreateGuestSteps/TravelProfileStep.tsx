import React from 'react';
import { Users } from 'lucide-react';
import type { Guest } from '../../types';

interface TravelProfileStepProps {
  formData: Partial<Guest> & { 
    companions?: { 
      typicalTravelGroup?: 'solo' | 'couple' | 'family' | 'business_group' | 'friends';
      hasChildren?: boolean;
      childrenAgeRanges?: ('0-2' | '3-7' | '8-12' | '13-17')[];
      preferredOccupancy?: number;
      needsConnectedRooms?: boolean;
    } 
  };
  updateNestedField: (parent: string, field: string, value: any) => void;
}

export const TravelProfileStep: React.FC<TravelProfileStepProps> = ({
  formData,
  updateNestedField
}) => {
  const ageRangeOptions = [
    { value: '0-2' as const, label: 'Bebés (0-2 años)' },
    { value: '3-7' as const, label: 'Niños pequeños (3-7)' },
    { value: '8-12' as const, label: 'Niños (8-12)' },
    { value: '13-17' as const, label: 'Adolescentes (13-17)' }
  ];

  const handleChildrenAgeRangeChange = (rangeValue: '0-2' | '3-7' | '8-12' | '13-17') => {
    const current = formData.companions?.childrenAgeRanges || [];
    const updated = current.includes(rangeValue)
      ? current.filter(r => r !== rangeValue)
      : [...current, rangeValue];
    updateNestedField('companions', 'childrenAgeRanges', updated);
  };

  const handleHasChildrenChange = (hasChildren: boolean) => {
    updateNestedField('companions', 'hasChildren', hasChildren);
    if (!hasChildren) {
      updateNestedField('companions', 'childrenAgeRanges', []);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Perfil de Viaje</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Información general para futuras reservas
        </span>
      </div>

      <div className="space-y-6">
        {/* Tipo de Viajero */}
        <div>
          <label htmlFor="typicalTravelGroup" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Viajero Típico
          </label>
          <select
            id="typicalTravelGroup"
            value={formData.companions?.typicalTravelGroup || ''}
            onChange={(e) => updateNestedField('companions', 'typicalTravelGroup', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar</option>
            <option value="solo">Viajero solo</option>
            <option value="couple">En pareja</option>
            <option value="family">Familia con niños</option>
            <option value="business_group">Grupo de negocios</option>
            <option value="friends">Grupo de amigos</option>
          </select>
        </div>

        {/* Información sobre niños */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="hasChildren"
                checked={formData.companions?.hasChildren || false}
                onChange={(e) => handleHasChildrenChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="hasChildren" className="text-sm font-medium text-gray-700">
                Viaja habitualmente con niños
              </label>
              <p className="text-xs text-gray-500">
                Nos ayuda a preparar amenidades apropiadas
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="preferredOccupancy" className="block text-sm font-medium text-gray-700 mb-2">
              Ocupación Típica
            </label>
            <input
              id="preferredOccupancy"
              type="number"
              min="1"
              max="10"
              value={formData.companions?.preferredOccupancy || 1}
              onChange={(e) => updateNestedField('companions', 'preferredOccupancy', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Número usual de personas que viajan juntas</p>
          </div>
        </div>

        {/* Rangos de edad de niños */}
        {formData.companions?.hasChildren && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rangos de Edad de los Niños (típicamente)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ageRangeOptions.map((range) => (
                <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.companions?.childrenAgeRanges || []).includes(range.value)}
                    onChange={() => handleChildrenAgeRangeChange(range.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Esto nos ayuda a tener cunas, camas extra, y amenidades apropiadas disponibles
            </p>
          </div>
        )}

        {/* Preferencias de habitación familiar */}
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="needsConnectedRooms"
              checked={formData.companions?.needsConnectedRooms || false}
              onChange={(e) => updateNestedField('companions', 'needsConnectedRooms', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="needsConnectedRooms" className="text-sm font-medium text-gray-700">
              Prefiere habitaciones conectadas o adyacentes
            </label>
            <p className="text-xs text-gray-500">
              Para familias grandes o grupos que viajan juntos
            </p>
          </div>
        </div>

        {/* Información para futuras reservas */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Perfil de Viaje</h3>
              <p className="text-sm text-blue-700 mt-1">
                Esta información se usa como referencia para futuras reservas y nos ayuda a:
              </p>
              <ul className="text-xs text-blue-600 mt-2 space-y-1">
                <li>• Sugerir el tipo de habitación más apropiado</li>
                <li>• Preparar amenidades relevantes con anticipación</li>
                <li>• Personalizar ofertas y promociones</li>
                <li>• Facilitar el proceso de reserva</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
