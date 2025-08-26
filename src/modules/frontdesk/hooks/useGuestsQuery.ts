// hooks/useGuestsQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestApi } from '../services/guestService';
import type { Guest } from '../types/guest';

export const useGuestsQuery = () => {
  const queryClient = useQueryClient();

  const {
    data: guests = [],
    isLoading,
    isError,
  } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: guestApi.getAll,
  });

  const addGuest = useMutation({
    mutationFn: guestApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  });

  const updateGuest = useMutation({
    mutationFn: guestApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  });

  const deleteGuest = useMutation({
    mutationFn: guestApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  });

  return {
    guests,
    isLoading,
    isError,
    addGuest: addGuest.mutateAsync,
    updateGuest: updateGuest.mutateAsync,
    deleteGuest: deleteGuest.mutateAsync,
  };
};
