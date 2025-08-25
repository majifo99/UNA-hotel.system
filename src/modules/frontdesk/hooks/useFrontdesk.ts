import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FrontdeskService from '../services/frontdeskService';
import type { 
  Room, 
  RoomFilters, 
  QuickReservation, 
  CheckIn, 
  CheckOut,
  UpdateRoom 
} from '../types';

// =================== QUERY KEYS ===================
export const frontdeskKeys = {
  all: ['frontdesk'] as const,
  rooms: () => [...frontdeskKeys.all, 'rooms'] as const,
  roomsWithFilters: (filters?: RoomFilters) => [...frontdeskKeys.rooms(), { filters }] as const,
  room: (id: string) => [...frontdeskKeys.rooms(), id] as const,
  calendar: (startDate: string, endDate: string) => [...frontdeskKeys.all, 'calendar', { startDate, endDate }] as const,
  stats: () => [...frontdeskKeys.all, 'stats'] as const,
  reservations: () => [...frontdeskKeys.all, 'reservations'] as const,
  reservationsByDate: (date: string) => [...frontdeskKeys.reservations(), date] as const,
};

// =================== ROOMS QUERIES ===================

/**
 * Hook para obtener todas las habitaciones con filtros opcionales
 */
export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: frontdeskKeys.roomsWithFilters(filters),
    queryFn: () => FrontdeskService.getRooms(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener una habitación específica
 */
export function useRoom(id: string) {
  return useQuery({
    queryKey: frontdeskKeys.room(id),
    queryFn: () => FrontdeskService.getRoomById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener estadísticas del dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: frontdeskKeys.stats(),
    queryFn: () => FrontdeskService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // Actualizar cada 5 minutos
  });
}

/**
 * Hook para obtener calendario de habitaciones
 */
export function useRoomCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: frontdeskKeys.calendar(startDate, endDate),
    queryFn: () => FrontdeskService.getRoomCalendar(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

// =================== MUTATIONS ===================

/**
 * Hook para actualizar estado de habitación
 */
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Room['status'] }) =>
      FrontdeskService.updateRoomStatus(id, status),
    onSuccess: (updatedRoom) => {
      // Invalidar y actualizar caché
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.stats() });
      
      // Actualizar habitación específica en caché
      queryClient.setQueryData(frontdeskKeys.room(updatedRoom.id), updatedRoom);
      
      toast.success('Estado de habitación actualizado');
    },
    onError: (error) => {
      console.error('Error updating room status:', error);
      toast.error('Error al actualizar estado de habitación');
    },
  });
}

/**
 * Hook para actualizar habitación
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoom }) =>
      FrontdeskService.updateRoom(id, data),
    onSuccess: (updatedRoom) => {
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.rooms() });
      queryClient.setQueryData(frontdeskKeys.room(updatedRoom.id), updatedRoom);
      toast.success('Habitación actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating room:', error);
      toast.error('Error al actualizar habitación');
    },
  });
}

/**
 * Hook para crear reservación rápida
 */
export function useCreateQuickReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuickReservation) => FrontdeskService.createQuickReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.stats() });
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.reservations() });
      toast.success('Reservación creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating reservation:', error);
      toast.error('Error al crear reservación');
    },
  });
}

/**
 * Hook para realizar check-in
 */
export function useCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckIn) => FrontdeskService.checkIn(data),
    onSuccess: (updatedRoom) => {
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.stats() });
      queryClient.setQueryData(frontdeskKeys.room(updatedRoom.id), updatedRoom);
      toast.success('Check-in realizado correctamente');
    },
    onError: (error) => {
      console.error('Error during check-in:', error);
      toast.error('Error al realizar check-in');
    },
  });
}

/**
 * Hook para realizar check-out
 */
export function useCheckOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOut) => FrontdeskService.checkOut(data),
    onSuccess: (updatedRoom) => {
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: frontdeskKeys.stats() });
      queryClient.setQueryData(frontdeskKeys.room(updatedRoom.id), updatedRoom);
      toast.success('Check-out realizado correctamente');
    },
    onError: (error) => {
      console.error('Error during check-out:', error);
      toast.error('Error al realizar check-out');
    },
  });
}

// =================== UTILITY HOOKS ===================

/**
 * Hook para invalidar todas las queries de frontdesk
 */
export function useInvalidateFrontdesk() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: frontdeskKeys.all });
  };
}
