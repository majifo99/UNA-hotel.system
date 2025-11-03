/**
 * Legacy API Types
 * 
 * Tipos que representan la estructura de datos del backend (snake_case).
 * Estos tipos corresponden a las respuestas de la API legacy.
 * 
 * Para la nueva API, ver: api-new.ts
 */

/**
 * ApiReservation
 * 
 * Estructura de una reserva retornada por el backend legacy.
 * Campos con los nombres exactos de la API (snake_case).
 */
export interface ApiReservation {
  id_reserva: number;
  id_cliente: number;
  id_estado_res: number;
  fecha_creacion?: string;
  total_monto_reserva: number;
  notas?: string | null;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * ApiGuest
 * 
 * Representación backend de un cliente/huésped.
 */
export interface ApiGuest {
  id_cliente: number;
  nombre: string;
  apellido1?: string | null;
  apellido2?: string | null;
  email?: string | null;
  telefono?: string | null;
  id_tipo_doc?: number | null;
  numero_doc?: string | null;
  nacionalidad?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  es_vip?: number | null;
  notas_personal?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * ApiEstado
 * 
 * Estado de una reserva en el backend.
 */
export interface ApiEstado {
  id_estado_res: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ApiFuente
 * 
 * Fuente de una reserva (Booking.com, directo, etc.).
 */
export interface ApiFuente {
  id_fuente: number;
  nombre: string;
  codigo?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * ApiReservaHabitacion
 * 
 * Asignación de habitación para una reserva en formato backend.
 */
export interface ApiReservaHabitacion {
  id_reserva_hab: number;
  id_reserva: number;
  id_habitacion: number;
  fecha_llegada: string; // ISO datetime
  fecha_salida: string;  // ISO date or datetime
  pax_total: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * ApiCreateReservaPayload
 * 
 * Payload para crear una reserva en el backend legacy.
 */
export interface ApiCreateReservaPayload {
  id_cliente: number;
  id_estado_res?: number;
  total_monto_reserva: number;
  notas?: string;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number;
}
