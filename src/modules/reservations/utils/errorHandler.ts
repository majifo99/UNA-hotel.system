/**
 * Error Handler for Reservation Module
 * 
 * Mapea errores del backend a mensajes amigables y accionables
 */

import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export interface ErrorAction {
  label: string;
  action: string;
  onClick?: () => void;
}

export interface ErrorMapping {
  title: string;
  message: string;
  actions?: ErrorAction[];
}

/**
 * Mapeo de errores conocidos del backend
 */
export const ERROR_MAPPINGS: Record<string, ErrorMapping> = {
  // Errores de capacidad
  'capacidad_excedida': {
    title: 'Capacidad Excedida',
    message: 'La habitación seleccionada no puede acomodar esa cantidad de huéspedes',
    actions: [
      { label: 'Ver habitaciones más grandes', action: 'show_alternatives' }
    ]
  },
  'capacity_exceeded': {
    title: 'Capacidad Excedida',
    message: 'El número de huéspedes excede la capacidad de la habitación',
    actions: [
      { label: 'Ver habitaciones disponibles', action: 'show_alternatives' }
    ]
  },

  // Errores de disponibilidad
  'habitacion_no_disponible': {
    title: 'Habitación No Disponible',
    message: 'La habitación está ocupada en las fechas seleccionadas',
    actions: [
      { label: 'Ver habitaciones alternativas', action: 'show_alternatives' },
      { label: 'Cambiar fechas', action: 'modify_dates' }
    ]
  },
  'room_not_available': {
    title: 'Habitación No Disponible',
    message: 'Esta habitación no está disponible para las fechas seleccionadas',
    actions: [
      { label: 'Ver alternativas', action: 'show_alternatives' }
    ]
  },
  'overlapping_reservation': {
    title: 'Conflicto de Reserva',
    message: 'Ya existe una reserva que solapa con estas fechas',
    actions: [
      { label: 'Ver detalles', action: 'show_conflict_details' }
    ]
  },

  // Errores de pago
  'pago_insuficiente': {
    title: 'Pago Insuficiente',
    message: 'Se requiere al menos 30% del total para confirmar la reserva',
    actions: [
      { label: 'Ver métodos de pago', action: 'show_payment_methods' }
    ]
  },
  'insufficient_payment': {
    title: 'Pago Insuficiente',
    message: 'El monto pagado no alcanza el mínimo requerido',
  },

  // Errores de validación
  'invalid_dates': {
    title: 'Fechas Inválidas',
    message: 'La fecha de salida debe ser posterior a la fecha de entrada',
  },
  'fecha_salida_invalida': {
    title: 'Fechas Inválidas',
    message: 'La fecha de salida debe ser después de la fecha de entrada',
  },
  'past_date': {
    title: 'Fecha en el Pasado',
    message: 'No se pueden hacer reservas para fechas pasadas',
  },

  // Errores de estado
  'invalid_state_transition': {
    title: 'Transición de Estado Inválida',
    message: 'No se puede cambiar al estado solicitado desde el estado actual',
  },
  'reservation_already_cancelled': {
    title: 'Reserva Cancelada',
    message: 'Esta reserva ya ha sido cancelada y no se puede modificar',
  },

  // Errores de datos
  'guest_not_found': {
    title: 'Huésped No Encontrado',
    message: 'El huésped seleccionado no existe en el sistema',
    actions: [
      { label: 'Crear nuevo huésped', action: 'create_guest' }
    ]
  },
  'room_not_found': {
    title: 'Habitación No Encontrada',
    message: 'La habitación seleccionada no existe',
  },
};

/**
 * Extrae el código de error del backend
 */
function extractErrorCode(error: AxiosError): string | null {
  const data = error.response?.data as any;
  
  // Intentar diferentes formatos de respuesta
  if (data?.code) return data.code;
  if (data?.error_code) return data.error_code;
  if (data?.type) return data.type;
  
  // Buscar en el mensaje
  const message = data?.message || data?.error || '';
  
  // Detectar patrones comunes en mensajes
  if (message.toLowerCase().includes('capacidad')) return 'capacidad_excedida';
  if (message.toLowerCase().includes('capacity')) return 'capacity_exceeded';
  if (message.toLowerCase().includes('disponible') || message.toLowerCase().includes('available')) {
    return 'habitacion_no_disponible';
  }
  if (message.toLowerCase().includes('fecha') && message.toLowerCase().includes('salida')) {
    return 'fecha_salida_invalida';
  }
  
  return null;
}

/**
 * Maneja errores de API y muestra toast apropiado
 */
export function handleReservationError(
  error: unknown,
  context: string = 'operación',
  onAction?: (actionType: string) => void
): void {
  console.error(`[${context}] Error:`, error);

  if (!error || typeof error !== 'object') {
    toast.error('Error desconocido', {
      description: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    });
    return;
  }

  const axiosError = error as AxiosError;
  
  // Error de red
  if (!axiosError.response) {
    toast.error('Error de Conexión', {
      description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    });
    return;
  }

  const statusCode = axiosError.response.status;
  const errorData = axiosError.response.data as any;

  // Errores de validación (422)
  if (statusCode === 422 && errorData?.errors) {
    const validationErrors = errorData.errors;
    const firstError = Object.values(validationErrors)[0] as string[];
    
    toast.error('Error de Validación', {
      description: Array.isArray(firstError) ? firstError[0] : String(firstError),
    });
    return;
  }

  // Buscar mapeo de error
  const errorCode = extractErrorCode(axiosError);
  const errorMapping = errorCode ? ERROR_MAPPINGS[errorCode] : null;

  if (errorMapping) {
    // Error mapeado - mostrar mensaje amigable
    toast.error(errorMapping.title, {
      description: errorMapping.message,
      action: errorMapping.actions?.[0] ? {
        label: errorMapping.actions[0].label,
        onClick: () => {
          if (errorMapping.actions![0].onClick) {
            errorMapping.actions![0].onClick();
          } else if (onAction) {
            onAction(errorMapping.actions![0].action);
          }
        },
      } : undefined,
      duration: 6000,
    });
  } else {
    // Error genérico con mensaje del backend
    const backendMessage = errorData?.message || errorData?.error;
    
    toast.error(`Error en ${context}`, {
      description: backendMessage || 'Ocurrió un error. Por favor intenta nuevamente.',
      duration: 5000,
    });
  }
}

/**
 * Helper para validaciones pre-submit
 */
export function showValidationWarning(
  field: string,
  issue: string,
  suggestion?: string
): void {
  toast.warning(`Atención: ${field}`, {
    description: `${issue}${suggestion ? ` ${suggestion}` : ''}`,
    duration: 5000,
  });
}

/**
 * Helper para mensajes de éxito
 */
export function showSuccessMessage(
  title: string,
  description?: string,
  action?: { label: string; onClick: () => void }
): void {
  toast.success(title, {
    description,
    action,
    duration: 4000,
  });
}
