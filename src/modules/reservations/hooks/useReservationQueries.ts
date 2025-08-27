import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SimpleReservationFormData } from '../types';

// Import service layer for API calls
import { roomService } from '../services/roomService';
import { reservationService } from '../services/reservationService';

/**
 * TanStack Query Keys Configuration
 * 
 * Centralized query key factory for consistent cache management.
 * Query keys are hierarchical for efficient invalidation:
 * 
 * Structure:
 * - ['reservations'] - Base key for all reservation-related queries
 * - ['reservations', 'rooms'] - All room queries
 * - ['reservations', 'rooms', 'available', ...] - Specific availability queries
 * - ['reservations', 'services'] - Additional services queries
 * - ['reservations', 'guests'] - Guest-related queries
 * 
 * Benefits:
 * - Easy cache invalidation (invalidate all rooms: queryClient.invalidateQueries(['reservations', 'rooms']))
 * - Prevents cache key collisions
 * - Type-safe key generation
 */
export const reservationKeys = {
  // Base key for all reservation queries
  all: ['reservations'] as const,
  
  // Room-related query keys
  rooms: () => [...reservationKeys.all, 'rooms'] as const,
  availableRooms: (checkIn: string, checkOut: string, guests: number) => 
    [...reservationKeys.rooms(), 'available', checkIn, checkOut, guests] as const,
  
  // Service-related query keys
  services: () => [...reservationKeys.all, 'services'] as const,
};

/**
 * Hook: useAvailableRooms
 * 
 * Fetches available rooms based on check-in/check-out dates and guest count.
 * 
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Conditional fetching (only when all params are provided)
 * - Optimistic room filtering by capacity and type
 * 
 * @param checkInDate - ISO date string for check-in
 * @param checkOutDate - ISO date string for check-out  
 * @param numberOfGuests - Number of guests for capacity filtering
 * @returns TanStack Query result with available rooms data
 */
export const useAvailableRooms = (checkInDate: string, checkOutDate: string, numberOfGuests: number) => {
  return useQuery({
    queryKey: reservationKeys.availableRooms(checkInDate, checkOutDate, numberOfGuests),
    queryFn: () => roomService.getAvailableRooms(checkInDate, checkOutDate, numberOfGuests),
    enabled: !!(checkInDate && checkOutDate && numberOfGuests > 0), // Only fetch when all params are valid
    staleTime: 5 * 60 * 1000, // 5 minutes - rooms don't change frequently
  });
};

// Additional Services Query
export const useAdditionalServices = () => {
  return useQuery({
    queryKey: reservationKeys.services(),
    queryFn: () => reservationService.getAdditionalServices(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create Reservation Mutation
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationData: SimpleReservationFormData & { roomId: string }) => {
      return reservationService.createReservation(reservationData);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
      
      // You could also update specific cache entries
      queryClient.setQueryData(['reservations', data.id], data);
    },
    onError: (error) => {
      console.error('Error creating reservation:', error);
    },
  });
};
