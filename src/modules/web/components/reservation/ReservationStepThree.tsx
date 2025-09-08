/**
 * Reservation Step Three - Guest Information and Special Requests
 * 
 * Final step: collect guest information and special requests including extra amenities
 */

import { useState } from 'react';
import type { Room } from '../../../../types/core';

/**
 * Secure email validation function that avoids ReDoS vulnerabilities
 */
function isValidEmail(email: string): boolean {
  // Basic structure check without vulnerable regex
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Check local part (before @)
  if (!localPart || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  // Check domain part (after @)
  if (!domain || domain.length > 253) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (!domain.includes('.')) return false;
  
  // Simple character validation using safe regex
  const validLocalChars = /^[a-zA-Z0-9._%+-]+$/.test(localPart);
  const validDomainChars = /^[a-zA-Z0-9.-]+$/.test(domain);
  
  return validLocalChars && validDomainChars;
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
}

interface ReservationStepThreeProps {
  readonly reservationData: {
    readonly checkIn: string;
    readonly checkOut: string;
    readonly adults: number;
    readonly children: number;
    readonly selectedRoomIds: string[];
  };
  readonly selectedRooms: Room[];
  readonly onComplete: (data: { 
    guestInfo: GuestInfo; 
    specialRequests: string; 
    additionalAmenities: string[];
  }) => void;
  readonly onBack: () => void;
  readonly capacityWarning: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
}

export function ReservationStepThree({
  reservationData,
  selectedRooms,
  onComplete,
  onBack,
  capacityWarning
}: ReservationStepThreeProps) {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: ''
  });

  const [specialRequests, setSpecialRequests] = useState('');
  const [additionalAmenities, setAdditionalAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available additional amenities
  const amenityOptions = [
    { id: 'extra-bed', label: 'Cama extra', description: 'Cama plegable adicional' },
    { id: 'baby-crib', label: 'Cuna para bebé', description: 'Cuna estándar con ropa de cama' },
    { id: 'sofa-bed', label: 'Sofá cama', description: 'Convertir sofá en cama adicional' },
    { id: 'extra-pillows', label: 'Almohadas extra', description: 'Almohadas y mantas adicionales' },
    { id: 'late-checkin', label: 'Check-in tardío', description: 'Llegada después de 10 PM' },
    { id: 'early-checkout', label: 'Check-out temprano', description: 'Salida antes de 7 AM' },
    { id: 'room-decoration', label: 'Decoración especial', description: 'Para celebraciones o eventos' },
    { id: 'dietary-requirements', label: 'Requerimientos dietéticos', description: 'Alergias o preferencias alimentarias' },
    { id: 'accessibility', label: 'Accesibilidad', description: 'Necesidades especiales de acceso' },
    { id: 'pet-accommodation', label: 'Acomodación para mascotas', description: 'Preparación para huéspedes con mascotas' }
  ];

  const calculateNights = (): number => {
    const checkIn = new Date(reservationData.checkIn);
    const checkOut = new Date(reservationData.checkOut);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    return selectedRooms.reduce((total, room) => total + room.pricePerNight, 0) * nights;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!guestInfo.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!guestInfo.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    }

    if (!guestInfo.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(guestInfo.email)) {
      newErrors.email = 'Ingrese un email válido';
    }

    if (!guestInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{8,}$/.test(guestInfo.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Ingrese un número de teléfono válido (mínimo 8 dígitos)';
    }

    if (!guestInfo.nationalId.trim()) {
      newErrors.nationalId = 'La identificación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      onComplete({
        guestInfo,
        specialRequests,
        additionalAmenities
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateGuestInfo = (field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setAdditionalAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información personal y solicitudes</h2>
        <p className="text-gray-600">Último paso para completar su reserva</p>
      </div>

      {/* Reservation Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de su reserva</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Fechas:</strong> {reservationData.checkIn} - {reservationData.checkOut}</p>
            <p><strong>Noches:</strong> {calculateNights()}</p>
            <p><strong>Huéspedes:</strong> {reservationData.adults + reservationData.children} ({reservationData.adults} adultos, {reservationData.children} niños)</p>
          </div>
          <div>
            <p><strong>Habitaciones:</strong></p>
            {selectedRooms.map(room => (
              <p key={room.id} className="ml-2">• {room.name} - {formatPrice(room.pricePerNight)}/noche</p>
            ))}
            <p className="font-semibold mt-2">Total: {formatPrice(calculateTotalPrice())}</p>
          </div>
        </div>

        {/* Capacity Warning in Summary */}
        {capacityWarning && (
          <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded text-sm">
            <p className="text-orange-800">
              <strong>Nota:</strong> Recuerde seleccionar las acomodaciones especiales necesarias para todos sus huéspedes.
            </p>
          </div>
        )}
      </div>

      {/* Guest Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Información del huésped principal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              value={guestInfo.firstName}
              onChange={(e) => updateGuestInfo('firstName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                errors.firstName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="Su nombre"
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              id="lastName"
              value={guestInfo.lastName}
              onChange={(e) => updateGuestInfo('lastName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                errors.lastName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="Sus apellidos"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={guestInfo.email}
              onChange={(e) => updateGuestInfo('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              value={guestInfo.phone}
              onChange={(e) => updateGuestInfo('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                errors.phone 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="8888-8888"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
              Número de identificación *
            </label>
            <input
              type="text"
              id="nationalId"
              value={guestInfo.nationalId}
              onChange={(e) => updateGuestInfo('nationalId', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                errors.nationalId 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="Cédula, pasaporte u otro documento de identificación"
            />
            {errors.nationalId && <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>}
          </div>
        </div>
      </div>

      {/* Additional Amenities */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Servicios y acomodaciones adicionales</h3>
          <p className="text-gray-600 text-sm mb-4">
            Seleccione los servicios adicionales que necesite. Los servicios seleccionados se coordinarán con el hotel.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenityOptions.map(option => (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={additionalAmenities.includes(option.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all text-left w-full ${
                additionalAmenities.includes(option.id)
                  ? 'border-current bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ borderColor: additionalAmenities.includes(option.id) ? 'var(--color-darkGreen1)' : undefined }}
              onClick={() => toggleAmenity(option.id)}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 border rounded mt-0.5 mr-3 flex items-center justify-center ${
                  additionalAmenities.includes(option.id)
                    ? 'text-white'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: additionalAmenities.includes(option.id) ? 'var(--color-darkGreen1)' : undefined }}
                >
                  {additionalAmenities.includes(option.id) && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Solicitudes especiales</h3>
        <p className="text-gray-600 text-sm">
          Escriba cualquier solicitud especial o información adicional que consideremos para su estadía.
        </p>
        
        {capacityWarning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-medium mb-2">💡 Sugerencias para solicitudes especiales:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• "Necesitamos acomodación para {reservationData.adults + reservationData.children} personas en las habitaciones seleccionadas"</li>
              <li>• "Por favor preparar camas adicionales o sofás cama"</li>
              <li>• "Requerimos cunas para niños pequeños"</li>
              <li>• "Preferimos habitaciones cercanas entre sí"</li>
            </ul>
          </div>
        )}

        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Ej: Necesitamos camas adicionales para acomodar a todos los huéspedes, preferimos habitaciones en el mismo piso, celebramos aniversario..."
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Volver a Habitaciones
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 font-semibold rounded-lg transition-opacity text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-darkGreen1)' }}
        >
          {isSubmitting ? 'Creando Reserva...' : 'Confirmar Reserva'}
        </button>
      </div>
    </form>
  );
}
