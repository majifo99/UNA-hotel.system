import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Heart, Phone, Star } from 'lucide-react';
import type { Guest } from '../types';

export const CreateGuestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Guest>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    documentType: 'id_card',
    documentNumber: '',
    dateOfBirth: '',
    gender: undefined,
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    allergies: [],
    medicalNotes: '',
    dietaryRestrictions: [],
    preferredLanguage: 'es',
    communicationPreferences: {
      email: true,
      sms: false,
      phone: false,
      whatsapp: false,
    },
    roomPreferences: {
      floor: undefined,
      view: undefined,
      bedType: undefined,
      smokingAllowed: false,
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    notes: '',
    vipStatus: false,
    loyaltyProgram: {
      memberId: '',
      tier: undefined,
      points: 0,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí iría la lógica para crear el huésped
      console.log('Creating guest:', formData);
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la lista de huéspedes
      navigate('/guests');
    } catch (error) {
      console.error('Error creating guest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const toggleArrayField = (field: 'allergies' | 'dietaryRestrictions', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      {/* Header con breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigate('/guests')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Huéspedes
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Crear Nuevo</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Huésped</h1>
            <p className="text-gray-600 mt-2">
              Complete la información del huésped. Los campos marcados con * son obligatorios.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+506 8888-8888"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <select
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad *
              </label>
              <input
                type="text"
                value={formData.nationality || ''}
                onChange={(e) => updateField('nationality', e.target.value)}
                placeholder="Costa Rica"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                value={formData.documentType || 'id'}
                onChange={(e) => updateField('documentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="id">Cédula</option>
                <option value="passport">Pasaporte</option>
                <option value="license">Licencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento *
              </label>
              <input
                type="text"
                value={formData.documentNumber || ''}
                onChange={(e) => updateField('documentNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Información Médica */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Médica y Alergias</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Alergias Comunes
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Nueces', 'Mariscos', 'Lácteos', 'Gluten', 'Huevos', 'Soja', 'Pescado', 'Abejas'].map((allergy) => (
                  <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.allergies || []).includes(allergy)}
                      onChange={() => toggleArrayField('allergies', allergy)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{allergy}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restricciones Dietéticas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Vegetariano', 'Vegano', 'Sin Gluten', 'Kosher', 'Halal', 'Sin Azúcar'].map((diet) => (
                  <label key={diet} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.dietaryRestrictions || []).includes(diet)}
                      onChange={() => toggleArrayField('dietaryRestrictions', diet)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{diet}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Médicas Adicionales
              </label>
              <textarea
                value={formData.medicalNotes || ''}
                onChange={(e) => updateField('medicalNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cualquier condición médica, medicamentos, o información relevante..."
              />
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Phone className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Contacto
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relación
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
                placeholder="Ej: Esposo/a, Padre/Madre, Hermano/a"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de Emergencia
              </label>
              <input
                type="tel"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Emergencia
              </label>
              <input
                type="email"
                value={formData.emergencyContact?.email || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="text-yellow-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Adicional</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Personal
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Preferencias especiales, comportamiento, solicitudes frecuentes, etc."
              />
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
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/guests')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Crear Huésped
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
