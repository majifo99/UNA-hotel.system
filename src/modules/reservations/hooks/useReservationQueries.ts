import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SimpleReservationFormData, Reservation } from '../types';

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
 * - ['reservations', 'list'] - Paginated/full reservation list
 * - ['reservations', 'detail', id] - Detail for a specific reservation
 * - ['reservations', 'rooms'] - All room queries (availability, types)
 * - ['reservations', 'rooms', 'available', ...] - Specific availability queries
 * - ['reservations', 'rooms', 'types'] - Cached room type metadata
 * - ['reservations', 'services'] - Additional services queries
 *
 * Benefits:
 * - Easy cache invalidation (invalidate all rooms: queryClient.invalidateQueries(['reservations', 'rooms']))
 * - Prevents cache key collisions
 * - Type-safe key generation
 */
export const reservationKeys = {
  // Base key for all reservation queries
  all: ['reservations'] as const,

  // Reservation list/detail keys
  list: () => [...reservationKeys.all, 'list'] as const,
  detail: (id: string) => [...reservationKeys.all, 'detail', id] as const,

  // Room-related query keys
  rooms: () => [...reservationKeys.all, 'rooms'] as const,
  availableRooms: (checkIn: string, checkOut: string, guests: number) =>
    [...reservationKeys.rooms(), 'available', checkIn, checkOut, guests] as const,
  roomTypes: () => [...reservationKeys.rooms(), 'types'] as const,

  // Service-related query keys
  services: () => [...reservationKeys.all, 'services'] as const,
};

/**
 * Hook: useReservationsList
 *
 * Provides the full reservations list with TanStack Query caching.
 * Prefers backend data when available, falling back to mock data when configured.
 */
export const useReservationsList = () => {
  return useQuery({
    queryKey: reservationKeys.list(),
    queryFn: () => reservationService.getAllReservations(),
    staleTime: 60 * 1000, // 1 minute - reservations can change frequently
  });
};

/**
 * Hook: useReservationById
 *
 * Fetches a single reservation by ID.
 * Used for detail pages and viewing individual reservations.
 */
export const useReservationById = (id: string) => {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationService.getReservationById(id),
    enabled: !!id, // Only fetch when ID is provided
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook: useRoomTypes
 *
 * Returns catalog metadata for room types (name, base price, capacity).
 */
export const useRoomTypes = () => {
  return useQuery({
    queryKey: reservationKeys.roomTypes(),
    queryFn: () => roomService.getAllRoomTypes(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook: useAvailableRooms
 *
 * Fetches available rooms based on check-in/check-out dates and guest count.
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
    onSuccess: (data: Reservation) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });

      // Update caches optimistically
      queryClient.setQueryData(reservationKeys.detail(data.id), data);
      queryClient.setQueryData(reservationKeys.list(), (current: Reservation[] | undefined) => {
        if (!current) return current;
        const exists = current.some(reservation => reservation.id === data.id);
        return exists ? current : [data, ...current];
      });
    },
    onError: (error) => {
      console.error('Error creating reservation:', error);
    },
  });
};

// Update Reservation Mutation
interface UpdateReservationVariables {
  id: string;
  updates: Partial<Reservation>;
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateReservationVariables) =>
      reservationService.updateReservation(id, updates),
    onSuccess: (updated) => {
      if (!updated) return;

      queryClient.setQueryData(reservationKeys.detail(updated.id), updated);
      queryClient.setQueryData(reservationKeys.list(), (current: Reservation[] | undefined) => {
        if (!current) return current;
        return current.map(reservation => (reservation.id === updated.id ? { ...reservation, ...updated } : reservation));
      });
    },
    onError: (error) => {
      console.error('Error updating reservation:', error);
    },
  });
};

// Cancel Reservation Mutation
interface CancelReservationVariables {
  id: string;
  options?: {
    penalty?: number;
    note?: string;
  };
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }: CancelReservationVariables) =>
      reservationService.cancelReservation(id, options),
    onSuccess: (updated) => {
      if (!updated) return;

      queryClient.setQueryData(reservationKeys.detail(updated.id), updated);
      queryClient.setQueryData(reservationKeys.list(), (current: Reservation[] | undefined) => {
        if (!current) return current;
        return current.map(reservation => (reservation.id === updated.id ? { ...reservation, ...updated } : reservation));
      });
    },
    onError: (error) => {
      console.error('Error cancelling reservation:', error);
    },
  });
};
