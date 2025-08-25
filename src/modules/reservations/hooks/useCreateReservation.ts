import { useState, useEffect } from 'react';
import type { ReservationFormData, ReservationValidationErrors, Room, AdditionalService, Guest } from '../types';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';
import { guestService } from '../services/guestService';

export const useCreateReservation = () => {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCreatingNewGuest, setIsCreatingNewGuest] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    guest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentType: 'id',
      documentNumber: '',
    },
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
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setFormData((prev: ReservationFormData) => ({ ...prev, numberOfNights: nights }));
        checkRoomAvailability(checkIn, checkOut);
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Calculate pricing when relevant data changes
  useEffect(() => {
    calculatePricing();
  }, [formData.numberOfNights, formData.roomType, formData.additionalServices, availableRooms]);

  const checkRoomAvailability = async (checkIn: Date, checkOut: Date) => {
    try {
      setIsLoading(true);
      const rooms = await roomService.getAvailableRooms(checkIn, checkOut, formData.numberOfGuests, formData.roomType);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error checking room availability:', error);
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, general: 'Error al verificar disponibilidad de habitaciones' }));
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!formData.numberOfNights || availableRooms.length === 0) return;

    const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
    if (!selectedRoom) return;

    const subtotal = selectedRoom.pricePerNight * formData.numberOfNights;
    
    const servicesTotal = additionalServices
      .filter(service => formData.additionalServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);

    const taxes = (subtotal + servicesTotal) * 0.13; // 13% IVA en Costa Rica
    const total = subtotal + servicesTotal + taxes;
    const depositRequired = total * 0.5; // 50% deposit

    setFormData((prev: ReservationFormData) => ({
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
    if (!formData.guest.firstName.trim()) {
      newErrors.guest = { ...newErrors.guest, firstName: 'El nombre es requerido' };
    }

    if (!formData.guest.lastName.trim()) {
      newErrors.guest = { ...newErrors.guest, lastName: 'El apellido es requerido' };
    }

    if (!formData.guest.email.trim()) {
      newErrors.guest = { ...newErrors.guest, email: 'El email es requerido' };
    } else if (!/\S+@\S+\.\S+/.test(formData.guest.email)) {
      newErrors.guest = { ...newErrors.guest, email: 'Email inválido' };
    }

    if (!formData.guest.phone.trim()) {
      newErrors.guest = { ...newErrors.guest, phone: 'El teléfono es requerido' };
    }

    if (!formData.guest.documentNumber.trim()) {
      newErrors.guest = { ...newErrors.guest, documentNumber: 'El número de documento es requerido' };
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

  const updateFormField = (field: keyof ReservationFormData, value: any) => {
    setFormData((prev: ReservationFormData) => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field as keyof ReservationValidationErrors]) {
      setErrors((prev: ReservationValidationErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateGuestField = (field: keyof ReservationFormData['guest'], value: string) => {
    setFormData((prev: ReservationFormData) => ({
      ...prev,
      guest: { ...prev.guest, [field]: value }
    }));

    // Clear related errors
    if (errors.guest && field in errors.guest) {
      setErrors((prev: ReservationValidationErrors) => ({
        ...prev,
        guest: { ...prev.guest, [field]: undefined }
      }));
    }
  };

  const submitReservation = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    // Validate guest data before submission
    if (!(await validateGuestBeforeSubmit())) {
      return false;
    }

    try {
      setIsLoading(true);
      const selectedRoom = availableRooms.find(room => room.type === formData.roomType);
      
      if (!selectedRoom) {
        setErrors({ general: 'No se pudo encontrar la habitación seleccionada' });
        return false;
      }

      // Create guest if it's a new one
      let guestId = selectedGuest?.id;
      if (!selectedGuest) {
        const newGuest = await guestService.createGuest(formData.guest);
        guestId = newGuest.id;
      }

      const reservationData = {
        ...formData,
        roomId: selectedRoom.id,
        guest: {
          ...formData.guest,
          id: guestId,
        }
      };

      await reservationService.createReservation(reservationData);
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

  const handleGuestSelection = (guest: Guest | null) => {
    setSelectedGuest(guest);
    if (guest) {
      setFormData((prev: ReservationFormData) => ({
        ...prev,
        guest: { ...guest }
      }));
      setIsCreatingNewGuest(false);
    }
  };

  const handleCreateNewGuest = () => {
    setSelectedGuest(null);
    setIsCreatingNewGuest(true);
    // Reset guest data
    setFormData((prev: ReservationFormData) => ({
      ...prev,
      guest: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentType: 'id',
        documentNumber: '',
      }
    }));
  };

  const validateGuestBeforeSubmit = async (): Promise<boolean> => {
    if (selectedGuest) return true; // Guest already exists, no validation needed
    
    try {
      const validation = await guestService.validateGuestData(formData.guest);
      
      if (!validation.isValid) {
        const errorMsg = validation.errors.join(', ');
        setErrors({ general: `Error en datos del huésped: ${errorMsg}` });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating guest:', error);
      setErrors({ general: 'Error al validar datos del huésped' });
      return false;
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
    selectedGuest,
    isCreatingNewGuest,
    updateFormField,
    updateGuestField,
    submitReservation,
    validateForm,
    handleGuestSelection,
    handleCreateNewGuest,
  };
};
