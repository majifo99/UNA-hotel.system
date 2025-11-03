/**
 * API Types Index
 * 
 * Exporta todos los tipos relacionados con la API del backend.
 */

// Legacy API types
export type {
  ApiReservation,
  ApiGuest,
  ApiEstado,
  ApiFuente,
  ApiReservaHabitacion as ApiReservaHabitacionLegacy,
  ApiCreateReservaPayload,
} from './legacy';

// New API types
export type {
  ApiCliente,
  ApiEstadoReserva,
  ApiFuenteReserva,
  ApiHabitacion,
  ApiReservaHabitacion,
  ApiReservaFull,
  ApiReservasResponse,
  ApiUpdateReservaHabitacionPayload,
  ApiCancelReservaPayload,
} from './new';
