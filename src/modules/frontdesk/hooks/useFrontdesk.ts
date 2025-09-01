import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FrontdeskService from '../services/frontdeskService';
import type { Room } from '../../../types/core';
import type { RoomFilters } from '../types';

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
