import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckInData } from '../types/checkin';
import { checkInSchema } from '../schemas/checkinSchema';
import { z } from 'zod';
import checkinService from '../services/checkinService';

export const useCheckIn = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: checkIns = [], isLoading: isLoadingCheckIns } = useQuery<CheckInData[]>({
    queryKey: ['checkIns'],
    queryFn: () => checkinService.getCheckIns(),
    onError: (err: unknown) => {
      console.error('Error loading check-ins:', err);
      setError('Failed to load check‑ins');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CheckInData) => checkinService.createCheckIn(data),
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
      const sanitized = checkInSchema.parse(data);
      await createMutation.mutateAsync(sanitized);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? 'Validation failed');
      } else {
        setError('Unexpected error');
      }
      return false;
    }
  };

  return {
    checkIns,
    isLoadingCheckIns,
    isSubmitting: createMutation.isLoading,
    error,
    validateAndSubmit,
  };
};
