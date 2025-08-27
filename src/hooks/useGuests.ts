import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  GuestSearchFilters,
  GuestListResponse 
} from '../types/guest';
import { toast } from 'sonner';

// Mock service - en producción conectar con API real
const mockGuestService = {
  searchGuests: async (filters: GuestSearchFilters): Promise<GuestListResponse> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Datos mock para desarrollo
    const mockGuests: Guest[] = [
      {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+506 8888-9999',
        nationality: 'CR',
        documentType: 'id',
        documentNumber: '1-1234-5678',
        createdAt: '2025-08-20T10:00:00Z'
      },
      {
        id: '2',
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+1 555-0123',
        nationality: 'US',
        documentType: 'passport',
        documentNumber: 'US123456789',
        createdAt: '2025-08-21T15:30:00Z'
      }
    ];

    // Filtrar por query si existe
    let filteredGuests = mockGuests;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredGuests = mockGuests.filter(guest => 
        guest.firstName.toLowerCase().includes(query) ||
        guest.lastName.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        guest.documentNumber.toLowerCase().includes(query)
      );
    }

    return {
      guests: filteredGuests,
      total: filteredGuests.length,
      page: 1,
      limit: 10
    };
  },

  createGuest: async (guestData: CreateGuestData): Promise<Guest> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newGuest: Guest = {
      id: Date.now().toString(),
      ...guestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newGuest;
  },

  updateGuest: async (id: string, guestData: UpdateGuestData): Promise<Guest> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // En una app real, esto haría la actualización en el backend
    const updatedGuest: Guest = {
      id,
      firstName: guestData.firstName || '',
      lastName: guestData.lastName || '',
      email: guestData.email || '',
      phone: guestData.phone || '',
      nationality: guestData.nationality || '',
      documentType: guestData.documentType || 'id',
      documentNumber: guestData.documentNumber || '',
      updatedAt: new Date().toISOString()
    };

    return updatedGuest;
  }
};

export const useGuests = () => {
  const [searchFilters, setSearchFilters] = useState<GuestSearchFilters>({});
  const queryClient = useQueryClient();

  // Query para buscar huéspedes
  const {
    data: guestData,
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['guests', searchFilters],
    queryFn: () => mockGuestService.searchGuests(searchFilters),
    enabled: Object.keys(searchFilters).length > 0 || searchFilters.query !== undefined
  });

  // Mutation para crear huésped
  const createGuestMutation = useMutation({
    mutationFn: mockGuestService.createGuest,
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success(`Huésped ${newGuest.firstName} ${newGuest.lastName} creado exitosamente`);
    },
    onError: (error) => {
      console.error('Error creating guest:', error);
      toast.error('Error al crear huésped');
    }
  });

  // Mutation para actualizar huésped
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestData }) => 
      mockGuestService.updateGuest(id, data),
    onSuccess: (updatedGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success(`Huésped ${updatedGuest.firstName} ${updatedGuest.lastName} actualizado`);
    },
    onError: (error) => {
      console.error('Error updating guest:', error);
      toast.error('Error al actualizar huésped');
    }
  });

  return {
    // Data
    guests: guestData?.guests || [],
    totalGuests: guestData?.total || 0,
    
    // Loading states
    isSearching,
    isCreating: createGuestMutation.isPending,
    isUpdating: updateGuestMutation.isPending,
    
    // Error states
    searchError,
    createError: createGuestMutation.error,
    updateError: updateGuestMutation.error,
    
    // Actions
    searchGuests: (filters: GuestSearchFilters) => setSearchFilters(filters),
    createGuest: createGuestMutation.mutateAsync,
    updateGuest: (id: string, data: UpdateGuestData) => 
      updateGuestMutation.mutateAsync({ id, data }),
    
    // Clear search
    clearSearch: () => setSearchFilters({})
  };
};
