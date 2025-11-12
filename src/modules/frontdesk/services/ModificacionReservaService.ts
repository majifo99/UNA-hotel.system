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
      
      const response = await apiClient.post(`/reservas/${idReserva}/modificar/cambiar-habitacion`, data);

      console.log('✅ Raw response cambiarHabitacion:', response.data);

      // Desanidar de forma robusta: el backend puede devolver { success, message, data } o varias capas.
      let payload: any = response.data;
      // Evitar bucles infinitos si por alguna razón data referencia al mismo objeto
      while (payload && typeof payload === 'object' && 'data' in payload && payload.data !== payload) {
        payload = payload.data;
      }

      console.log('📦 Payload final (desanidado) cambiarHabitacion:', payload);

      // Validar que la payload tenga los campos esperados para evitar que el UI intente acceder a undefined
      if (!payload || typeof payload !== 'object' || !('habitacion_nueva' in payload) || !('habitacion_antigua' in payload)) {
        console.error('❌ Respuesta inesperada al cambiar habitación:', { raw: response.data, payload });
        // Lanzamos para que la mutation capture el error y el hook gestione el mensaje en UI
        throw new Error(response.data?.message || 'Respuesta inesperada del servidor al cambiar la habitación');
      }

      return payload as CambiarHabitacionResponse;
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
      
      const response = await apiClient.post(`/reservas/${idReserva}/modificar/cambiar-fechas`, data);

      console.log('✅ Raw response modificarFechas:', response.data);

      let payload: any = response.data;
      while (payload && typeof payload === 'object' && 'data' in payload && payload.data !== payload) {
        payload = payload.data;
      }

      console.log('📦 Payload final (desanidado) modificarFechas:', payload);

      if (!payload || typeof payload !== 'object' || !('fechas_nuevas' in payload) || !('fechas_originales' in payload)) {
        console.error('❌ Respuesta inesperada al modificar fechas:', { raw: response.data, payload });
        throw new Error(response.data?.message || 'Respuesta inesperada del servidor al modificar fechas');
      }

      return payload as ModificarFechasResponse;
    } catch (error: any) {
      console.error('❌ Error al modificar fechas:', error);
      console.error('❌ Detalles del error:', {
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
        data: error.response?.data
      });
      
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
      
      const response = await apiClient.post(`/reservas/${idReserva}/modificar/reducir-estadia`, data);

      console.log('✅ Raw response reducirEstadia:', response.data);

      let payload: any = response.data;
      while (payload && typeof payload === 'object' && 'data' in payload && payload.data !== payload) {
        payload = payload.data;
      }

      console.log('📦 Payload final (desanidado) reducirEstadia:', payload);

      if (!payload || typeof payload !== 'object' || !('reduccion' in payload) || !('montos' in payload)) {
        console.error('❌ Respuesta inesperada al reducir estadía:', { raw: response.data, payload });
        throw new Error(response.data?.message || 'Respuesta inesperada del servidor al reducir la estadía');
      }

      return payload as ReducirEstadiaResponse;
    } catch (error: any) {
      console.error('❌ Error al reducir estadía:', error);
      console.error('❌ Detalles del error:', {
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('No se pudo reducir la estadía. Por favor, intente nuevamente.');
    }
  }

  /**
   * Validar disponibilidad de habitación para un rango de fechas
   * Usa el endpoint de reservas para verificar si hay conflictos
   */
  static async validarDisponibilidad(
    idHabitacion: number,
    fechaLlegada: string,
    fechaSalida: string,
    idReservaActual?: string | number // Excluir la reserva actual del chequeo
  ): Promise<{ disponible: boolean; mensaje?: string }> {
    try {
      console.log('🔍 Validando disponibilidad:', {
        idHabitacion,
        fechaLlegada,
        fechaSalida,
        idReservaActual
      });

      // Obtener todas las reservas en el rango de fechas
      const response = await apiClient.get('/reservas', {
        params: {
          fecha_llegada: fechaLlegada,
          fecha_salida: fechaSalida,
          estado: 'Confirmada,Pendiente,CheckIn' // Solo reservas activas
        }
      });

      console.log('📋 Reservas en el rango de fechas:', response.data);

      // Extraer las reservas del response
      interface ReservaApi {
        id: string | number;
        codigo_reserva?: string;
        habitacion?: { id: number };
        habitaciones?: Array<{ id_habitacion: number }>;
        id_habitacion?: number;
        room?: { id: number };
        fecha_llegada?: string;
        fecha_salida?: string;
        checkInDate?: string;
        checkOutDate?: string;
      }

      let reservas: ReservaApi[] = [];
      if (Array.isArray(response.data)) {
        reservas = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        reservas = response.data.data;
      } else if (response.data?.reservas && Array.isArray(response.data.reservas)) {
        reservas = response.data.reservas;
      }

      console.log('🔎 Total de reservas activas encontradas:', reservas.length);

      // Verificar si alguna reserva usa la habitación en las fechas solicitadas
      const conflictos = reservas.filter((reserva: ReservaApi) => {
        // Excluir la reserva actual (la que estamos modificando)
        if (idReservaActual && (reserva.id === idReservaActual || reserva.id.toString() === idReservaActual.toString())) {
          console.log('⏭️ Omitiendo reserva actual:', reserva.id);
          return false;
        }

        // La habitación puede estar en diferentes estructuras según el endpoint
        const habitacionId = 
          reserva.habitacion?.id || 
          reserva.habitaciones?.[0]?.id_habitacion || 
          reserva.id_habitacion ||
          reserva.room?.id;

        const esLaMismaHabitacion = habitacionId === idHabitacion;

        if (esLaMismaHabitacion) {
          console.log('⚠️ Conflicto encontrado:', {
            reservaId: reserva.id,
            codigoReserva: reserva.codigo_reserva,
            habitacionId,
            fechas: {
              llegada: reserva.fecha_llegada || reserva.checkInDate,
              salida: reserva.fecha_salida || reserva.checkOutDate
            }
          });
        }

        return esLaMismaHabitacion;
      });

      if (conflictos.length > 0) {
        const primeraConflicto = conflictos[0];
        return {
          disponible: false,
          mensaje: `Habitación ocupada por la reserva ${primeraConflicto.codigo_reserva || primeraConflicto.id} del ${primeraConflicto.fecha_llegada || primeraConflicto.checkInDate} al ${primeraConflicto.fecha_salida || primeraConflicto.checkOutDate}`
        };
      }

      console.log('✅ Habitación disponible - No hay conflictos');
      
      return {
        disponible: true,
        mensaje: 'Habitación disponible para las fechas seleccionadas'
      };
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      console.error('❌ Error al validar disponibilidad:', error);
      
      // Si no hay reservas, la habitación está disponible
      if (err.response?.status === 404 || err.response?.data?.message?.includes('No se encontraron')) {
        return {
          disponible: true,
          mensaje: 'Habitación disponible (sin reservas en el período)'
        };
      }
      
      if (err.response?.data?.message) {
        return {
          disponible: false,
          mensaje: err.response.data.message
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
