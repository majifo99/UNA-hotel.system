import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  UpdateGuestData, 
  GuestSearchFilters 
} from '../types';
import guestApiService from '../services/guestApiService';
import { toast } from 'sonner';

// Use the original service
const activeGuestService = guestApiService;

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
    queryFn: () => activeGuestService.searchGuests(searchFilters),
    enabled: true
  });

  // Mutation para crear huésped
  const createGuestMutation = useMutation({
    mutationFn: activeGuestService.createGuest,
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      const fullLastName = newGuest.secondLastName 
        ? `${newGuest.firstLastName} ${newGuest.secondLastName}`
        : newGuest.firstLastName;
      toast.success(`Huésped ${newGuest.firstName} ${fullLastName} creado exitosamente`);
    },
    onError: (error) => {
      console.error('Error creating guest:', error);
      toast.error('Error al crear huésped');
    }
  });

  // Mutation para actualizar huésped
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestData }) => 
      activeGuestService.updateGuest(id, data),
    onSuccess: (updatedGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      const fullLastName = updatedGuest.secondLastName 
        ? `${updatedGuest.firstLastName} ${updatedGuest.secondLastName}`
        : updatedGuest.firstLastName;
      toast.success(`Huésped ${updatedGuest.firstName} ${fullLastName} actualizado`);
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
    // Additional utilities
    getGuestById: activeGuestService.getGuestById,
    
    // Clear search
    clearSearch: () => setSearchFilters({})
  };
};

/**
 * Hook específico para obtener un huésped por ID
 */
export const useGuestById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return activeGuestService.getGuestById(id);
    },
    enabled: !!id, // Solo ejecutar si hay ID
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
