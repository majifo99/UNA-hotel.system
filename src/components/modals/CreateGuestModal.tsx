import React, { useState } from 'react';
import { User, Save, X } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { Modal } from '../ui/Modal';
import { useGuests } from '../../hooks/useGuests';
import type { CreateGuestData, Guest } from '../../types/guest';

interface CreateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCreated: (guest: Guest) => void;
}

export const CreateGuestModal: React.FC<CreateGuestModalProps> = ({
  isOpen,
  onClose,
  onGuestCreated
}) => {
  const { createGuest, isCreating } = useGuests();
  const [formData, setFormData] = useState<CreateGuestData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'CR',
    documentType: 'id',
    documentNumber: ''
  });

  const [errors, setErrors] = useState<Partial<CreateGuestData>>({});

  const handleInputChange = (field: keyof CreateGuestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateGuestData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono es requerido';
    }
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Número de documento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const newGuest = await createGuest(formData);
      onGuestCreated(newGuest);
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: 'CR',
        documentType: 'id',
        documentNumber: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating guest:', error);
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
      title="Crear Nuevo Huésped"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <User size={24} className="text-blue-600" />
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.firstName}
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
              Apellido *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Pérez"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
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

        {/* Phone Input with Country Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <PhoneInput
            country={'cr'}
            value={formData.phone}
            onChange={(phone: string) => handleInputChange('phone', phone)}
            inputClass={`!w-full !py-2 !px-3 !text-base !border !rounded-lg !focus:ring-2 !focus:ring-blue-500 !focus:border-transparent ${
              errors.phone ? '!border-red-500' : '!border-gray-300'
            }`}
            containerClass="mt-1"
            buttonClass="!border !border-gray-300 !rounded-l-lg"
            dropdownClass="!z-50"
            searchClass="!px-3 !py-2 !border !border-gray-300 !rounded"
            placeholder="8888-9999"
            enableSearch
            searchPlaceholder="Buscar país..."
            preferredCountries={['cr', 'us', 'mx', 'ca', 'es', 'fr', 'de', 'it']}
            localization={{
              cr: 'Costa Rica',
              us: 'Estados Unidos',
              mx: 'México',
              ca: 'Canadá',
              es: 'España',
              fr: 'Francia',
              de: 'Alemania',
              it: 'Italia'
            }}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Nationality with Flag Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nacionalidad
          </label>
          <ReactFlagsSelect
            selected={formData.nationality}
            onSelect={(countryCode: string) => handleInputChange('nationality', countryCode)}
            placeholder="Selecciona tu nacionalidad"
            searchable
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="id">Cédula</option>
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
              value={formData.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.documentNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1-1234-5678"
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {isCreating ? 'Creando...' : 'Crear Huésped'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
