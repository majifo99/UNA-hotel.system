import React from 'react';
import { Heart, Eye, EyeOff } from 'lucide-react';
import type { Guest } from '../../types';

interface MedicalInfoStepProps {
  formData: Partial<Guest>;
  showMedicalSection: boolean;
  setShowMedicalSection: (show: boolean) => void;
  updateField: (field: string, value: any) => void;
  toggleArrayField: (field: 'allergies' | 'dietaryRestrictions', value: string) => void;
}

export const MedicalInfoStep: React.FC<MedicalInfoStepProps> = ({
  formData,
  showMedicalSection,
  setShowMedicalSection,
  updateField,
  toggleArrayField
}) => {
  const allergies = ['Nueces', 'Mariscos', 'Lácteos', 'Gluten', 'Huevos', 'Soja', 'Pescado', 'Abejas'];
  const dietaryRestrictions = ['Vegetariano', 'Vegano', 'Sin Gluten', 'Kosher', 'Halal', 'Sin Azúcar'];

  const renderCheckboxGroup = (
    items: string[], 
    field: 'allergies' | 'dietaryRestrictions', 
    title: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {title}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(formData[field] || []).includes(item)}
              onChange={() => toggleArrayField(field, item)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderCollapsedView = () => (
    <div className="text-center py-8 text-gray-500">
      <Heart size={48} className="mx-auto mb-4 opacity-50" />
      <p>Información médica opcional</p>
      <p className="text-sm">Haga clic en "Mostrar detalles" para completar esta sección</p>
    </div>
  );

  const renderExpandedView = () => (
    <div className="space-y-6">
      {renderCheckboxGroup(allergies, 'allergies', 'Alergias Comunes')}
      {renderCheckboxGroup(dietaryRestrictions, 'dietaryRestrictions', 'Restricciones Dietéticas')}

      <div>
        <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas Médicas Adicionales
        </label>
        <textarea
          id="medicalNotes"
          value={formData.medicalNotes || ''}
          onChange={(e) => updateField('medicalNotes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Cualquier condición médica, medicamentos, o información relevante..."
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-50 rounded-lg">
          <Heart className="text-red-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Información Médica (Opcional)</h2>
        <button
          type="button"
          onClick={() => setShowMedicalSection(!showMedicalSection)}
          className="ml-auto flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          {showMedicalSection ? <EyeOff size={16} /> : <Eye size={16} />}
          {showMedicalSection ? 'Ocultar' : 'Mostrar'} detalles
        </button>
      </div>

      {showMedicalSection ? renderExpandedView() : renderCollapsedView()}
    </div>
  );
};
