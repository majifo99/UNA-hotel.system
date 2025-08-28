import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  UpdateGuestData, 
  GuestSearchFilters 
} from '../types';
import { guestService } from '../services';
import { toast } from 'sonner';

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
    queryFn: () => guestService.searchGuests(searchFilters),
    enabled: true
  });

  // Mutation para crear huésped
  const createGuestMutation = useMutation({
    mutationFn: guestService.createGuest,
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
      guestService.updateGuest(id, data),
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
    getGuestById: guestService.getById,
    
    // Clear search
    clearSearch: () => setSearchFilters({})
  };
};
