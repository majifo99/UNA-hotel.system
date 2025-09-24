import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { useGuests } from '../../hooks';
import type { Guest, UpdateGuestData } from '../../types';
import ReactFlagsSelect from 'react-flags-select';
import PhoneInput from 'react-phone-input-2';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onGuestUpdated: (guest: Guest) => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onGuestUpdated
}) => {
  const { updateGuest, isUpdating } = useGuests();
  const [formData, setFormData] = useState<UpdateGuestData>({
    id: '',
    firstName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    nationality: 'CR',
    documentType: 'id_card',
    documentNumber: '',
    dateOfBirth: '',
    gender: undefined,
    notes: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Partial<UpdateGuestData>>({});

  // Cargar datos del huésped cuando se abre el modal
  useEffect(() => {
    if (guest) {
      setFormData({
        id: guest.id,
        firstName: guest.firstName,
        firstLastName: guest.firstLastName,
        secondLastName: guest.secondLastName,
        email: guest.email,
        phone: guest.phone,
        nationality: guest.nationality,
        documentType: guest.documentType,
        documentNumber: guest.documentNumber,
        dateOfBirth: guest.dateOfBirth,
        gender: guest.gender,
        notes: guest.notes,
        isActive: guest.isActive,
        // Campos adicionales
        address: guest.address,
        city: guest.city,
        country: guest.country,
        preferredLanguage: guest.preferredLanguage,
        vipStatus: guest.vipStatus,
        allergies: guest.allergies,
        dietaryRestrictions: guest.dietaryRestrictions,
        medicalNotes: guest.medicalNotes,
        emergencyContact: guest.emergencyContact,
        communicationPreferences: guest.communicationPreferences,
        roomPreferences: guest.roomPreferences,
        loyaltyProgram: guest.loyaltyProgram
      });
    }
  }, [guest]);

  const handleInputChange = (field: keyof UpdateGuestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateGuestData> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }
    if (!formData.firstLastName?.trim()) {
      newErrors.firstLastName = 'Primer apellido es requerido';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Teléfono es requerido';
    }
    if (!formData.documentNumber?.trim()) {
      newErrors.documentNumber = 'Número de documento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !guest) return;

    try {
      const updatedGuest = await updateGuest(guest.id, formData);
      onGuestUpdated(updatedGuest);
      onClose();
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Huésped"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header Icon */}
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-blue-100 rounded-full">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primer Apellido *
            </label>
            <input
              type="text"
              value={formData.firstLastName || ''}
              onChange={(e) => handleInputChange('firstLastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstLastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Pérez"
            />
            {errors.firstLastName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstLastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Apellido
            </label>
            <input
              type="text"
              value={formData.secondLastName || ''}
              onChange={(e) => handleInputChange('secondLastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="González"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="juan.perez@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <PhoneInput
              country='cr'
              value={formData.phone || ''}
              onChange={(phone) => handleInputChange('phone', phone)}
              inputProps={{
                name: 'phone',
                required: true,
              }}
              inputClass={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              containerClass="w-full"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nacionalidad *
          </label>
          <ReactFlagsSelect
            selected={formData.nationality || 'CR'}
            onSelect={(code) => handleInputChange('nationality', code)}
            className="w-full"
            selectButtonClassName="react-flags-select-button w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
            placeholder="Seleccionar país"
            customLabels={{
              CR: 'Costa Rica',
              US: 'Estados Unidos',
              MX: 'México',
              CA: 'Canadá',
              ES: 'España',
              FR: 'Francia',
              DE: 'Alemania',
              IT: 'Italia',
              BR: 'Brasil',
              AR: 'Argentina',
              CL: 'Chile',
              CO: 'Colombia',
              PE: 'Perú',
              VE: 'Venezuela',
              EC: 'Ecuador',
              BO: 'Bolivia',
              PY: 'Paraguay',
              UY: 'Uruguay',
              PA: 'Panamá',
              GT: 'Guatemala',
              HN: 'Honduras',
              SV: 'El Salvador',
              NI: 'Nicaragua',
              BZ: 'Belice',
              DO: 'República Dominicana',
              CU: 'Cuba',
              JM: 'Jamaica'
            }}
          />
        </div>

        {/* Document Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={formData.documentType || 'id_card'}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="id_card">Cédula</option>
              <option value="passport">Pasaporte</option>
              <option value="license">Licencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              value={formData.documentNumber || ''}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.documentNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123456789"
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={formData.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer_not_to_say">Prefiero no decir</option>
            </select>
          </div>
        </div>

        {/* VIP Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="vipStatus"
            checked={formData.vipStatus || false}
            onChange={(e) => handleInputChange('vipStatus', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="vipStatus" className="text-sm font-medium text-gray-700">
            Cliente VIP
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Cualquier información adicional sobre el huésped..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};