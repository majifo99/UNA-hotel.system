import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { simpleReservationSchema, type SimpleReservationFormData } from '../schemas/reservationSchema';
import type { Room, AdditionalService } from '../../../types/core';
import { reservationService } from '../services/reservationService';
import { roomService } from '../services/roomService';
import { useAlert } from '../../../components/ui/Alert';

export const useCreateReservationForm = () => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  // React Hook Form with Zod validation
  const form = useForm<SimpleReservationFormData>({
    resolver: zodResolver(simpleReservationSchema),
    defaultValues: {
      guestId: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfAdults: 1,
      numberOfChildren: 0,
      numberOfGuests: 1,
      numberOfNights: 0,
      roomIds: [],
      roomId: '',
      roomType: 'single',
      additionalServices: [],
      subtotal: 0,
      servicesTotal: 0,
      taxes: 0,
      total: 0,
      depositRequired: 0,
      specialRequests: '',
    },
    mode: 'onChange', // Validate on change for real-time feedback
  });

  const { watch, setValue, trigger, formState: { errors, isValid } } = form;

  // Watch form values for calculations
  const watchedValues = watch();
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const numberOfAdults = watch('numberOfAdults');
  const numberOfChildren = watch('numberOfChildren');
  const numberOfGuests = watch('numberOfGuests');
  const roomIds = watch('roomIds');
  const selectedServices = watch('additionalServices');

  // Calculate total guests when adults or children change
  useEffect(() => {
    const totalGuests = (numberOfAdults || 0) + (numberOfChildren || 0);
    if (totalGuests !== numberOfGuests) {
      setValue('numberOfGuests', totalGuests);
    }
    
    // Show alert for children (suggest cribs/additional accommodations)
    if (numberOfChildren && numberOfChildren > 0) {
      showAlert(
        'info',
        `Ha indicado ${numberOfChildren} niño${numberOfChildren > 1 ? 's' : ''}. ¿Necesita cunas o algún servicio adicional para menores? Puede agregarlo en "Solicitudes especiales".`,
        'Huéspedes menores de edad'
      );
    }
  }, [numberOfAdults, numberOfChildren, numberOfGuests, setValue, showAlert]);

  // Calculate nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setValue('numberOfNights', diffDays);
      }
    }
  }, [checkInDate, checkOutDate, setValue]);

  // Search for available rooms when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      searchAvailableRooms();
    }
  }, [checkInDate, checkOutDate]);

  // Calculate pricing when relevant fields change
  useEffect(() => {
    calculatePricing();
  }, [roomIds, watchedValues.numberOfNights, selectedServices, availableRooms, additionalServices]);

  // Additional validation for room capacity
  useEffect(() => {
    const totalGuests = (numberOfAdults || 0) + (numberOfChildren || 0);
    
    if (totalGuests > 0 && roomIds.length > 0 && availableRooms.length > 0) {
      const selectedRooms = availableRooms.filter(room => roomIds.includes(room.id));
      const totalCapacity = selectedRooms.reduce((sum, room) => sum + room.capacity, 0);
      
      if (totalCapacity < totalGuests) {
        form.setError('numberOfGuests', {
          type: 'manual',
          message: `Las habitaciones seleccionadas tienen capacidad para ${totalCapacity} huésped${totalCapacity > 1 ? 'es' : ''}. Total requerido: ${totalGuests} (${numberOfAdults || 0} adultos + ${numberOfChildren || 0} niños). Seleccione habitaciones adicionales.`
        });
      } else {
        // Clear the error if validation passes
        if (errors.numberOfGuests?.type === 'manual') {
          form.clearErrors('numberOfGuests');
        }
      }
    }
  }, [numberOfAdults, numberOfChildren, roomIds, availableRooms, form, errors.numberOfGuests]);

  // Check for available rooms suitable for guest count
  useEffect(() => {
    const totalGuests = (numberOfAdults || 0) + (numberOfChildren || 0);
    
    if (availableRooms.length > 0 && totalGuests > 0) {
      const suitableRooms = availableRooms.filter(room => room.capacity >= totalGuests);
      if (suitableRooms.length === 0) {
        form.setError('numberOfGuests', {
          type: 'manual',
          message: `No hay habitaciones disponibles con capacidad para ${totalGuests} huésped${totalGuests > 1 ? 'es' : ''} (${numberOfAdults || 0} adultos + ${numberOfChildren || 0} niños) en las fechas seleccionadas`
        });
      }
    }
  }, [availableRooms, numberOfAdults, numberOfChildren, form]);

  const searchAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAvailableRooms(checkInDate, checkOutDate);
      setAvailableRooms(rooms);
      
      // Clear room availability errors if rooms are found
      if (rooms.length > 0) {
        form.clearErrors('roomType');
      } else {
        // Set error if no rooms available
        form.setError('roomType', {
          type: 'manual',
          message: 'No hay habitaciones disponibles para las fechas seleccionadas. Por favor, seleccione otras fechas.'
        });
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
      setAvailableRooms([]);
      form.setError('roomType', {
        type: 'manual',
        message: 'Error al buscar habitaciones disponibles. Por favor, intente nuevamente.'
      });
    }
  };

  const calculatePricing = () => {
    // Calculate pricing for multiple rooms
    const selectedRooms = availableRooms.filter(room => roomIds.includes(room.id));
    if (selectedRooms.length === 0) return;

    const roomPrice = selectedRooms.reduce((total, room) => total + (room.pricePerNight || room.basePrice || 0), 0);
    const subtotal = roomPrice * watchedValues.numberOfNights;
    
    const servicesTotal = additionalServices
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);

    const taxes = (subtotal + servicesTotal) * 0.13; // 13% IVA en Costa Rica
    const total = subtotal + servicesTotal + taxes;
    const depositRequired = total * 0.5; // 50% deposit

    setValue('subtotal', subtotal);
    setValue('servicesTotal', servicesTotal);
    setValue('taxes', taxes);
    setValue('total', total);
    setValue('depositRequired', depositRequired);
  };

  const submitReservation = async (data: SimpleReservationFormData): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Get the selected rooms
      const selectedRooms = availableRooms.filter(room => data.roomIds.includes(room.id));
      if (selectedRooms.length === 0) {
        toast.error('Debe seleccionar al menos una habitación válida');
        return false;
      }

      // For the service, use the first room ID for backwards compatibility
      const primaryRoomId = data.roomIds[0];
      const primaryRoom = selectedRooms[0];

      await reservationService.createReservation({
        ...data,
        roomId: primaryRoomId,
        roomType: primaryRoom.type,
      });

      toast.success('✅ Reserva creada exitosamente', {
        description: `La reserva ha sido registrada para ${selectedRooms.length} habitación${selectedRooms.length > 1 ? 'es' : ''}.`
      });
      
      return true;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Error al crear la reserva', {
        description: 'Por favor intente nuevamente.'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadAdditionalServices = async () => {
    try {
      const services = await reservationService.getAdditionalServices();
      setAdditionalServices(services);
    } catch (error) {
      console.error('Error loading additional services:', error);
      toast.error('Error al cargar servicios adicionales');
    }
  };

  // Load additional services on mount
  useEffect(() => {
    loadAdditionalServices();
  }, []);

  return {
    form,
    formData: watchedValues,
    errors,
    isValid,
    isSubmitting,
    availableRooms,
    additionalServices,
    submitReservation,
    // Helper methods
    setValue,
    trigger,
    watch,
  };
};
