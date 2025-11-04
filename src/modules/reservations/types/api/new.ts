/**
 * New Backend API Types
 * 
 * Tipos que coinciden con la nueva estructura de la API /api/reservas
 * Estos tipos representan la respuesta completa y más detallada del backend.
 */

/**
 * ApiCliente
 * 
 * Cliente (Guest) tal como lo retorna la nueva API.
 * Incluye nombre_completo calculado por el backend.
 */
export interface ApiCliente {
  id_cliente: number;
  nombre: string;
  apellido1: string | null;
  apellido2: string | null;
  email: string | null;
  telefono: string | null;
  id_tipo_doc: number;
  numero_doc: string | null;
  nacionalidad: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  es_vip: boolean;
  notas_personal: string | null;
  created_at: string;
  updated_at: string;
  nombre_completo: string; // Calculado por el backend
}

/**
 * ApiEstadoReserva
 * 
 * Estado de reserva en la nueva API.
 */
export interface ApiEstadoReserva {
  id_estado_reserva: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

/**
 * ApiFuenteReserva
 * 
 * Fuente de reserva (Booking.com, directo, etc.).
 */
export interface ApiFuenteReserva {
  id_fuente: number;
  nombre: string;
  codigo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * ApiHabitacion
 * 
 * Detalles completos de una habitación.
 */
export interface ApiHabitacion {
  id_habitacion: number;
  id_estado_hab: number;
  tipo_habitacion_id: number;
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  precio_base: string;
  moneda: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * ApiReservaHabitacion
 * 
 * Asignación de habitación para una reserva en la nueva API.
 * Incluye el objeto habitación completo.
 */
export interface ApiReservaHabitacion {
  id_reserva_hab: number;
  id_reserva: number;
  id_habitacion: number;
  fecha_llegada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  bebes: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  habitacion: ApiHabitacion;
}

/**
 * ApiReservaFull
 * 
 * Reserva completa retornada por la nueva API.
 * Incluye relaciones pobladas (cliente, estado, fuente, habitaciones).
 */
export interface ApiReservaFull {
  id_reserva: number;
  codigo_reserva: string; // Código único de la reserva (ej: "UPUNG4HK")
  id_cliente: number;
  id_estado_reserva: number;
  fecha_creacion: string;
  total_monto_reserva: number;
  notas: string | null;
  id_fuente: number | null;
  created_at: string;
  updated_at: string;
  
  // Relaciones pobladas
  cliente: ApiCliente;
  estado: ApiEstadoReserva;
  fuente: ApiFuenteReserva | null;
  habitaciones: ApiReservaHabitacion[];
}

/**
 * ApiReservasResponse
 * 
 * Respuesta paginada de la API de reservas.
 */
export interface ApiReservasResponse {
  current_page: number;
  data: ApiReservaFull[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * ApiUpdateReservaHabitacionPayload
 * 
 * Payload para actualizar una habitación específica de una reserva.
 * PUT /reservas/{id}/habitaciones/{id_habitacion}
 */
export interface ApiUpdateReservaHabitacionPayload {
  id_habitacion: number;
  fecha_llegada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  bebes: number;
}

/**
 * ApiCancelReservaPayload
 * 
 * Payload para cancelar una reserva.
 * POST /reservas/{id}/cancelar
 */
export interface ApiCancelReservaPayload {
  motivo?: string;
  penalidad?: number;
}
