/**
 * Tipos para Reservas Web (Clientes)
 * 
 * Tipos específicos para la API /api/reservas-web que usan los clientes finales.
 * Los clientes NO envían id_cliente (se toma del token automáticamente).
 * Las reservas web siempre se crean en estado "Confirmada" (ID 3) y fuente "Web" (ID 2).
 */

/**
 * Payload para crear una reserva web (desde cliente)
 * NO incluye id_cliente - se toma del token de autenticación
 * NO incluye id_estado_res - se establece automáticamente en 3 (Confirmada)
 * NO incluye id_fuente - se establece automáticamente en 2 (Web)
 */
export interface CreateReservaWebDto {
  /** Notas adicionales del cliente (opcional) */
  readonly notas?: string;
  
  /** Habitaciones a reservar (mínimo 1) */
  readonly habitaciones: ReadonlyArray<{
    readonly id_habitacion: number;
    readonly fecha_llegada: string; // YYYY-MM-DD
    readonly fecha_salida: string;  // YYYY-MM-DD
    readonly adultos: number;
    readonly ninos: number;
    readonly bebes: number;
  }>;
}

/**
 * Payload para actualizar una reserva web
 * Solo puede modificar reservas propias en estado Pendiente o Confirmada
 */
export interface UpdateReservaWebDto {
  /** Notas adicionales */
  readonly notas?: string;
  
  /** Actualizar número total de adultos */
  readonly numero_adultos?: number;
  
  /** Actualizar número total de niños */
  readonly numero_ninos?: number;
  
  /** Reemplazar habitaciones completamente (opcional) */
  readonly habitaciones?: ReadonlyArray<{
    readonly id_habitacion: number;
    readonly fecha_llegada: string;
    readonly fecha_salida: string;
    readonly adultos: number;
    readonly ninos: number;
    readonly bebes: number;
  }>;
}

/**
 * Payload para cancelar una reserva web
 */
export interface CancelReservaWebDto {
  /** Motivo de la cancelación (opcional) */
  readonly notas?: string;
}

/**
 * Filtros para listar reservas web (solo las propias)
 */
export interface ReservaWebFilters {
  /** Filtrar por estado (nombre del estado) */
  readonly estado?: string;
  
  /** Fecha desde (fecha de creación o llegada) */
  readonly desde?: string;
  
  /** Fecha hasta */
  readonly hasta?: string;
}

/**
 * Respuesta de la API para reserva web creada/actualizada
 * Incluye los campos automáticos establecidos por el backend
 */
export interface ReservaWebResponse {
  readonly id_reserva: number;
  readonly codigo_reserva: string;
  readonly id_cliente: number; // Tomado del token
  readonly id_estado_res: 3;   // Siempre "Confirmada" para web
  readonly id_fuente: 2;        // Siempre "Web"
  readonly fecha_creacion: string;
  readonly total_monto_reserva: number;
  readonly notas?: string;
  readonly cliente: {
    readonly id_cliente: number;
    readonly nombre: string;
    readonly apellido1: string;
    readonly email: string;
  };
  readonly estado: {
    readonly id_estado_res: number;
    readonly nombre: 'Confirmada' | 'Cancelada' | 'Pendiente';
  };
  readonly fuente: {
    readonly id_fuente: 2;
    readonly nombre: 'Web';
  };
  readonly habitaciones: ReadonlyArray<{
    readonly id_reserva_habitacion: number;
    readonly id_habitacion: number;
    readonly fecha_llegada: string;
    readonly fecha_salida: string;
    readonly adultos: number;
    readonly ninos: number;
    readonly bebes: number;
    readonly precio_total: number;
    readonly habitacion: {
      readonly id_habitacion: number;
      readonly nombre: string;
      readonly tipo: string;
    };
  }>;
}

/**
 * Respuesta exitosa de cancelación
 */
export interface CancelReservaWebResponse {
  readonly success: true;
  readonly message: string;
  readonly data: ReservaWebResponse;
}
