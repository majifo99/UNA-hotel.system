/**
 * Reservations Module Types - Central Export
 *
 * All types specific to the reservations module.
 * For shared domain entities (Guest, Room), import from @/types/core
 */

// Core domain entities (shared)
export type { Guest, Room, AdditionalService } from '../../../types/core';

// Reservation-specific domain types
export type {
  Reservation,
  ReservationStatus,
  PaymentMethod,
  ReservationFormData,
  SimpleReservationFormData,
  ReservationValidationErrors
} from './domain';

// Export backend DTOs and mappers (original - legacy)
export type { ApiReservation, ApiReservaHabitacion } from './domain';
export { mapApiReservationToReservation, mapStatusToEstadoId } from './domain';
export type { ApiCreateReservaPayload } from './domain';
export { mapSimpleFormToApiPayload } from './domain';

// Export new backend API types (from /api/reservas/:id endpoint)
// Note: api-new.ts contains types that match the current backend structure
export type {
  ApiReservaFull,
  ApiCliente,
  ApiEstadoReserva,
  ApiFuenteReserva,
  ApiReservaHabitacion as ApiReservaHabitacionFull,
  ApiHabitacion,
  ApiReservasResponse
} from './api-new';

// Export mappers for new API structure
export {
  mapApiClienteToGuest,
  mapApiHabitacionToRoom,
  mapEstadoNombreToStatus,
  mapApiReservaFullToReservation
} from './mappers-new';
