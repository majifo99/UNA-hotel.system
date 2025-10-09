/**
 * Reservations Backend Types - UNA Hotel System
 * 
 * Types specific to reservation operations with Laravel backend
 */

// =================== BACKEND RESERVATION TYPES ===================

export interface BackendReservation {
  id_reserva: number;
  id_cliente: number;
  id_estado_res: number;
  fecha_creacion: string;
  total_monto_reserva: number;
  notas?: string;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationRequest {
  id_cliente: number;
  id_estado_res: number;
  total_monto_reserva: number;
  notas?: string;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number;
}

export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  // At least one field must be provided for updates
  id_reserva?: number;
}

// =================== RESERVATION ROOM TYPES ===================

export interface BackendReservationRoom {
  id_reserva_hab: number;
  id_reserva?: number;
  id_habitacion?: number;
  fecha_llegada: string;
  fecha_salida: string;
  pax_total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationRoomRequest {
  id_habitacion: number;
  fecha_llegada: string;
  fecha_salida: string;
  pax_total: number;
}

// =================== RESERVATION SERVICE TYPES ===================

export interface BackendReservationService {
  id_reserva_serv: number;
  id_reserva: number;
  id_servicio: number;
  cantidad: number;
  precio_unitario: number;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationServiceRequest {
  id_servicio: number;
  cantidad: number;
  precio_unitario: number;
  descripcion?: string;
}

// =================== CATALOG TYPES ===================

export interface BackendReservationState {
  id_estado_res: number;
  nombre: string;
  descripcion: string;
}

export interface BackendSource {
  id_fuente: number;
  nombre: string;
  descripcion: string;
}

export interface BackendService {
  id_servicio: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

// =================== SEARCH TYPES ===================

/**
 * Filtros para el listado de reservas
 * Todos los parámetros son opcionales y combinables
 */
export interface ReservationFilters {
  search?: string;       // Busca en email del cliente
  estado?: string;       // Nombre del estado (ej: "Pendiente", "Confirmada")
  fuente?: string;       // Nombre de la fuente (ej: "Booking")
  desde?: string;        // Fecha desde (formato: YYYY-MM-DD)
  hasta?: string;        // Fecha hasta (formato: YYYY-MM-DD)
  page?: number;         // Número de página
  per_page?: number;     // Items por página
}

/**
 * @deprecated Use ReservationFilters instead
 */
export interface ReservationSearchParams {
  cliente?: string;
  estado?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  per_page?: number;
}

// =================== NEW API DTOs ===================

/**
 * DTO para crear una nueva reserva con múltiples habitaciones
 * POST /reservas
 */
export interface CreateReservationDto {
  id_cliente: number;
  id_estado_res: number;
  id_fuente?: number;
  notas?: string;
  habitaciones: CreateReservationRoomDto[];
}

/**
 * DTO para habitación dentro de una reserva
 */
export interface CreateReservationRoomDto {
  id_habitacion: number;
  fecha_llegada: string;   // YYYY-MM-DD
  fecha_salida: string;    // YYYY-MM-DD
  adultos: number;
  ninos: number;
  bebes: number;
}

/**
 * Servicio adicional desde el backend
 * GET /servicios
 */
export interface BackendAdditionalService {
  id_servicio: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria?: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTO para agregar un servicio a una reserva
 * POST /reservas/{id}/servicios
 */
export interface AddReservationServiceDto {
  id_servicio: number;
  cantidad: number;
  descripcion?: string;
  fecha_servicio?: string; // YYYY-MM-DD (opcional)
}

// =================== PAGINATION ===================

export interface BackendPaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}