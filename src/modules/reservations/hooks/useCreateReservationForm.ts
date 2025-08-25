import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { reservationSchema, type ReservationFormData } from '../schemas/reservationSchema';
import { 
  useAvailableRooms, 
  useAdditionalServices, 
  useCreateReservation as useCreateReservationMutation 
} from './useReservationQueries';

/**
 * Default form values for new reservation
 * 
 * Provides sensible defaults for all required fields:
 * - Guest info: Empty strings with 'id' as default document type
 * - Dates: Empty strings (user must select)
 * - Numbers: Safe defaults (1 guest, 0 calculated values)
 * - Room: 'single' as default room type
 * - Services: Empty array (user can add)
 */
const defaultValues: ReservationFormData = {
  guest: {
    id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'id' as const,
    documentNumber: '',
  },
  checkInDate: '',
  checkOutDate: '',
  numberOfGuests: 1,
  numberOfNights: 0,
  roomType: 'single' as const,
  roomId: '',
  additionalServices: [],
  subtotal: 0,
  servicesTotal: 0,
  taxes: 0,
  total: 0,
  specialRequests: '',
  paymentMethod: undefined,
  depositRequired: 0,
};

/**
 * Custom Hook: useCreateReservationForm
 * 
 * Provides comprehensive form management for creating hotel reservations.
 * 
 * Features:
 * - React Hook Form integration with Zod validation
 * - Real-time form validation and error handling
 * - Automatic calculation of nights, pricing, taxes
 * - TanStack Query integration for data fetching
 * - Type-safe form data handling
 * 
 * Dependencies:
 * - Room availability data (useAvailableRooms)
 * - Additional services data (useAdditionalServices)
 * - Reservation creation mutation (useCreateReservation)
 * 
 * Auto-calculated fields:
 * - numberOfNights: Based on check-in/check-out dates
 * - subtotal: Room price × number of nights
 * - servicesTotal: Sum of selected additional services
 * - taxes: 13% of subtotal + services
 * - total: subtotal + servicesTotal + taxes
 * - depositRequired: 50% of total
 * 
 * @returns Form methods, queries, mutation, and calculated values
 */
export const useCreateReservationForm = () => {
  // Initialize React Hook Form with Zod schema validation
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
    mode: 'onChange', // Validate on every change for better UX
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  /* ===== AUTOMATIC CALCULATIONS ===== */
  
  /**
   * Calculate number of nights between check-in and check-out dates
   * Updates automatically when dates change
   */
  const numberOfNights = useMemo(() => {
    const checkIn = watchedValues.checkInDate;
    const checkOut = watchedValues.checkOutDate;
    
    if (!checkIn || !checkOut) return 0;
    
    const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [watchedValues.checkInDate, watchedValues.checkOutDate]);

  // Queries with proper dependencies
  const availableRoomsQuery = useAvailableRooms(
    watchedValues.checkInDate,
    watchedValues.checkOutDate,
    watchedValues.numberOfGuests
  );

  const servicesQuery = useAdditionalServices();
  const createReservationMutation = useCreateReservationMutation();

  // Calculate pricing
  const pricing = useMemo(() => {
    const availableRooms = availableRoomsQuery.data || [];
    const services = servicesQuery.data || [];
    
    const selectedRoom = availableRooms.find(room => room.type === watchedValues.roomType);
    const selectedServices = services.filter((service: any) => 
      watchedValues.additionalServices.includes(service.id)
    );

    const subtotal = selectedRoom ? selectedRoom.pricePerNight * numberOfNights : 0;
    const servicesTotal = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
    const taxes = Math.round((subtotal + servicesTotal) * 0.13);
    const total = subtotal + servicesTotal + taxes;
    const depositRequired = Math.round(total * 0.5);

    return {
      subtotal,
      servicesTotal,
      taxes,
      total,
      depositRequired,
      numberOfNights,
    };
  }, [
    availableRoomsQuery.data,
    servicesQuery.data,
    watchedValues.roomType,
    watchedValues.additionalServices,
    numberOfNights,
  ]);

  // Guest management states
  const isCreatingNewGuest = !watchedValues.guest.firstName; // Simplified logic
  const selectedGuest = isCreatingNewGuest ? null : watchedValues.guest;

  // Form submission
  const onSubmit = async (data: ReservationFormData) => {
    try {
      await createReservationMutation.mutateAsync({
        ...data,
        ...pricing,
      });
      
      // Reset form on success
      form.reset();
      
      return true;
    } catch (error) {
      console.error('Failed to create reservation:', error);
      return false;
    }
  };

  // Helper functions
  const handleGuestSelection = (guest: any) => {
    setValue('guest', guest);
  };

  const handleCreateNewGuest = () => {
    setValue('guest', defaultValues.guest);
  };

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = watchedValues.additionalServices;
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    setValue('additionalServices', updatedServices);
  };

  return {
    // Form controls
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
    
    // Data
    formData: { ...watchedValues, ...pricing },
    availableRooms: availableRoomsQuery.data || [],
    additionalServices: servicesQuery.data || [],
    
    // State
    isLoading: createReservationMutation.isPending,
    isLoadingRooms: availableRoomsQuery.isLoading,
    isLoadingServices: servicesQuery.isLoading,
    selectedGuest,
    isCreatingNewGuest,
    
    // Actions
    handleGuestSelection,
    handleCreateNewGuest,
    handleServiceToggle,
    
    // Derived data
    pricing,
    numberOfNights,
  };
};
