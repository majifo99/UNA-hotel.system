import { useState, useEffect } from 'react';
import type { 
  SimpleReservationFormData, 
  ReservationValidationErrors 
} from '../types/domain';
import type { Room } from '../../../types/core';
import type { AdditionalService } from '../../../types/core/domain';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';
import { validateAdvanceBooking } from '../constants/businessRules';

export const useCreateReservation = () => {
  const [formData, setFormData] = useState<SimpleReservationFormData>({
    guestId: '',
    checkInDate: '',
    checkOutDate: '',
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

  // Calculate nights when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setFormData(prev => ({ ...prev, numberOfNights: diffDays }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Search for available rooms when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      searchAvailableRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Calculate pricing when relevant fields change
  useEffect(() => {
    calculatePricing();
  }, [formData.roomType, formData.numberOfNights, formData.additionalServices, availableRooms, additionalServices]);

  const searchAvailableRooms = async () => {
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
  };

  const calculatePricing = () => {
    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (!selectedRoom) return;

    const roomPrice = selectedRoom.pricePerNight || selectedRoom.basePrice || 0;
    const subtotal = roomPrice * formData.numberOfNights;
    
    const servicesTotal = additionalServices
      .filter(service => formData.additionalServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);

    const taxes = (subtotal + servicesTotal) * 0.13; // 13% IVA en Costa Rica
    const total = subtotal + servicesTotal + taxes;
    const depositRequired = total * 0.5; // 50% deposit

    setFormData((prev: SimpleReservationFormData) => ({
      ...prev,
      subtotal,
      servicesTotal,
      taxes,
      total,
      depositRequired,
    }));
  };

  // =================== VALIDATION HELPERS ===================

  /**
   * Validates guest selection
   */
  const validateGuest = (errors: ReservationValidationErrors): void => {
    if (!formData.guestId) {
      errors.guestId = 'Debe seleccionar un huésped para continuar';
    }
  };

  /**
   * Validates basic date requirements
   */
  const validateBasicDates = (errors: ReservationValidationErrors): void => {
    if (!formData.checkInDate) {
      errors.checkInDate = 'La fecha de entrada es requerida';
    }
    if (!formData.checkOutDate) {
      errors.checkOutDate = 'La fecha de salida es requerida';
    }
  };

  /**
   * Validates date logic and constraints
   */
  const validateDateLogic = (errors: ReservationValidationErrors): void => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Basic date logic
    if (checkIn < today) {
      errors.checkInDate = 'La fecha de entrada no puede ser anterior a hoy';
    }
    if (checkOut <= checkIn) {
      errors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
    }

    // Advanced validations
    const advanceBookingValidation = validateAdvanceBooking(checkIn, today);
    if (!advanceBookingValidation.isValid && advanceBookingValidation.isTooFarInFuture) {
      errors.checkInDate = `No se pueden hacer reservas con más de ${advanceBookingValidation.maxDaysAllowed} días de anticipación`;
    }

    // Stay duration limits
    const maxStayDays = 30;
    if (formData.numberOfNights > maxStayDays) {
      errors.checkOutDate = `La estadía máxima permitida es de ${maxStayDays} noches`;
    }
    if (formData.numberOfNights < 1) {
      errors.checkOutDate = 'La reserva debe ser de al menos 1 noche';
    }
  };

  /**
   * Validates guest count and capacity
   */
  const validateGuestCapacity = (errors: ReservationValidationErrors): void => {
    if (formData.numberOfGuests < 1) {
      errors.numberOfGuests = 'Debe especificar al menos 1 huésped';
    }
    if (formData.numberOfGuests > 10) {
      errors.numberOfGuests = 'El número máximo de huéspedes por reserva es 10';
    }

    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      errors.numberOfGuests = `La habitación ${selectedRoom.name} tiene capacidad máxima de ${selectedRoom.capacity} huésped${selectedRoom.capacity > 1 ? 'es' : ''}. Seleccione otra habitación o reduzca el número de huéspedes.`;
    }
  };

  /**
   * Validates room selection and availability
   */
  const validateRoomAvailability = (errors: ReservationValidationErrors): void => {
    if (!formData.roomType && availableRooms.length > 0) {
      errors.roomType = 'Debe seleccionar un tipo de habitación';
    }

    if (availableRooms.length === 0 && formData.checkInDate && formData.checkOutDate) {
      errors.roomType = 'No hay habitaciones disponibles para las fechas seleccionadas. Por favor, seleccione otras fechas.';
    }

    if (availableRooms.length > 0 && formData.numberOfGuests > 0) {
      const suitableRooms = availableRooms.filter(room => room.capacity >= formData.numberOfGuests);
      if (suitableRooms.length === 0) {
        errors.numberOfGuests = `No hay habitaciones disponibles con capacidad para ${formData.numberOfGuests} huésped${formData.numberOfGuests > 1 ? 'es' : ''} en las fechas seleccionadas`;
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ReservationValidationErrors = {};

    // Run validation helpers
    validateGuest(newErrors);
    validateBasicDates(newErrors);
    validateDateLogic(newErrors);
    validateGuestCapacity(newErrors);
    validateRoomAvailability(newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormField = (field: keyof SimpleReservationFormData, value: any) => {
    setFormData((prev: SimpleReservationFormData) => ({ ...prev, [field]: value }));
    
    // Clear related errors when user starts typing/changing values
    if (errors[field as keyof ReservationValidationErrors]) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation for specific fields
    const newErrors: ReservationValidationErrors = {};

    if (field === 'checkInDate' || field === 'checkOutDate') {
      const checkInDate = field === 'checkInDate' ? value : formData.checkInDate;
      const checkOutDate = field === 'checkOutDate' ? value : formData.checkOutDate;

      if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (field === 'checkInDate' && checkIn < today) {
          newErrors.checkInDate = 'La fecha de entrada no puede ser anterior a hoy';
        }

        if (field === 'checkOutDate' && checkOut <= checkIn) {
          newErrors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
        }
      }
    }

    if (field === 'numberOfGuests') {
      const guestCount = typeof value === 'number' ? value : parseInt(value) || 0;
      
      if (guestCount < 1) {
        newErrors.numberOfGuests = 'Debe especificar al menos 1 huésped';
      } else if (guestCount > 10) {
        newErrors.numberOfGuests = 'El número máximo de huéspedes por reserva es 10';
      } else {
        // Check against selected room capacity
        const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
        if (selectedRoom && guestCount > selectedRoom.capacity) {
          newErrors.numberOfGuests = `La habitación ${selectedRoom.name} tiene capacidad máxima de ${selectedRoom.capacity} huésped${selectedRoom.capacity > 1 ? 'es' : ''}`;
        }
      }
    }

    // Update errors if there are any new validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, ...newErrors }));
    }
  };

  const submitReservation = async (): Promise<boolean> => {
    if (!validateForm()) {
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
    validateForm,
  };
};
