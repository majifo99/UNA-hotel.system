/**
 * Hook para obtener reservas por huésped
 * Similar al patrón usado en check-in pero específico para cambio de habitación
 */

import { useQuery } from '@tanstack/react-query';
import type { Reservation } from '../../reservations/types';
import { reservationService } from '../../reservations/services/reservationService';

/**
 * Hook para obtener la reserva activa de un huésped específico
 */
export const useReservationByGuest = (guestId: string) => {
  return useQuery({
    queryKey: ['reservations', 'by-guest', guestId],
    queryFn: async (): Promise<Reservation | null> => {
      if (!guestId) return null;
      
      console.log(`🔍 Buscando reserva activa para huésped: ${guestId}`);
      
      try {
        // Primero intentar obtener todas las reservas y filtrar por huésped
        const allReservations = await reservationService.getAllReservations();
        
        // Buscar reserva activa (checked_in o confirmed) para el huésped
        const activeReservation = allReservations.find(reservation => {
          const matchesGuest = reservation.guestId === guestId || 
                              reservation.guest?.id === guestId;
          
          const isActive = reservation.status === 'checked_in' || 
                          reservation.status === 'confirmed';
          
          return matchesGuest && isActive;
        });
        
        if (activeReservation) {
          console.log('✅ Reserva activa encontrada:', activeReservation);
          return activeReservation;
        }
        
        console.log('⚠️ No se encontró reserva activa para el huésped');
        return null;
        
      } catch (error) {
        console.error('❌ Error buscando reserva del huésped:', error);
        throw error;
      }
    },
    enabled: !!guestId, // Solo ejecutar cuando tengamos un guestId
    staleTime: 30 * 1000, // 30 segundos
    retry: 1, // Intentar solo una vez más en caso de error
  });
};

/**
 * Hook para buscar reservas por nombre de huésped
 */
export const useReservationByGuestName = (guestName: string) => {
  return useQuery({
    queryKey: ['reservations', 'by-guest-name', guestName],
    queryFn: async (): Promise<Reservation[]> => {
      if (!guestName || guestName.trim().length < 2) return [];
      
      console.log(`🔍 Buscando reservas por nombre: ${guestName}`);
      
      try {
        const allReservations = await reservationService.getAllReservations();
        
        const matchingReservations = allReservations.filter(reservation => {
          if (!reservation.guest) return false;
          
          const fullName = `${reservation.guest.firstName} ${reservation.guest.firstLastName || ''}`.toLowerCase();
          const searchTerm = guestName.toLowerCase().trim();
          
          const matchesName = fullName.includes(searchTerm) ||
                             reservation.guest.firstName.toLowerCase().includes(searchTerm) ||
                             (reservation.guest.firstLastName && reservation.guest.firstLastName.toLowerCase().includes(searchTerm));
          
          // Solo reservas activas
          const isActive = reservation.status === 'checked_in' || 
                          reservation.status === 'confirmed' ||
                          reservation.status === 'pending';
          
          return matchesName && isActive;
        });
        
        console.log(`✅ Encontradas ${matchingReservations.length} reservas para: ${guestName}`);
        return matchingReservations;
        
      } catch (error) {
        console.error('❌ Error buscando reservas por nombre:', error);
        return [];
      }
    },
    enabled: !!guestName && guestName.trim().length >= 2,
    staleTime: 60 * 1000, // 1 minuto
  });
};

/**
 * Hook para obtener reserva por ID de reserva (igual al check-in)
 */
export const useReservationByIdForRoomChange = (reservationId: string) => {
  return useQuery({
    queryKey: ['reservations', 'room-change', reservationId],
    queryFn: async (): Promise<Reservation | null> => {
      if (!reservationId) return null;
      
      console.log(`🔍 Obteniendo reserva para cambio de habitación: ${reservationId}`);
      
      try {
        const reservation = await reservationService.getReservationById(reservationId);
        
        if (reservation) {
          console.log('✅ Reserva obtenida para cambio de habitación:', reservation);
          return reservation;
        }
        
        return null;
        
      } catch (error) {
        console.error('❌ Error obteniendo reserva:', error);
        throw error;
      }
    },
    enabled: !!reservationId,
    staleTime: 30 * 1000,
  });
};