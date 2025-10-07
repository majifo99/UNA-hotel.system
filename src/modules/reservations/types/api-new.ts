/**
 * Updated Backend API Types - New Structure
 * Matches the new API response from /api/reservas
 */

/**
 * Cliente (Guest) as returned by new API
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
  nombre_completo: string;
}

/**
 * Estado de reserva
 */
export interface ApiEstadoReserva {
  id_estado_reserva: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fuente de reserva (Booking.com, direct, etc.)
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
 * Habitación (Room) details
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
 * Habitación assignment for a reservation
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
 * Full Reservation from new API
 */
export interface ApiReservaFull {
  id_reserva: number;
  id_cliente: number;
  id_estado_reserva: number;
  fecha_creacion: string;
  total_monto_reserva: number;
  notas: string | null;
  id_fuente: number | null;
  created_at: string;
  updated_at: string;
  cliente: ApiCliente;
  estado: ApiEstadoReserva;
  fuente: ApiFuenteReserva | null;
  habitaciones: ApiReservaHabitacion[];
}

/**
 * Paginated API Response
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
