import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  identificationNumber: string;
}

interface StayData {
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  adultos: number;
  ninos: number;
  bebes: number;
  paymentMethod?: string;
  observacion_checkin?: string;
}

interface WalkInResult {
  success: boolean;
  folioId?: number;
}

/**
 * Hook para manejar Walk-Ins (check-in sin reserva previa)
 * Maneja tanto huéspedes nuevos como existentes
 */
export const useWalkIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Realiza walk-in con un huésped nuevo
   */
  const performWalkInWithNewGuest = async (
    guestData: GuestData,
    stayData: StayData
  ): Promise<WalkInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('🆕 Walk-In con huésped NUEVO:', {
        guest: guestData,
        stay: stayData
      });

      // NOTA: Funcionalidad de Walk-In con huésped nuevo en desarrollo
      // Se requiere integración con backend para crear huésped y reserva
      
      // Validaciones básicas
      if (!guestData.firstName || !guestData.lastName) {
        throw new Error('Nombre y apellido son requeridos');
      }
      
      if (!guestData.email) {
        throw new Error('Email es requerido para Walk-In');
      }
      
      if (!guestData.phone) {
        throw new Error('Teléfono es requerido para Walk-In');
      }
      
      if (!guestData.identificationNumber) {
        throw new Error('Número de identificación es requerido');
      }
      
      if (!stayData.roomNumber) {
        throw new Error('Número de habitación es requerido');
      }

      console.log('⚠️ Walk-In con huésped nuevo aún no está completamente implementado');
      console.log('📝 Datos del huésped:', guestData);
      console.log('🏨 Datos de la estancia:', stayData);

      // NOTA: Implementación temporal - se requiere integración completa con backend
      
      // Invalidar queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['guests'] }),
        queryClient.invalidateQueries({ queryKey: ['checkIns'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      ]);

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en Walk-In con huésped nuevo';
      console.error('❌ Error en Walk-In (nuevo):', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Realiza walk-in con un huésped existente
   */
  const performWalkInWithExistingGuest = async (
    guestId: number,
    stayData: StayData
  ): Promise<WalkInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('👥 Walk-In con huésped EXISTENTE:', {
        guestId,
        stay: stayData
      });

      // Validaciones básicas
      if (!guestId || guestId <= 0) {
        throw new Error('ID de huésped inválido');
      }
      
      if (!stayData.roomNumber) {
        throw new Error('Número de habitación es requerido');
      }

      console.log('⚠️ Walk-In con huésped existente aún no está completamente implementado');
      console.log('👤 ID del huésped:', guestId);
      console.log('🏨 Datos de la estancia:', stayData);

      // NOTA: Implementación temporal - se requiere integración completa con backend
      
      // Invalidar queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checkIns'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
      ]);

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en Walk-In con huésped existente';
      console.error('❌ Error en Walk-In (existente):', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    performWalkInWithNewGuest,
    performWalkInWithExistingGuest,
    isSubmitting,
    error,
    clearError,
  };
};

export default useWalkIn;
