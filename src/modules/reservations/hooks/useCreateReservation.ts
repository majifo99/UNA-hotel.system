import { useState, useEffect, useCallback } from 'react';
import type { 
  SimpleReservationFormData, 
  ReservationValidationErrors 
} from '../types';
import type { Room } from '../../../types/core';
import type { AdditionalService } from '../../../types/core/domain';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';
import {
  parseGuestCount,
  validateGuest,
  validateBasicDates,
  validateDateLogic,
  validateGuestCapacity,
  validateRoomAvailability,
  calculateNights,
  calculatePricing,
  validateDateField,
  validateGuestCount,
} from './useReservationFormLogic';

export const useCreateReservation = () => {
  const [formData, setFormData] = useState<SimpleReservationFormData>({
    guestId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfAdults: 1,
    numberOfChildren: 0,
    numberOfInfants: 0,
    numberOfGuests: 1,
    numberOfNights: 0,
    roomType: 'single',
    additionalServices: [],
    subtotal: 0,
    servicesTotal: 0,
    taxes: 0,
    total: 0,
    depositRequired: 0,
  });

  const [errors, setErrors] = useState<ReservationValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);

  useEffect(() => {
    const totalGuests = (formData.numberOfAdults || 0) + (formData.numberOfChildren || 0) + (formData.numberOfInfants || 0);
    if (totalGuests !== formData.numberOfGuests) {
      setFormData(prev => ({ ...prev, numberOfGuests: totalGuests }));
    }
  }, [formData.numberOfAdults, formData.numberOfChildren, formData.numberOfInfants, formData.numberOfGuests]);

  // Calculate nights when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
      if (nights !== formData.numberOfNights) {
        setFormData(prev => ({ ...prev, numberOfNights: nights }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.numberOfNights]);

  const searchAvailableRooms = useCallback(async () => {
    try {
      const rooms = await roomService.getAvailableRooms(
        formData.checkInDate,
        formData.checkOutDate
      );
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error searching rooms:', error);
      setAvailableRooms([]);
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const calculatePricingEffect = useCallback(() => {
    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (!selectedRoom) return;

    const roomPrice = selectedRoom.pricePerNight || selectedRoom.basePrice || 0;
    const servicesTotal = additionalServices
      .filter(service => formData.additionalServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);

    const pricing = calculatePricing(roomPrice, formData.numberOfNights, servicesTotal);

    setFormData((prev: SimpleReservationFormData) => ({
      ...prev,
      subtotal: pricing.subtotal,
      servicesTotal,
      taxes: pricing.taxes,
      total: pricing.total,
      depositRequired: pricing.depositRequired,
    }));
  }, [formData.roomType, formData.numberOfNights, formData.additionalServices, availableRooms, additionalServices]);

  // Search for available rooms when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      searchAvailableRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate, searchAvailableRooms]);

  // Calculate pricing when relevant fields change
  useEffect(() => {
    calculatePricingEffect();
  }, [calculatePricingEffect]);

  // =================== VALIDATION HELPERS ===================

  const performValidation = (): boolean => {
    const newErrors: ReservationValidationErrors = {};
    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);

    validateGuest(formData.guestId, newErrors);
    validateBasicDates(formData.checkInDate, formData.checkOutDate, newErrors);
    validateDateLogic(formData.checkInDate, formData.checkOutDate, formData.numberOfNights, newErrors);
    validateGuestCapacity(
      formData.numberOfGuests,
      selectedRoom?.capacity,
      selectedRoom?.name,
      newErrors
    );
    validateRoomAvailability(
      formData.roomType,
      availableRooms.length,
      Boolean(formData.checkInDate && formData.checkOutDate),
      newErrors
    );

    // Check suitable rooms
    if (availableRooms.length > 0 && formData.numberOfGuests > 0) {
      const suitableRooms = availableRooms.filter(room => room.capacity >= formData.numberOfGuests);
      if (suitableRooms.length === 0) {
        newErrors.numberOfGuests = `No hay habitaciones disponibles con capacidad para ${formData.numberOfGuests} huésped${formData.numberOfGuests > 1 ? 'es' : ''} en las fechas seleccionadas`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Actualiza un campo del formulario y ejecuta validación en tiempo real.
   * Reducida complejidad mediante helpers externos.
   * 
   * @param field - Campo del formulario a actualizar
   * @param value - Nuevo valor (tipado según el campo)
   */
  const updateFormField = <K extends keyof SimpleReservationFormData>(
    field: K,
    value: SimpleReservationFormData[K]
  ) => {
    setFormData((prev: SimpleReservationFormData) => ({ ...prev, [field]: value }));
    
    // Clear field error
    if (errors[field as keyof ReservationValidationErrors]) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation using helpers
    const newErrors: ReservationValidationErrors = {};

    if (field === 'checkInDate' || field === 'checkOutDate') {
      const checkInDate = field === 'checkInDate' ? value as string : formData.checkInDate;
      const checkOutDate = field === 'checkOutDate' ? value as string : formData.checkOutDate;

      if (field === 'checkInDate') {
        const error = validateDateField('checkInDate', checkInDate, checkOutDate);
        if (error) newErrors.checkInDate = error;
      }

      if (field === 'checkOutDate') {
        const error = validateDateField('checkOutDate', checkOutDate, checkInDate);
        if (error) newErrors.checkOutDate = error;
      }
    }

    if (field === 'numberOfGuests') {
      const guestCount = parseGuestCount(value);
      const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
      const error = validateGuestCount(guestCount, selectedRoom?.capacity, selectedRoom?.name);
      if (error) newErrors.numberOfGuests = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, ...newErrors }));
    }
  };

  const submitReservation = async (): Promise<boolean> => {
    if (!performValidation()) {
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
      if (!selectedRoom) {
        setErrors({ general: 'Debe seleccionar una habitación válida' });
        return false;
      }

      await reservationService.createReservation({
        ...formData,
        roomId: selectedRoom.id,
      });
      return true;
    } catch (error) {
      console.error('Error creating reservation:', error);
      setErrors({ general: 'Error al crear la reserva. Por favor intente nuevamente.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdditionalServices = async () => {
    try {
      const services = await reservationService.getAdditionalServices();
      setAdditionalServices(services);
    } catch (error) {
      console.error('Error loading additional services:', error);
    }
  };

  // Load additional services on mount
  useEffect(() => {
    loadAdditionalServices();
  }, []);

  return {
    formData,
    errors,
    isLoading,
    availableRooms,
    additionalServices,
    updateFormField,
    submitReservation,
    validateForm: performValidation,
  };
};
