import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { checkInApiService } from '../services/checkInApiService';
import type { CheckInData } from '../types/checkin';

interface CheckInResult {
  success: boolean;
  folioId?: number;
  requiresChargeDistribution: boolean;
}

interface CheckInValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Hook mejorado para Check-In con validación robusta y tipado fuerte
 * Utiliza el nuevo servicio de API con validaciones previas
 */
export const useCheckInImproved = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [folioId, setFolioId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  /**
   * Valida los datos básicos del check-in
   */
  const validateCheckInData = (data: CheckInData): CheckInValidationResult => {
    const errors: string[] = [];

    // Validaciones básicas
    if (!data.roomNumber?.trim()) {
      errors.push('El número de habitación es requerido');
    }

    if (!data.guestName?.trim()) {
      errors.push('El nombre del huésped es requerido');
    }

    if (!data.identificationNumber?.trim()) {
      errors.push('El número de identificación es requerido');
    }

    if (!data.paymentMethod) {
      errors.push('El método de pago es requerido');
    }

    // Validación de fechas
    if (!data.checkInDate) {
      errors.push('La fecha de llegada es requerida');
    }

    if (!data.checkOutDate) {
      errors.push('La fecha de salida es requerida');
    }

    if (data.checkInDate && data.checkOutDate) {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      
      if (checkOut <= checkIn) {
        errors.push('La fecha de salida debe ser posterior a la fecha de llegada');
      }
    }

    // Validación de huéspedes
    if (!data.adultos || data.adultos < 1) {
      errors.push('Debe haber al menos 1 adulto');
    }

    // Validaciones específicas para reservas existentes
    if (!data.isWalkIn) {
      if (!data.reservationId?.trim()) {
        errors.push('El ID de reserva es requerido para reservas existentes');
      }
    }

    // Validaciones específicas para walk-ins
    if (data.isWalkIn) {
      if (!data.guestEmail?.trim()) {
        errors.push('El email es requerido para walk-ins');
      }

      if (!data.guestPhone?.trim()) {
        errors.push('El teléfono es requerido para walk-ins');
      }

      if (!data.guestNationality?.trim()) {
        errors.push('La nacionalidad es requerida para walk-ins');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Realiza el check-in con validación y manejo de errores mejorado
   */
  const validateAndSubmit = async (data: CheckInData): Promise<CheckInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('🔍 Iniciando proceso de check-in:', {
        tipo: data.isWalkIn ? 'Walk-In' : 'Reserva',
        reservationId: data.reservationId,
        roomNumber: data.roomNumber,
        guestName: data.guestName
      });

      // 1. Validar datos localmente
      const validation = validateCheckInData(data);
      if (!validation.isValid) {
        const errorMessage = `Errores de validación:\n${validation.errors.join('\n')}`;
        throw new Error(errorMessage);
      }

      // 2. Preparar datos para el backend (sin clienteId - el backend lo maneja)
      const reservaIdNumerico = parseInt(data.reservationId, 10);
      if (isNaN(reservaIdNumerico)) {
        throw new Error(`ID de reserva debe ser numérico: ${data.reservationId}`);
      }

      // 3. Llamar al servicio de API con check-in directo
      // Usar método simple para testing primero
      console.log('🧪 Usando método simple para testing...');
      const response = await checkInApiService.performSimpleCheckIn(reservaIdNumerico, {
        roomNumber: data.roomNumber,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        observacion_checkin: data.observacion_checkin
      });

      console.log('✅ Check-in completado exitosamente:', response);

      // 4. Actualizar estado local
      const folioId = response.data?.id;
      if (folioId) {
        setFolioId(folioId);
      }

      // 5. Invalidar queries relacionadas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checkIns'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['estadias'] })
      ]);

      return {
        success: true,
        folioId,
        requiresChargeDistribution: data.requiereDivisionCargos || false
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado durante el check-in';
      console.error('❌ Error en check-in:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        requiresChargeDistribution: false
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
    isSubmitting,
    error,
    folioId,
    validateAndSubmit,
    clearError,
  };
};

export default useCheckInImproved;