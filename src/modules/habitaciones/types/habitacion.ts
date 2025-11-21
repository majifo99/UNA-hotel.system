// src/modules/habitaciones/types/habitacion.ts
/**
 * Tipos para el módulo de gestión de habitaciones
 */

/**
 * Estado de habitación
 */
export interface EstadoHabitacion {
  id_estado_hab: number;
  nombre: string; // DISPONIBLE, OCUPADA, SUCIA, LIMPIA, MANTENIMIENTO
}

/**
 * Tipo de habitación
 */
export interface TipoHabitacion {
  id_tipo_hab: number;
  nombre: string;
  descripcion?: string;
}

/**
 * Habitación completa
 */
export interface Habitacion {
  id_habitacion: number;
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  precio_base: string;
  moneda: string;
  estado: EstadoHabitacion;
  tipo: TipoHabitacion;
}

/**
 * Respuesta paginada del backend
 */
export interface HabitacionesResponse {
  data: Habitacion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Filtros para habitaciones
 */
export interface HabitacionFilters {
  search: string;
  estado: string;
  tipo: string;
  piso: string;
}
