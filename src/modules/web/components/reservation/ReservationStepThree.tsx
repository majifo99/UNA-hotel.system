/**
 * Reservation Step Three - Special Requests and Services
 * 
 * Final step: collect special requests and select additional services.
 * Guest information is auto-filled from authenticated user.
 */

import React, { useState, useEffect } from 'react';
import type { Room } from '../../../../types/core';
import type { AuthUser } from '../../types/auth';
import { useAdditionalServices } from '../../../reservations/hooks/useReservationQueries';
import { formatCurrency } from '../../utils/currency';

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
    readonly babies: number;
    readonly selectedRoomIds: string[];
  };
  readonly selectedRooms: Room[];
  readonly authenticatedUser: AuthUser; // User from auth context
  readonly onComplete: (data: { 
    guestInfo: GuestInfo; 
    specialRequests: string; 
    selectedServices: Array<{ id_servicio: number; cantidad: number; }>;
  }) => void;
  readonly onBack: () => void;
  readonly capacityWarning: string;
  readonly isSubmitting?: boolean; // External loading state
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
  authenticatedUser,
  onComplete,
  onBack,
  capacityWarning,
  isSubmitting: externalIsSubmitting
}: ReservationStepThreeProps) {
  // Initialize guest info from authenticated user
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: authenticatedUser.firstName,
    lastName: authenticatedUser.lastName,
    email: authenticatedUser.email,
    phone: authenticatedUser.phone || '',
    nationalId: '' // This might not be in AuthUser, keep editable
  });

  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use external loading state if provided
  const isLoading = externalIsSubmitting ?? isSubmitting;

  // Load additional services from API
  const { data: additionalServices = [], isLoading: isLoadingServices } = useAdditionalServices();

  // Update guest info when authenticated user changes
  useEffect(() => {
    setGuestInfo(prev => ({
      ...prev,
      firstName: authenticatedUser.firstName,
      lastName: authenticatedUser.lastName,
      email: authenticatedUser.email,
      phone: authenticatedUser.phone || prev.phone,
    }));
  }, [authenticatedUser]);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name, lastName, and email are readonly from authenticated user, no need to validate

    // Only validate phone if it's editable
    if (guestInfo.phone && guestInfo.phone.trim()) {
      const phoneDigits = guestInfo.phone.replaceAll(/[\s-]/g, '');
      if (!/^\d{8,}$/.test(phoneDigits)) {
        newErrors.phone = 'Ingrese un número de teléfono válido (mínimo 8 dígitos)';
      }
    }

    // National ID is optional for web reservations (user might not have it in profile)
    // Remove validation to allow submission without it

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
      // Convert Map to array of service selections
      const selectedServicesArray = Array.from(selectedServices.entries()).map(([serviceId, quantity]) => ({
        id_servicio: Number(serviceId),
        cantidad: quantity
      }));
      
      onComplete({
        guestInfo,
        specialRequests,
        selectedServices: selectedServicesArray
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

  const toggleService = (serviceId: string, quantity: number = 1) => {
    setSelectedServices(prev => {
      const newMap = new Map(prev);
      if (newMap.has(serviceId)) {
        newMap.delete(serviceId);
      } else {
        newMap.set(serviceId, quantity);
      }
      return newMap;
    });
  };
  
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) {
      setSelectedServices(prev => {
        const newMap = new Map(prev);
        newMap.delete(serviceId);
        return newMap;
      });
    } else {
      setSelectedServices(prev => {
        const newMap = new Map(prev);
        newMap.set(serviceId, quantity);
        return newMap;
      });
    }
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
            <p><strong>Huéspedes:</strong> {reservationData.adults + reservationData.children + reservationData.babies} (
              {reservationData.adults} adulto{reservationData.adults !== 1 ? 's' : ''}
              {reservationData.children > 0 && `, ${reservationData.children} niño${reservationData.children !== 1 ? 's' : ''}`}
              {reservationData.babies > 0 && `, ${reservationData.babies} bebé${reservationData.babies !== 1 ? 's' : ''}`}
            )</p>
          </div>
          <div>
            <p><strong>Habitaciones:</strong></p>
            {selectedRooms.map(room => (
              <p key={room.id} className="ml-2">• {room.name} - {formatCurrency(room.pricePerNight)}/noche</p>
            ))}
            <p className="font-semibold mt-2">Total: {formatCurrency(calculateTotalPrice())}</p>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Información del huésped principal</h3>
          <span className="text-sm text-gray-500 italic">Información de su cuenta</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              value={guestInfo.firstName}
              readOnly
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Su nombre"
            />
            <p className="mt-1 text-xs text-gray-500">Tomado de su perfil</p>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              id="lastName"
              value={guestInfo.lastName}
              readOnly
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Sus apellidos"
            />
            <p className="mt-1 text-xs text-gray-500">Tomado de su perfil</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={guestInfo.email}
              readOnly
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="correo@ejemplo.com"
            />
            <p className="mt-1 text-xs text-gray-500">Tomado de su perfil</p>
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

      {/* Additional Services */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Servicios adicionales</h3>
          <p className="text-gray-600 text-sm mb-4">
            Seleccione los servicios adicionales que desee incluir en su reserva. Los precios se agregan al total.
          </p>
        </div>
        
        {isLoadingServices && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--color-darkGreen1)' }}></div>
            <p className="text-gray-600 mt-4">Cargando servicios...</p>
          </div>
        )}
        
        {!isLoadingServices && additionalServices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay servicios adicionales disponibles en este momento.</p>
          </div>
        )}
        
        {!isLoadingServices && additionalServices.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {additionalServices.filter(service => service.isActive).map(service => {
              const isSelected = selectedServices.has(service.id);
              const quantity = selectedServices.get(service.id) || 1;
              
              return (
                <div
                  key={service.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'bg-green-50'
                      : 'border-gray-200'
                  }`}
                  style={{ borderColor: isSelected ? 'var(--color-darkGreen1)' : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <button
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className={`w-5 h-5 border rounded mt-0.5 mr-3 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'text-white'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: isSelected ? 'var(--color-darkGreen1)' : undefined }}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <span className="text-sm font-semibold ml-4" style={{ color: 'var(--color-darkGreen1)' }}>
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        {service.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            {service.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="ml-4 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateServiceQuantity(service.id, quantity - 1)}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateServiceQuantity(service.id, quantity + 1)}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && quantity > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                      <span className="text-sm text-gray-600">Subtotal: </span>
                      <span className="font-semibold" style={{ color: 'var(--color-darkGreen1)' }}>
                        {formatCurrency(service.price * quantity)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {selectedServices.size > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total servicios adicionales:</span>
              <span className="text-lg font-bold" style={{ color: 'var(--color-darkGreen1)' }}>
                {formatCurrency(Array.from(selectedServices.entries()).reduce((total, [serviceId, qty]) => {
                  const service = additionalServices.find(s => s.id === serviceId);
                  return total + (service ? service.price * qty : 0);
                }, 0))}
              </span>
            </div>
          </div>
        )}
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
              <li>• "Necesitamos acomodación para {reservationData.adults + reservationData.children + reservationData.babies} personas en las habitaciones seleccionadas"</li>
              <li>• "Por favor preparar camas adicionales o sofás cama"</li>
              {reservationData.babies > 0 && <li>• "Requerimos {reservationData.babies} cuna{reservationData.babies !== 1 ? 's' : ''} para bebés"</li>}
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
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Volver a Habitaciones
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 font-semibold rounded-lg transition-opacity text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--color-darkGreen1)' }}
        >
          {isLoading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading ? 'Creando Reserva...' : 'Confirmar Reserva'}
        </button>
      </div>
    </form>
  );
}
