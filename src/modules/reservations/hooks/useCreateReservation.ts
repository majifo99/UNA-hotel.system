import { useState, useEffect } from 'react';
import type { 
  SimpleReservationFormData, 
  ReservationValidationErrors, 
  Room, 
  AdditionalService 
} from '../../../types/core';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';
import { adaptLegacyServices } from '../adapters/serviceAdapter';

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
      newErrors.guestId = 'Debe seleccionar un huésped';
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

      if (checkIn < today) {
        newErrors.checkInDate = 'La fecha de entrada no puede ser anterior a hoy';
      }

      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
      }
    }

    // Guest number validation
    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Debe haber al menos 1 huésped';
    }

    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `La habitación ${selectedRoom.name} tiene capacidad máxima de ${selectedRoom.capacity} huéspedes`;
    }

    // Room availability validation
    if (availableRooms.length === 0 && formData.checkInDate && formData.checkOutDate) {
      newErrors.roomType = 'No hay habitaciones disponibles para las fechas seleccionadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormField = (field: keyof SimpleReservationFormData, value: any) => {
    setFormData((prev: SimpleReservationFormData) => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field as keyof ReservationValidationErrors]) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, [field]: undefined }));
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
      const legacyServices = await reservationService.getAdditionalServices();
      const adaptedServices = adaptLegacyServices(legacyServices);
      setAdditionalServices(adaptedServices);
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
