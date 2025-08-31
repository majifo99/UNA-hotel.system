import { useQuery } from '@tanstack/react-query';

// Mock data para desarrollo
const mockReservations = [
  {
    id: 'RES-001',
    confirmationNumber: 'CONF-2024-001',
    guestName: 'Juan Pérez',
    roomNumber: '101',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    status: 'confirmed'
  }
];

// Mock service
const mockReservationService = {
  getReservationByConfirmation: async (confirmationNumber: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const reservation = mockReservations.find(r => r.confirmationNumber === confirmationNumber);
        resolve(reservation || null);
      }, 300);
    });
  },
  searchByGuest: async (guestName: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const reservations = mockReservations.filter(r => 
          r.guestName.toLowerCase().includes(guestName.toLowerCase())
        );
        resolve(reservations);
      }, 300);
    });
  }
};

/**
 * Hook to search for reservations by confirmation number
 */
export const useReservationSearch = (confirmationNumber: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['reservation-search', confirmationNumber],
    queryFn: async () => {
      try {
        return await mockReservationService.getReservationByConfirmation(confirmationNumber);
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
 */
export const useReservationSearchByGuest = (lastName: string, identificationNumber: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['reservation-search-guest', lastName, identificationNumber],
    queryFn: async () => {
      try {
        return await mockReservationService.searchByGuest(lastName + ' ' + identificationNumber);
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
