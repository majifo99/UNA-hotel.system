/**
 * Updated Backend API Types - New Structure (October 2025)
 * Matches the actual API response from /api/reservas
 */

/**
 * Cliente (Guest) as returned by new API
 */
export interface ApiCliente {
  id_cliente: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  email: string;
  telefono: string;
  id_tipo_doc: number;
  numero_doc: string;
  nacionalidad: string;
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
  id_estado_res: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

/**
 * Resumen de pagos de la reserva
 */
export interface ApiResumenPagos {
  total_reserva: number;
  monto_pagado: number;
  monto_pendiente: number;
  porcentaje_pagado: number;
  porcentaje_minimo_requerido: number;
  alcanzo_minimo: boolean;
  pago_completo: boolean;
  puede_confirmar: boolean;
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
  codigo_reserva: string | null;
  id_cliente: number;
  id_estado_res: number;
  fecha_creacion: string;
  total_monto_reserva: number;
  monto_pagado: number;
  monto_pendiente: number;
  porcentaje_minimo_pago: number;
  pago_completo: boolean;
  notas: string | null;
  id_fuente: number | null;
  created_at: string;
  updated_at: string;
  porcentaje_pagado: number;
  resumen_pagos: ApiResumenPagos;
  codigo_formateado: string | null;
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
