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
      // Validación mejorada para walk-ins y reservas
      if (!data.roomNumber) {
        throw new Error('El número de habitación es requerido');
      }
      
      if (!data.guestName || data.guestName.trim() === '') {
        throw new Error('El nombre del huésped es requerido');
      }
      
      if (!data.identificationNumber) {
        throw new Error('El número de identificación es requerido');
      }
      
      if (!data.paymentMethod) {
        throw new Error('El método de pago es requerido');
      }
      
      // Validación específica para reservas existentes
      if (!data.isWalkIn && (!data.reservationId || data.reservationId === '')) {
        throw new Error('El ID de reserva es requerido para reservas existentes');
      }
      
      // Validación específica para walk-ins
      if (data.isWalkIn) {
        if (!data.guestEmail) {
          throw new Error('El email es requerido para walk-ins');
        }
        if (!data.guestPhone) {
          throw new Error('El teléfono es requerido para walk-ins');
        }
      }
      
      await createMutation.mutateAsync(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
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
