/**
 * Hook para obtener reservas del calendario
 */

import { useQuery } from '@tanstack/react-query';
import { frontdeskReservationService } from '../services/frontdeskReservationService';
import type { CalendarReservation } from '../services/frontdeskReservationService';

interface UseCalendarReservationsOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  enabled?: boolean;
}

export const useCalendarReservations = ({ startDate, endDate, enabled = true }: UseCalendarReservationsOptions) => {
  return useQuery<CalendarReservation[], Error>({
    queryKey: ['frontdesk-calendar-reservations', startDate, endDate],
    queryFn: () => frontdeskReservationService.getReservationsByDateRange(startDate, endDate),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
  });
};

export const useRoomReservations = (roomId: number, startDate: string, endDate: string) => {
  return useQuery<CalendarReservation[], Error>({
    queryKey: ['frontdesk-room-reservations', roomId, startDate, endDate],
    queryFn: () => frontdeskReservationService.getReservationsForRoom(roomId, startDate, endDate),
    staleTime: 1000 * 60 * 2,
  });
};
