import apiClient from '../../../services/apiClient';

/**
 * Tipos para las solicitudes de modificación
 */
export interface CambiarHabitacionRequest {
  id_reserva_habitacion: number;
  id_habitacion_nueva: number;
  motivo: string;
}

export interface ModificarFechasRequest {
  id_reserva_habitacion: number;
  nueva_fecha_llegada?: string;
  nueva_fecha_salida?: string;
  aplicar_politica?: boolean;
}

export interface ReducirEstadiaRequest {
  id_reserva_habitacion: number;
  nueva_fecha_salida: string;
  aplicar_politica?: boolean;
}

/**
 * Tipos para las respuestas de modificación
 */
export interface CambiarHabitacionResponse {
  success: boolean;
  habitacion_antigua: {
    id: number;
    nombre: string;
    precio: number;
  };
  habitacion_nueva: {
    id: number;
    nombre: string;
    precio: number;
  };
  diferencia_precio: number;
  tipo_ajuste: 'cargo_adicional' | 'reembolso' | 'sin_cambio';
  monto_ajuste: number;
  reserva: {
    total_nuevo: number;
    monto_pagado: number;
    monto_pendiente: number;
  };
}

export interface ModificarFechasResponse {
  success: boolean;
  fechas_originales: {
    llegada: string;
    salida: string;
    noches: number;
  };
  fechas_nuevas: {
    llegada: string;
    salida: string;
    noches: number;
  };
  precios: {
    precio_anterior: number;
    precio_nuevo: number;
    diferencia: number;
    penalidad: number;
    ajuste_total: number;
  };
  politica: string;
  reserva: {
    total_nuevo: number;
    monto_pagado: number;
    monto_pendiente: number;
  };
}

export interface ReducirEstadiaResponse {
  success: boolean;
  reduccion: {
    noches_canceladas: number;
    noches_originales: number;
    noches_nuevas: number;
    fecha_salida_original: string;
    fecha_salida_nueva: string;
  };
  montos: {
    precio_original: number;
    precio_nuevo: number;
    monto_noches_canceladas: number;
    reembolso: number;
    penalidad: number;
  };
  politica: string;
  reserva: {
    total_nuevo: number;
    monto_pagado: number;
    monto_pendiente: number;
  };
}

/**
 * Servicio para modificaciones de reservas del Hotel Lanaku
 */
export class ModificacionReservaService {
  /**
   * Cambio de habitación sin extensión de fechas
   * 
   * @param idReserva ID de la reserva
   * @param data Datos del cambio de habitación
   * @returns Resultado del cambio con diferencias de precio
   */
  static async cambiarHabitacion(
    idReserva: number | string,
    data: CambiarHabitacionRequest
  ): Promise<CambiarHabitacionResponse> {
    try {
      console.log('🔄 Cambiando habitación:', { 
        idReserva, 
        data,
        dataTypes: {
          id_reserva_habitacion: typeof data.id_reserva_habitacion,
          id_habitacion_nueva: typeof data.id_habitacion_nueva,
          motivo: typeof data.motivo
        },
        valores: {
          id_reserva_habitacion: data.id_reserva_habitacion,
          id_habitacion_nueva: data.id_habitacion_nueva,
          motivo: data.motivo
        }
      });
      
      const response = await apiClient.post<CambiarHabitacionResponse>(
        `/reservas/${idReserva}/modificar/cambiar-habitacion`,
        data
      );
      
      console.log('✅ Habitación cambiada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al cambiar habitación:', error);
      console.error('❌ Detalles del error:', {
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('No se pudo cambiar la habitación. Por favor, intente nuevamente.');
    }
  }

  /**
   * Modificación de fechas (check-in y/o check-out)
   * 
   * @param idReserva ID de la reserva
   * @param data Datos de las nuevas fechas
   * @returns Resultado con nuevos precios y políticas aplicadas
   */
  static async modificarFechas(
    idReserva: number | string,
    data: ModificarFechasRequest
  ): Promise<ModificarFechasResponse> {
    try {
      console.log('📅 Modificando fechas:', { idReserva, data });
      
      const response = await apiClient.post<ModificarFechasResponse>(
        `/reservas/${idReserva}/modificar/cambiar-fechas`,
        data
      );
      
      console.log('✅ Fechas modificadas exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al modificar fechas:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('No se pudo modificar las fechas. Por favor, intente nuevamente.');
    }
  }

  /**
   * Reducción de estadía (checkout anticipado)
   * 
   * @param idReserva ID de la reserva
   * @param data Datos de la reducción
   * @returns Resultado con reembolsos y penalidades
   */
  static async reducirEstadia(
    idReserva: number | string,
    data: ReducirEstadiaRequest
  ): Promise<ReducirEstadiaResponse> {
    try {
      console.log('⏰ Reduciendo estadía:', { idReserva, data });
      
      const response = await apiClient.post<ReducirEstadiaResponse>(
        `/reservas/${idReserva}/modificar/reducir-estadia`,
        data
      );
      
      console.log('✅ Estadía reducida exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al reducir estadía:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('No se pudo reducir la estadía. Por favor, intente nuevamente.');
    }
  }

  /**
   * Validar disponibilidad de habitación para un rango de fechas
   */
  static async validarDisponibilidad(
    idHabitacion: number,
    fechaLlegada: string,
    fechaSalida: string
  ): Promise<{ disponible: boolean; mensaje?: string }> {
    try {
      const response = await apiClient.post('/habitaciones/validar-disponibilidad', {
        id_habitacion: idHabitacion,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error al validar disponibilidad:', error);
      
      if (error.response?.data?.message) {
        return {
          disponible: false,
          mensaje: error.response.data.message
        };
      }
      
      return {
        disponible: false,
        mensaje: 'No se pudo validar la disponibilidad'
      };
    }
  }
}

export default ModificacionReservaService;
