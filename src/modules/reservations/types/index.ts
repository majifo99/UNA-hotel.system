/**
 * Reservations Module Types - Central Export
 *
 * All types specific to the reservations module.
 * For shared domain entities (Guest, Room), import from @/types/core
 * 
 * Nueva estructura organizada:
 * - enums/ - Enums y tipos básicos (ReservationStatus, PaymentMethod)
 * - entities/ - Entidades del dominio (Reservation)
 * - api/ - Tipos de la API backend (legacy y new)
 * - forms/ - Tipos de formularios
 * - mappers/ - Funciones de mapeo entre tipos
 */

// Core domain entities (shared)
export type { Guest, Room, AdditionalService } from '../../../types/core';

// === ENUMS ===
export type { ReservationStatus, PaymentMethod } from './enums';

// === ENTITIES ===
export type { Reservation } from './entities';

// === FORMS ===
export type {
  ReservationFormData,
  SimpleReservationFormData,
  ReservationValidationErrors
} from './forms';

// === API TYPES ===
// Legacy API
export type {
  ApiReservation,
  ApiGuest,
  ApiEstado,
  ApiFuente,
  ApiReservaHabitacionLegacy,
  ApiCreateReservaPayload,
} from './api';

// New API
export type {
  ApiReservaFull,
  ApiCliente,
  ApiEstadoReserva,
  ApiFuenteReserva,
  ApiReservaHabitacion,
  ApiHabitacion,
  ApiReservasResponse,
  ApiUpdateReservaHabitacionPayload,
  ApiCancelReservaPayload
} from './api';

// === MAPPERS ===
export {
  mapEstadoIdToStatus,
  mapStatusToEstadoId,
  mapApiReservationToReservation,
  mapSimpleFormToApiPayload,
  mapApiClienteToGuest,
  mapApiHabitacionToRoom,
  mapEstadoNombreToStatus,
  mapApiReservaFullToReservation
} from './mappers';

// === BACKEND DTOs ===
export type {
  ReservationFilters,
  CreateReservationDto,
  CreateReservationRoomDto,
  AddReservationServiceDto,
  BackendAdditionalService
} from './backend';
