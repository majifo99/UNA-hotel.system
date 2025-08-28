import { useQuery } from '@tanstack/react-query';
import { reservationService } from '../../reservations/services/reservationService';
import { searchReservationByConfirmation, searchReservationByGuest } from '../services/apiService';

// Configuration flag to switch between mock and real API
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

/**
 * Hook to search for reservations by confirmation number
 * 
 * In a real API implementation, this would make a direct API call to:
 * GET /api/reservations/search?confirmationNumber={confirmationNumber}
 */
export const useReservationSearch = (confirmationNumber: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['reservation-search', confirmationNumber],
    queryFn: async () => {
      try {
        if (USE_REAL_API) {
          // Use real API service
          return await searchReservationByConfirmation(confirmationNumber);
        } else {
          // Use mock service for development
          return await reservationService.getReservationByConfirmationNumber(confirmationNumber);
        }
      } catch (error) {
        console.error('Error searching reservation by confirmation number:', error);
        throw error;
      }
    },
    enabled: enabled && !!confirmationNumber.trim(),
    staleTime: 0, // Always fetch fresh data for search
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for "not found" errors
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('404')) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook to search for reservations by guest information
 * 
 * In a real API implementation, this would make a direct API call to:
 * GET /api/reservations/search?lastName={lastName}&documentNumber={identificationNumber}
 */
export const useReservationSearchByGuest = (lastName: string, identificationNumber: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['reservation-search-guest', lastName, identificationNumber],
    queryFn: async () => {
      try {
        if (USE_REAL_API) {
          // Use real API service
          return await searchReservationByGuest(lastName, identificationNumber);
        } else {
          // Use mock service for development
          const allReservations = await reservationService.getAllReservations();
          const reservation = allReservations.find(reservation => 
            reservation.guest?.lastName.toLowerCase() === lastName.toLowerCase() &&
            reservation.guest?.documentNumber === identificationNumber
          );
          return reservation || null;
        }
      } catch (error) {
        console.error('Error searching reservation by guest info:', error);
        throw error;
      }
    },
    enabled: enabled && !!lastName.trim() && !!identificationNumber.trim(),
    staleTime: 0,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for "not found" errors
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('404')) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
