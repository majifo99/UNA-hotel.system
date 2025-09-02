import { useState, useEffect } from 'react';
import type { 
  SimpleReservationFormData, 
  ReservationValidationErrors 
} from '../types/domain';
import type { Room } from '../../../types/core';
import type { AdditionalService } from '../../../types/core/domain';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';

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

  const validateForm = (): boolean => {
    const newErrors: ReservationValidationErrors = {};

    // Guest validation
    if (!formData.guestId) {
      newErrors.guestId = 'Debe seleccionar un huésped para continuar';
    }

    // Date validation
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'La fecha de entrada es requerida';
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'La fecha de salida es requerida';
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validación de fecha de entrada
      if (checkIn < today) {
        newErrors.checkInDate = 'La fecha de entrada no puede ser anterior a hoy';
      }

      // Validación de fecha de salida
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
      }

      // Validación de rango de fechas razonable
      const maxDaysInAdvance = 365; // 1 año máximo
      const daysInAdvance = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysInAdvance > maxDaysInAdvance) {
        newErrors.checkInDate = `No se pueden hacer reservas con más de ${maxDaysInAdvance} días de anticipación`;
      }

      // Validación de estadía máxima
      const maxStayDays = 30; // 30 días máximo
      if (formData.numberOfNights > maxStayDays) {
        newErrors.checkOutDate = `La estadía máxima permitida es de ${maxStayDays} noches`;
      }

      // Validación de estadía mínima
      if (formData.numberOfNights < 1) {
        newErrors.checkOutDate = 'La reserva debe ser de al menos 1 noche';
      }
    }

    // Guest number validation
    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Debe especificar al menos 1 huésped';
    }

    if (formData.numberOfGuests > 10) {
      newErrors.numberOfGuests = 'El número máximo de huéspedes por reserva es 10';
    }

    // Room capacity validation
    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `La habitación ${selectedRoom.name} tiene capacidad máxima de ${selectedRoom.capacity} huésped${selectedRoom.capacity > 1 ? 'es' : ''}. Seleccione otra habitación o reduzca el número de huéspedes.`;
    }

    // Room selection validation
    if (!formData.roomType && availableRooms.length > 0) {
      newErrors.roomType = 'Debe seleccionar un tipo de habitación';
    }

    // Room availability validation
    if (availableRooms.length === 0 && formData.checkInDate && formData.checkOutDate) {
      newErrors.roomType = 'No hay habitaciones disponibles para las fechas seleccionadas. Por favor, seleccione otras fechas.';
    }

    // Additional validation for room availability based on guest count
    if (availableRooms.length > 0 && formData.numberOfGuests > 0) {
      const suitableRooms = availableRooms.filter(room => room.capacity >= formData.numberOfGuests);
      if (suitableRooms.length === 0) {
        newErrors.numberOfGuests = `No hay habitaciones disponibles con capacidad para ${formData.numberOfGuests} huésped${formData.numberOfGuests > 1 ? 'es' : ''} en las fechas seleccionadas`;
      }
    }

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
