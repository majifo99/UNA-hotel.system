import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckInData } from '../types/checkin';

// Mock data para desarrollo
const mockCheckIns: CheckInData[] = [];

// Simular servicio de check-in
const mockCheckinService = {
  getCheckIns: async (): Promise<CheckInData[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCheckIns), 300));
  },
  createCheckIn: async (data: CheckInData): Promise<CheckInData> => {
    return new Promise(resolve => {
      const newCheckIn = { ...data, id: Date.now().toString() };
      mockCheckIns.push(newCheckIn);
      setTimeout(() => resolve(newCheckIn), 300);
    });
  }
};

export const useCheckIn = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: checkIns = [], isLoading: isLoadingCheckIns, error: queryError } = useQuery({
    queryKey: ['checkIns'],
    queryFn: () => mockCheckinService.getCheckIns(),
  });

  // Handle query error
  if (queryError && !error) {
    setError('Failed to load check-ins');
  }

  const createMutation = useMutation({
    mutationFn: (data: CheckInData) => mockCheckinService.createCheckIn(data),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
    },
    onError: (err: unknown) => {
      console.error('Error creating check‑in:', err);
      setError((err instanceof Error) ? err.message : 'Unknown error');
    }
  });

  const validateAndSubmit = async (data: CheckInData) => {
    try {
      // Validación básica sin Zod
      if (!data.reservationId || !data.roomNumber) {
        throw new Error('Reservation ID and Room Number are required');
      }
      
      await createMutation.mutateAsync(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      return false;
    }
  };

  return {
    checkIns,
    isLoadingCheckIns,
    isSubmitting: createMutation.isPending,
    error,
    validateAndSubmit,
  };
};
