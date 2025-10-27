import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SimpleReservationFormData, Reservation, ReservationFilters, CreateReservationDto, AddReservationServiceDto } from '../types';

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
 * Provides the reservations list with optional filters.
 * Supports: search (email), estado, fuente, desde, hasta, page
 * All parameters are optional and combinable.
 */
export const useReservationsList = (filters?: ReservationFilters) => {
  return useQuery({
    queryKey: [...reservationKeys.list(), filters] as const,
    queryFn: () => reservationService.getReservations(filters),
    staleTime: 60 * 1000, // 1 minute - reservations can change frequently
  });
};

/**
 * Hook: usePendingReservations
 * 
 * Obtiene reservas con estado "Pendiente"
 * GET /reservas?estado=Pendiente
 */
export const usePendingReservations = () => {
  return useQuery({
    queryKey: [...reservationKeys.list(), { estado: 'Pendiente' }] as const,
    queryFn: () => reservationService.getPendingReservations(),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook: useCancelledReservations
 * 
 * Obtiene reservas con estado "Cancelada"
 * GET /reservas?estado=Cancelada
 */
export const useCancelledReservations = () => {
  return useQuery({
    queryKey: [...reservationKeys.list(), { estado: 'Cancelada' }] as const,
    queryFn: () => reservationService.getCancelledReservations(),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook: useConfirmedReservations
 * 
 * Obtiene reservas con estado "Confirmada"
 * GET /reservas?estado=Confirmada
 */
export const useConfirmedReservations = () => {
  return useQuery({
    queryKey: [...reservationKeys.list(), { estado: 'Confirmada' }] as const,
    queryFn: () => reservationService.getConfirmedReservations(),
    staleTime: 60 * 1000,
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
 * 
 * Optimizaciones:
 * - Solo hace fetch cuando hay parámetros válidos (enabled)
 * - Mantiene datos previos en cache durante 5 minutos (staleTime)
 * - Usa `keepPreviousData` implícito de TanStack Query v5
 * - No refetch automático cuando los parámetros son undefined temporalmente
 * 
 * Esto evita que se pierdan las habitaciones visibles cuando otros componentes
 * invalidan queries o actualizan el estado temporalmente.
 */
export const useAvailableRooms = (checkInDate: string, checkOutDate: string, numberOfGuests: number) => {
  return useQuery({
    queryKey: reservationKeys.availableRooms(checkInDate, checkOutDate, numberOfGuests),
    queryFn: () => roomService.getAvailableRooms(checkInDate, checkOutDate, numberOfGuests),
    enabled: !!(checkInDate && checkOutDate && numberOfGuests > 0), // Only fetch when all params are valid
    staleTime: 5 * 60 * 1000, // 5 minutes - rooms don't change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes even if unmounted
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 2, // Only retry twice on failure
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
/**
 * Variables para confirmar/cancelar reserva
 */
interface ConfirmCancelVariables {
  id: string;
  notas?: string;
}

/**
 * Hook: useConfirmReservation
 * 
 * Mutation para confirmar una reserva (cambia estado a Confirmada)
 * POST /reservas/{id}/confirmar
 */
export const useConfirmReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notas }: ConfirmCancelVariables) =>
      reservationService.confirmReservation(id, notas),
    onSuccess: (updated) => {
      if (!updated) return;

      queryClient.setQueryData(reservationKeys.detail(updated.id), updated);
      queryClient.setQueryData(reservationKeys.list(), (current: Reservation[] | undefined) => {
        if (!current) return current;
        return current.map(reservation => (reservation.id === updated.id ? { ...reservation, ...updated } : reservation));
      });
      console.log('[Hook] Reservation confirmed:', updated);
    },
    onError: (error) => {
      console.error('[Hook] Error confirming reservation:', error);
    },
  });
};

/**
 * Hook: useCancelReservation
 * 
 * Mutation para cancelar una reserva (cambia estado a Cancelada)
 * POST /reservas/{id}/cancelar
 */
export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notas }: ConfirmCancelVariables) =>
      reservationService.cancelReservation(id, notas),
    onSuccess: (updated) => {
      if (!updated) return;

      queryClient.setQueryData(reservationKeys.detail(updated.id), updated);
      queryClient.setQueryData(reservationKeys.list(), (current: Reservation[] | undefined) => {
        if (!current) return current;
        return current.map(reservation => (reservation.id === updated.id ? { ...reservation, ...updated } : reservation));
      });
      console.log('[Hook] Reservation cancelled:', updated);
    },
    onError: (error) => {
      console.error('[Hook] Error cancelling reservation:', error);
    },
  });
};

// =================== NEW API HOOKS ===================

/**
 * Hook: useCreateNewReservation
 * 
 * Mutation for creating a new reservation with multiple rooms.
 * Uses the new API structure (POST /reservas).
 * 
 * Features:
 * - Invalidates reservation list on success
 * - Updates cache optimistically
 * - Returns reservation data for navigation
 */
export const useCreateNewReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReservationDto) => {
      return reservationService.createNewReservation(payload);
    },
    onSuccess: (data: Reservation) => {
      // Invalidate all reservation queries to refresh lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });

      // Set the new reservation in detail cache
      queryClient.setQueryData(reservationKeys.detail(data.id), data);

      console.log('[Hook] Reservation created successfully:', data);
    },
    onError: (error) => {
      console.error('[Hook] Error creating reservation:', error);
    },
  });
};

/**
 * Hook: useAddReservationService
 * 
 * Mutation for adding a service to an existing reservation.
 * Uses the new API structure (POST /reservas/{id}/servicios).
 * 
 * Features:
 * - Invalidates ONLY the specific reservation detail (not the full list)
 * - Preserves other query states to avoid unnecessary refetches
 * - Provides feedback through mutation state
 * 
 * IMPORTANTE: No invalida la lista completa ni queries de habitaciones disponibles
 * para mantener el estado del formulario de edición intacto.
 */
export const useAddReservationService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: string; payload: AddReservationServiceDto }) => {
      return reservationService.addServiceToReservation(reservationId, payload);
    },
    onSuccess: (_data, variables) => {
      // ONLY invalidate the specific reservation detail to refresh services
      // This preserves form state and available rooms queries
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.detail(variables.reservationId),
        exact: true, // Only invalidate exact match, not derived queries
      });

      // DO NOT invalidate the full list or available rooms
      // The list will update naturally when navigating back

      console.log('[Hook] Service added successfully to reservation:', variables.reservationId);
    },
    onError: (error) => {
      console.error('[Hook] Error adding service to reservation:', error);
    },
  });
};

/**
 * Hook: useUpdateReservationRoom
 * 
 * Mutation para actualizar una habitación específica de una reserva.
 * PUT /reservas/{reservaId}/habitaciones/{habitacionId}
 * 
 * Features:
 * - Invalida la reserva específica para refrescar los datos
 * - Actualiza fechas, número de huéspedes y habitación asignada
 * - Mantiene la integridad de los datos de la reserva
 */
export const useUpdateReservationRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reservaId, 
      habitacionId, 
      updates 
    }: { 
      reservaId: string; 
      habitacionId: string;
      updates: {
        roomId?: number;
        checkInDate?: string;
        checkOutDate?: string;
        adults?: number;
        children?: number;
        babies?: number;
      }
    }) => {
      return reservationService.updateRoomDetails(reservaId, habitacionId, updates);
    },
    onSuccess: (_data, variables) => {
      // Invalidar la reserva específica
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.detail(variables.reservaId) 
      });

      // Invalidar la lista de reservas
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.list() 
      });

      // Invalidar habitaciones disponibles para reflejar cambios
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.rooms() 
      });

      console.log('[Hook] Reservation room updated successfully:', variables.reservaId);
    },
    onError: (error) => {
      console.error('[Hook] Error updating reservation room:', error);
    },
  });
};

/**
 * Hook: useUpdateReservationStatus
 * 
 * Mutation para actualizar el estado de una reserva.
 * PUT /reservas/{id}
 * 
 * Features:
 * - Actualiza el estado de la reserva (pending, confirmed, checked_in, etc.)
 * - Invalida la reserva específica y la lista
 * - Útil para cambios de estado manuales en el front desk
 */
export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reservationId, 
      status 
    }: { 
      reservationId: string; 
      status: Reservation['status'] 
    }) => {
      return reservationService.updateReservationStatus(reservationId, status);
    },
    onSuccess: (_data, variables) => {
      // Invalidar la reserva específica
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.detail(variables.reservationId) 
      });

      // Invalidar la lista de reservas
      queryClient.invalidateQueries({ 
        queryKey: reservationKeys.list() 
      });

      console.log('[Hook] Reservation status updated successfully:', variables.reservationId, variables.status);
    },
    onError: (error) => {
      console.error('[Hook] Error updating reservation status:', error);
    },
  });
};
