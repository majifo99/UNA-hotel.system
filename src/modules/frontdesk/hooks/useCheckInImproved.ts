import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { checkInApiService } from '../services/checkInApiService';
import type { CheckInData } from '../types/checkin';
import type { CheckInResponse } from '../types/checkin-api';

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

    // Validaciones básicas requeridas
    validateRequiredFields(data, errors);

    // Validación de fechas
    validateDates(data, errors);

    // Validación de huéspedes
    validateGuests(data, errors);

    // Validaciones específicas por tipo
    validateByType(data, errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Valida campos requeridos básicos
   */
  const validateRequiredFields = (data: CheckInData, errors: string[]) => {
    const requiredFields = [
      { value: data.roomNumber?.trim(), message: 'El número de habitación es requerido' },
      { value: data.guestName?.trim(), message: 'El nombre del huésped es requerido' },
      { value: data.identificationNumber?.trim(), message: 'El número de identificación es requerido' },
      { value: data.paymentMethod, message: 'El método de pago es requerido' }
    ];

    requiredFields.forEach(field => {
      if (!field.value) {
        errors.push(field.message);
      }
    });
  };

  /**
   * Valida las fechas de check-in y check-out
   */
  const validateDates = (data: CheckInData, errors: string[]) => {
    if (!data.checkInDate) {
      errors.push('La fecha de llegada es requerida');
      return;
    }

    if (!data.checkOutDate) {
      errors.push('La fecha de salida es requerida');
      return;
    }

    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    if (checkOut <= checkIn) {
      errors.push('La fecha de salida debe ser posterior a la fecha de llegada');
    }
  };

  /**
   * Valida la información de huéspedes
   */
  const validateGuests = (data: CheckInData, errors: string[]) => {
    if (!data.adultos || data.adultos < 1) {
      errors.push('Debe haber al menos 1 adulto');
    }
  };

  /**
   * Valida campos específicos según el tipo (walk-in vs reserva)
   */
  const validateByType = (data: CheckInData, errors: string[]) => {
    if (data.isWalkIn) {
      validateWalkInFields(data, errors);
    } else {
      validateReservationFields(data, errors);
    }
  };

  /**
   * Valida campos específicos para walk-ins
   */
  const validateWalkInFields = (data: CheckInData, errors: string[]) => {
    const walkInFields = [
      { value: data.guestEmail?.trim(), message: 'El email es requerido para walk-ins' },
      { value: data.guestPhone?.trim(), message: 'El teléfono es requerido para walk-ins' },
      { value: data.guestNationality?.trim(), message: 'La nacionalidad es requerida para walk-ins' }
    ];

    walkInFields.forEach(field => {
      if (!field.value) {
        errors.push(field.message);
      }
    });
  };

  /**
   * Valida campos específicos para reservas existentes
   */
  const validateReservationFields = (data: CheckInData, errors: string[]) => {
    if (!data.reservationId?.trim()) {
      errors.push('El ID de reserva es requerido para reservas existentes');
    }
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
      // El ID de reserva puede ser alfanumérico
      const reservaId = data.reservationId.trim();
      if (!reservaId) {
        throw new Error('El ID de reserva no puede estar vacío');
      }

      // 3. Validar formato de datos localmente (sin hacer GET al backend)
      console.log('🔍 Validando formato de datos localmente...');
      
      // Validaciones básicas adicionales
      if (!data.roomNumber || data.roomNumber.trim() === '') {
        throw new Error('El número de habitación es requerido');
      }
      
      if (isNaN(parseInt(data.roomNumber, 10))) {
        throw new Error('El número de habitación debe ser numérico');
      }
      
      if (!data.checkInDate || !data.checkOutDate) {
        throw new Error('Las fechas de check-in y check-out son requeridas');
      }
      
      const checkInDate = new Date(data.checkInDate);
      const checkOutDate = new Date(data.checkOutDate);
      
      if (checkOutDate <= checkInDate) {
        throw new Error('La fecha de salida debe ser posterior a la fecha de llegada');
      }
      
      console.log('✅ Validación local completada');

      // 4. Llamar al servicio de API apropiado según el tipo de check-in
      let response;
      
      // Flag para alternar entre métodos (configurable)
      const useExactFormat = true; // Cambiar a false para usar métodos originales
      
      if (useExactFormat) {
        // Usar formato exacto como el POST proporcionado
        console.log('🎯 Usando formato exacto del POST con validación previa...');
        response = await checkInApiService.performExactCheckIn(reservaId, {
          roomNumber: data.roomNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          adultos: data.adultos,
          ninos: data.ninos,
          bebes: data.bebes,
          observacion_checkin: data.observacion_checkin
        });
      } else if (data.isWalkIn) {
        // Para walk-ins, usar método simple con datos fijos
        console.log('🧪 Walk-in: usando método simple...');
        response = await checkInApiService.performSimpleCheckIn(reservaId, {
          roomNumber: data.roomNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          adultos: data.adultos,
          ninos: data.ninos,
          bebes: data.bebes,
          observacion_checkin: data.observacion_checkin
        });
      } else {
        // Para reservas existentes, usar método directo
        console.log('🚀 Reserva existente: usando método directo...');
        response = await checkInApiService.performDirectCheckIn(reservaId, {
          reservationId: data.reservationId,
          roomNumber: data.roomNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          adultos: data.adultos,
          ninos: data.ninos,
          bebes: data.bebes,
          observacion_checkin: data.observacion_checkin
        });
      }

      console.log('✅ Check-in completado exitosamente:', response);

      // 4. Log detallado de la respuesta con metadatos
      if ('endpointUsado' in response && 'reservaId' in response && 'origenDatos' in response) {
        const checkInResponse = response as CheckInResponse;
        console.log('📊 Metadatos del check-in:', {
          reservaId: checkInResponse.reservaId,
          origenDatos: checkInResponse.origenDatos,
          endpointUsado: checkInResponse.endpointUsado,
          datosUsados: {
            clienteId: checkInResponse.data?.id_cliente_titular,
            habitacionId: checkInResponse.data?.id_hab,
            fechas: {
              llegada: checkInResponse.data?.fecha_llegada,
              salida: checkInResponse.data?.fecha_salida
            },
            huespedes: {
              adultos: checkInResponse.data?.adultos,
              ninos: checkInResponse.data?.ninos,
              bebes: checkInResponse.data?.bebes
            }
          }
        });
      }

      // 5. Actualizar estado local
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